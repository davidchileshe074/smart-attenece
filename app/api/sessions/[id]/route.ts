import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';
import Attendance from '@/models/attendance.model';

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const session = await Session.findById(id)
      .populate('course', 'title code')
      .populate('lecturer', 'name email');

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    // Check if session has expired based on current time
    const now = new Date();
    if (session.status === 'active' && now > session.endTime) {
      session.status = 'expired';
      await session.save();
    }

    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();

    const session = await Session.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!status || !['active', 'expired', 'scheduled'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status. Must be one of: active, expired, scheduled' },
        { status: 400 }
      );
    }

    const session = await Session.findByIdAndUpdate(
      id,
      { status, ...(status === 'expired' ? { endTime: new Date() } : {}) },
      { new: true }
    );

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();
    const { id } = params;

    const session = await Session.findById(id);
    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    // Prevent deletion of active sessions
    if (session.status === 'active') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete an active session. Please end it first.' },
        { status: 400 }
      );
    }

    await Session.findByIdAndDelete(id);

    return NextResponse.json({ success: true, message: 'Session deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
