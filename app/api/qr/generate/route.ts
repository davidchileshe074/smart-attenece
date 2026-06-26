import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import Session from '@/models/session.model';
import { generateQRCode } from '@/lib/qr';
import { createRotatingQrToken, QR_ROTATION_MS } from '@/lib/dynamic-qr';

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

    const { token, expiresAt } = createRotatingQrToken(String(session._id), session.qrCode);
    const qrImage = await generateQRCode(token);

    return NextResponse.json({
      success: true,
      data: {
        qrImage,
        expiresAt,
        rotationIntervalMs: QR_ROTATION_MS,
      }
    }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Failed to generate QR code' },
      { status: 500 }
    );
  }
}
