import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';
import Attendance from '@/models/attendance.model';
import User from '@/models/user.model';

export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { qrCode, studentId, location } = body;

    if (!qrCode || !studentId) {
      return NextResponse.json(
        { success: false, error: 'QR Code and Student ID are required' },
        { status: 400 }
      );
    }

    // 1. Find the session linked to this QR code
    const session = await Session.findOne({ qrCode }).populate('course');

    if (!session) {
      return NextResponse.json({ success: false, error: 'Invalid QR Code' }, { status: 404 });
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
      status: 'present',
    });

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance,
    }, { status: 201 });

  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
