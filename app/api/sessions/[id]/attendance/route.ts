import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Attendance from '@/models/attendance.model';

// GET attendance for a specific session
export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id: sessionId } = await params;

    const attendance = await Attendance.find({ session: sessionId })
      .populate('student', 'name studentId email')
      .sort({ timestamp: -1 });

    return NextResponse.json({ success: true, data: attendance }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load session attendance' },
      { status: 500 }
    );
  }
}
