import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';
import crypto from 'crypto';
import { publishRealtimeEvent } from '@/lib/realtime';

// GET: Fetch all sessions (optionally filter by course or lecturer)
export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get('courseId');
    const lecturerId = searchParams.get('lecturerId');

    const query: Record<string, string> = {};
    if (courseId) query.course = courseId;
    if (lecturerId) query.lecturer = lecturerId;

    const sessions = await Session.find(query)
      .populate('course', 'title code')
      .populate('lecturer', 'name')
      .sort({ createdAt: -1 });

    return NextResponse.json({ success: true, data: sessions }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to load sessions' },
      { status: 500 }
    );
  }
}

// POST: Start a new session
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();
    const { courseId, lecturerId, durationInMinutes, expectedStudentCount } = body;

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
      expectedStudentCount:
        typeof expectedStudentCount === 'number' && Number.isFinite(expectedStudentCount)
          ? Math.max(0, Math.floor(expectedStudentCount))
          : undefined,
    });

    const populatedSession = await Session.findById(session._id).populate('course', 'title code');

    if (populatedSession && populatedSession.course) {
      const populatedCourse = populatedSession.course as {
        _id: unknown;
        code: string;
        title: string;
      };

      await publishRealtimeEvent('session:created', {
        sessionId: String(populatedSession._id),
        lecturerId: String(populatedSession.lecturer),
        course: {
          id: String(populatedCourse._id),
          code: populatedCourse.code,
          title: populatedCourse.title,
        },
        startTime: populatedSession.startTime.toISOString(),
        endTime: populatedSession.endTime.toISOString(),
        status: populatedSession.status,
      });
    }

    return NextResponse.json({ success: true, data: populatedSession || session }, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to create session' },
      { status: 500 }
    );
  }
}
