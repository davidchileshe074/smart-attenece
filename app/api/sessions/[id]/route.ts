import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';
import { publishRealtimeEvent } from '@/lib/realtime';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

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
      const populatedCourse = session.course as {
        _id: unknown;
        code: string;
        title: string;
      };
      await publishRealtimeEvent('session:expired', {
        sessionId: String(session._id),
        lecturerId: String(session.lecturer),
        course: {
          id: String(populatedCourse._id),
          code: populatedCourse.code,
          title: populatedCourse.title,
        },
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        status: session.status,
      });
    }

    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();

    const session = await Session.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    }).populate('course', 'title code');

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to update session' },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
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
    ).populate('course', 'title code');

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    if (status === 'expired' && session) {
      await session.populate('course', 'title code');
      const populatedCourse = session.course as {
        _id: unknown;
        code: string;
        title: string;
      };

      await publishRealtimeEvent('session:expired', {
        sessionId: String(session._id),
        lecturerId: String(session.lecturer),
        course: {
          id: String(populatedCourse._id),
          code: populatedCourse.code,
          title: populatedCourse.title,
        },
        startTime: session.startTime.toISOString(),
        endTime: session.endTime.toISOString(),
        status: session.status,
      });
    }

    return NextResponse.json({ success: true, data: session }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to change session status' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

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
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to delete session' },
      { status: 500 }
    );
  }
}
