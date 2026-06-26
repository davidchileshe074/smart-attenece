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
  classSize?: number;
  sessionCount?: number;
};

type CourseWithStudents = {
  students?: Array<{ toString(): string } | string>;
};

function summarize(records: AttendanceRecord[], options: SummaryOptions = {}) {
  const totalRecords = records.length;
  const presentCount = records.filter((record) => record.status === 'present').length;
  const lateCount = records.filter((record) => record.status === 'late').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;
  const benchmarkRecords =
    options.classSize && options.sessionCount ? options.classSize * options.sessionCount : 0;
  const classAttendanceRate =
    benchmarkRecords > 0 ? Math.round((presentCount / benchmarkRecords) * 100) : attendanceRate;

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
    classSize: options.classSize || 0,
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
      const [sessions, courses] = await Promise.all([
        Session.find({ lecturer: lecturerObjectId }).select('_id'),
        Course.find({ lecturer: lecturerObjectId }).select('students'),
      ]);
      const typedCourses = courses as CourseWithStudents[];

      query.session = { $in: sessions.map((session) => session._id) };
      summaryOptions = {
        classSize: new Set(
          typedCourses.flatMap((course) =>
            (course.students || []).map((studentId) =>
              typeof studentId === 'string' ? studentId : studentId.toString()
            )
          )
        ).size,
        sessionCount: sessions.length,
      };
    } else {
      const [sessions, courses] = await Promise.all([
        Session.find().select('_id'),
        Course.find().select('students'),
      ]);
      const typedCourses = courses as CourseWithStudents[];

      query.session = { $in: sessions.map((session) => session._id) };
      summaryOptions = {
        classSize: new Set(
          typedCourses.flatMap((course) =>
            (course.students || []).map((studentId) =>
              typeof studentId === 'string' ? studentId : studentId.toString()
            )
          )
        ).size,
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
