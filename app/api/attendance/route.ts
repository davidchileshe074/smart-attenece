import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import Attendance from '@/models/attendance.model';
import Session from '@/models/session.model';
import Course from '@/models/course.model';

type AttendanceRecord = {
  student?: { _id?: string; name?: string; studentId?: string; email?: string };
  course?: { title?: string; code?: string };
  session?: { _id?: string; startTime?: string; endTime?: string; status?: string };
  status?: 'present' | 'late';
};

type SummaryOptions = {
  sessionClassSizes?: Map<string, number>;
  sessionCount?: number;
};

type CourseWithStudents = {
  _id?: { toString(): string } | string;
  students?: Array<{ toString(): string } | string>;
};

type SessionWithMetadata = {
  _id?: { toString(): string } | string;
  course?: { toString(): string } | string;
  expectedStudentCount?: number | null;
};

function toId(value: { toString(): string } | string | undefined) {
  return value ? value.toString() : '';
}

function buildClassSizeMap(sessions: SessionWithMetadata[], courses: CourseWithStudents[]) {
  const courseSizeMap = new Map<string, number>();

  for (const course of courses) {
    const courseId = toId(course._id);
    if (!courseId) continue;

    const uniqueStudents = new Set(
      (course.students || []).map((studentId) => studentId.toString())
    );
    courseSizeMap.set(courseId, uniqueStudents.size);
  }

  const sessionClassSizes = new Map<string, number>();

  for (const session of sessions) {
    const sessionId = toId(session._id);
    const courseId = toId(session.course);
    if (!sessionId) continue;

    const fallbackCourseSize = courseId ? courseSizeMap.get(courseId) || 0 : 0;
    const explicitCount =
      typeof session.expectedStudentCount === 'number' && Number.isFinite(session.expectedStudentCount)
        ? Math.max(0, Math.floor(session.expectedStudentCount))
        : null;

    sessionClassSizes.set(sessionId, explicitCount ?? fallbackCourseSize);
  }

  return sessionClassSizes;
}

function summarize(records: AttendanceRecord[], options: SummaryOptions = {}) {
  const totalRecords = records.length;
  const presentCount = records.filter((record) => record.status === 'present').length;
  const lateCount = records.filter((record) => record.status === 'late').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

  const totalExpectedStudents = Array.from(options.sessionClassSizes?.values() || []).reduce(
    (sum, value) => sum + value,
    0
  );

  const classAttendanceRate =
    totalExpectedStudents > 0
      ? Math.round(((presentCount + lateCount) / totalExpectedStudents) * 100)
      : attendanceRate;

  const studentMap = new Map<string, { name: string; studentId: string; email?: string; present: number; total: number }>();

  for (const record of records) {
    const studentId = record.student?._id?.toString();
    if (!studentId) continue;

    const current = studentMap.get(studentId) || {
      name: record.student?.name || 'Unknown Student',
      studentId: record.student?.studentId || 'N/A',
      email: record.student?.email,
      present: 0,
      total: 0,
    };

    current.total += 1;
    if (record.status === 'present') {
      current.present += 1;
    }

    studentMap.set(studentId, current);
  }

  const lowAttendanceAlerts = Array.from(studentMap.values())
    .map((student) => ({
      ...student,
      rate: student.total > 0 ? Math.round((student.present / student.total) * 100) : 0,
    }))
    .filter((student) => student.total >= 3 && student.rate < 75)
    .sort((a, b) => a.rate - b.rate);

  return {
    totalRecords,
    presentCount,
    lateCount,
    attendanceRate,
    classAttendanceRate,
    classSize: totalExpectedStudents,
    totalStudents: totalExpectedStudents,
    sessionCount: options.sessionCount || 0,
    lowAttendanceAlerts,
  };
}

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    const lecturerId = searchParams.get('lecturerId');

    const query: Record<string, unknown> = {};
    let summaryOptions: SummaryOptions = {};

    if (studentId) {
      if (!mongoose.Types.ObjectId.isValid(studentId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid student ID format' },
          { status: 400 }
        );
      }
      query.student = new mongoose.Types.ObjectId(studentId);
    } else if (lecturerId) {
      if (!mongoose.Types.ObjectId.isValid(lecturerId)) {
        return NextResponse.json(
          { success: false, error: 'Invalid lecturer ID format' },
          { status: 400 }
        );
      }
      const lecturerObjectId = new mongoose.Types.ObjectId(lecturerId);
      const [sessionsRaw, coursesRaw] = await Promise.all([
        Session.find({ lecturer: lecturerObjectId }).select('_id course expectedStudentCount').lean(),
        Course.find({ lecturer: lecturerObjectId }).select('_id students').lean(),
      ]);
      const sessions = sessionsRaw as SessionWithMetadata[];
      const courses = coursesRaw as CourseWithStudents[];

      query.session = { $in: sessions.map((session) => session._id) };
      summaryOptions = {
        sessionClassSizes: buildClassSizeMap(sessions, courses),
        sessionCount: sessions.length,
      };
    } else {
      const [sessionsRaw, coursesRaw] = await Promise.all([
        Session.find().select('_id course expectedStudentCount').lean(),
        Course.find().select('_id students').lean(),
      ]);
      const sessions = sessionsRaw as SessionWithMetadata[];
      const courses = coursesRaw as CourseWithStudents[];

      query.session = { $in: sessions.map((session) => session._id) };
      summaryOptions = {
        sessionClassSizes: buildClassSizeMap(sessions, courses),
        sessionCount: sessions.length,
      };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId email')
      .populate('session', 'startTime endTime status')
      .populate('course', 'title code')
      .sort({ timestamp: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: attendance,
        summary: summarize(attendance, summaryOptions),
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    console.error('[Attendance API Error]', {
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'UnknownError',
    });
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
