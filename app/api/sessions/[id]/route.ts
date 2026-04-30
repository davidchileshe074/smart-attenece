import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';

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
