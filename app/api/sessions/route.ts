import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';
import crypto from 'crypto';

// GET: Fetch all sessions (optionally filter by course or lecturer)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lecturerId = searchParams.get('lecturerId');

    const query: any = {};
    if (courseId) query.course = courseId;
    if (lecturerId) query.lecturer = lecturerId;

    const sessions = await Session.find(query)
      .populate('course', 'title code')
      .populate('lecturer', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: sessions }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Start a new session
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { courseId, lecturerId, durationInMinutes } = body;

    if (!courseId || !lecturerId || !durationInMinutes) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: courseId, lecturerId, durationInMinutes' },
        { status: 400 }
      );
    }

    // Calculate end time
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + durationInMinutes * 60000);

    // Generate a secure unique token for the QR code
    const qrCodeToken = crypto.randomBytes(32).toString('hex');

    const session = await Session.create({
      course: courseId,
      lecturer: lecturerId,
      startTime,
      endTime,
      qrCode: qrCodeToken,
      status: 'active',
    });

    return NextResponse.json({ success: true, data: session }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
