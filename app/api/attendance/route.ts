import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/attendance.model';
import Session from '@/models/session.model';

type AttendanceRecord = {
  student?: { _id?: string; name?: string; studentId?: string; email?: string };
  course?: { title?: string; code?: string };
  session?: { _id?: string; startTime?: string; endTime?: string; status?: string };
  status?: 'present' | 'late';
};

function summarize(records: AttendanceRecord[]) {
  const totalRecords = records.length;
  const presentCount = records.filter((record) => record.status === 'present').length;
  const lateCount = records.filter((record) => record.status === 'late').length;
  const attendanceRate = totalRecords > 0 ? Math.round((presentCount / totalRecords) * 100) : 0;

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

    if (studentId) {
      query.student = studentId;
    } else if (lecturerId) {
      const sessions = await Session.find({ lecturer: lecturerId }).select('_id');
      query.session = { $in: sessions.map((session) => session._id) };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId email')
      .populate('session', 'startTime endTime status')
      .populate('course', 'title code')
      .sort({ timestamp: -1 });

    return NextResponse.json(
      {
        success: true,
        data: attendance,
        summary: summarize(attendance),
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
