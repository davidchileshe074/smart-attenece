import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Course from '@/models/course.model';
import Session from '@/models/session.model';
import Attendance from '@/models/attendance.model';

type Params = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Params) {
  try {
    await connectDB();
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const lecturerId = searchParams.get('lecturerId');

    const query: Record<string, unknown> = { _id: id };
    if (lecturerId) {
      query.lecturer = lecturerId;
    }

    const course = await Course.findOne(query)
      .populate('lecturer', 'name email')
      .populate('students', 'name studentId email');

    if (!course) {
      return NextResponse.json({ success: false, error: 'Course not found' }, { status: 404 });
    }

    const [sessions, attendance] = await Promise.all([
      Session.find({ course: course._id }).sort({ createdAt: -1 }).lean(),
      Attendance.find({ course: course._id })
        .populate('student', 'name studentId email')
        .sort({ timestamp: -1 })
        .lean(),
    ]);

    const enrolledStudents = Array.isArray(course.students) ? course.students : [];
    const recordedStudents = new Map<
      string,
      { _id: string; name: string; studentId: string; email?: string }
    >();

    for (const record of attendance) {
      const student = record.student as
        | { _id?: { toString(): string } | string; name?: string; studentId?: string; email?: string }
        | undefined;
      const studentId = student?._id ? student._id.toString() : '';
      if (!studentId || recordedStudents.has(studentId)) continue;

      recordedStudents.set(studentId, {
        _id: studentId,
        name: student?.name || 'Unknown Student',
        studentId: student?.studentId || 'N/A',
        email: student?.email,
      });
    }

    const payload = {
      ...(typeof course.toObject === 'function' ? course.toObject() : course),
      studentCount: enrolledStudents.length,
      recordedStudentCount: recordedStudents.size,
      recordedStudents: Array.from(recordedStudents.values()),
      sessionCount: sessions.length,
      activeSessionCount: sessions.filter((session) => session.status === 'active').length,
      recentSessions: sessions.slice(0, 6),
    };

    return NextResponse.json({ success: true, data: payload }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load course' },
      { status: 500 }
    );
  }
}
