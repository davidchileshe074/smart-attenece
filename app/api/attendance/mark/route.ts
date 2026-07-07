import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';
import Attendance from '@/models/attendance.model';
import User from '@/models/user.model';
import { publishRealtimeEvent } from '@/lib/realtime';
import { QR_TOKEN_SECRET, verifyRotatingQrToken } from '@/lib/dynamic-qr';

const LATE_ATTENDANCE_THRESHOLD_MINUTES = 10;

type PopulatedSession = {
  _id: unknown;
  status: 'active' | 'expired' | 'scheduled';
  startTime: Date;
  endTime: Date;
  lecturer: unknown;
  qrNonce: number;
  course: {
    _id: unknown;
    code: string;
    title: string;
  };
  save: () => Promise<unknown>;
};

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { qrCode, studentId, location } = body;
    const normalizedQrCode = typeof qrCode === 'string' ? qrCode.trim() : '';

    if (!normalizedQrCode || !studentId) {
      return NextResponse.json(
        { success: false, error: 'QR Code and Student ID are required' },
        { status: 400 }
      );
    }

    let session: PopulatedSession | null = null;

    // 1. Try to resolve the rotating token first.
    const tokenMatch = verifyRotatingQrToken(normalizedQrCode, QR_TOKEN_SECRET);

    if (tokenMatch.valid && tokenMatch.sessionId) {
      session = (await Session.findById(tokenMatch.sessionId).populate('course')) as PopulatedSession | null;
    } else {
      // Backward compatibility for legacy static tokens already stored in the database.
      session = (await Session.findOne({ qrCode: normalizedQrCode }).populate('course')) as PopulatedSession | null;
    }

    if (!session) {
      return NextResponse.json({ success: false, error: 'Invalid or expired QR Code' }, { status: 404 });
    }

    // 2. Check if session is active
    const now = new Date();
    if (session.status !== 'active' || now > session.endTime) {
      // Auto-update status if it's expired
      if (session.status === 'active') {
        session.status = 'expired';
        await session.save();
      }
      return NextResponse.json({ success: false, error: 'This session has expired' }, { status: 400 });
    }

    const lateCutoff = new Date(session.startTime.getTime() + LATE_ATTENDANCE_THRESHOLD_MINUTES * 60000);

    if (tokenMatch.valid) {
      const currentNonce = typeof session.qrNonce === 'number' ? session.qrNonce : 0;
      if (tokenMatch.nonce !== currentNonce) {
        return NextResponse.json({ success: false, error: 'Invalid or expired QR Code' }, { status: 404 });
      }

      const reservedSession = await Session.findOneAndUpdate(
        {
          _id: session._id,
          status: 'active',
          endTime: { $gt: now },
          qrNonce: currentNonce,
        },
        { $inc: { qrNonce: 1 } },
        { new: true }
      ).populate('course');

      if (!reservedSession) {
        return NextResponse.json({ success: false, error: 'Invalid or expired QR Code' }, { status: 404 });
      }

      session = reservedSession as PopulatedSession;
    }

    // 3. Verify student exists
    const student = await User.findById(studentId);
    if (!student || student.role !== 'student') {
      return NextResponse.json({ success: false, error: 'Valid student ID required' }, { status: 403 });
    }

    // 4. Check if already marked
    const existingRecord = await Attendance.findOne({
      student: studentId,
      session: session._id,
    });

    if (existingRecord) {
      return NextResponse.json(
        { success: true, message: 'Attendance already marked', data: existingRecord },
        { status: 200 }
      );
    }

    // 5. Mark Attendance
    const attendance = await Attendance.create({
      student: studentId,
      session: session._id,
      course: session.course._id,
      location: location || { type: 'Point', coordinates: [0, 0] },
      status: now > lateCutoff ? 'late' : 'present',
    });

    const populatedAttendance = await Attendance.findById(attendance._id)
      .populate('student', 'name studentId')
      .populate('course', 'title code');

    if (populatedAttendance) {
      const populatedStudent = populatedAttendance.student as {
        _id: unknown;
        name: string;
        studentId: string;
      };
      const populatedCourse = session.course as {
        _id: unknown;
        code: string;
        title: string;
      };

      await publishRealtimeEvent('attendance:marked', {
        attendanceId: String(populatedAttendance._id),
        sessionId: String(session._id),
        lecturerId: String(session.lecturer),
        course: {
          id: String(populatedCourse._id),
          code: populatedCourse.code,
          title: populatedCourse.title,
        },
        student: {
          id: String(populatedStudent._id),
          name: populatedStudent.name,
          studentId: populatedStudent.studentId,
        },
        timestamp: new Date(populatedAttendance.timestamp).toISOString(),
        status: populatedAttendance.status,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    }, { status: 201 });

  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to mark attendance' },
      { status: 500 }
    );
  }
}
