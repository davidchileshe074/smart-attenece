import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';
import { generateQRCode } from '@/lib/qr';

export async function GET(req: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const session = await Session.findById(sessionId);

    if (!session) {
      return NextResponse.json({ success: false, error: 'Session not found' }, { status: 404 });
    }

    if (session.status !== 'active') {
      return NextResponse.json({ success: false, error: 'Session is no longer active' }, { status: 400 });
    }

    // Generate the QR image data URL
    const qrImage = await generateQRCode(session.qrCode);

    return NextResponse.json({
      success: true,
      data: {
        qrImage,
        expiresAt: session.endTime,
      }
    }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
