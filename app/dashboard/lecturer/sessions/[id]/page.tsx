'use client';

import { use, useCallback, useEffect, useState } from 'react';
import { ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import QRDisplay from '@/components/lecturer/qr-display';
import LiveAttendance from '@/components/lecturer/live-attendance';

interface SessionData {
  _id: string;
  course: { title: string; code: string };
  startTime: string;
  endTime: string;
  status: string;
  qrCode: string;
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: sessionId } = use(params);
  const [session, setSession] = useState<SessionData | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/sessions/${sessionId}`);
      const data = await res.json();

      if (data.success) {
        setSession(data.data);

        if (data.data.status === 'active') {
          // Fetch QR code image only while the session is active.
          const qrRes = await fetch(`/api/qr/generate?sessionId=${sessionId}`);
          const qrData = await qrRes.json();
          if (qrData.success) {
            setQrCodeImage(qrData.data.qrImage);
          } else {
            setQrCodeImage('');
          }
        } else {
          setQrCodeImage('');
          setTimeRemaining(0);
        }

        // Calculate initial time remaining
        const now = new Date().getTime();
        const endTime = new Date(data.data.endTime).getTime();
        setTimeRemaining(Math.max(0, Math.floor((endTime - now) / 1000)));
      } else {
        setError(data.error || 'Failed to load session');
      }
    } catch {
      setError('Failed to load session');
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void fetchSession();
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [fetchSession]);

  useEffect(() => {
    if (!session) return;

    if (session.status !== 'active') {
      return;
    }

    // Update time remaining
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const endTime = new Date(session.endTime).getTime();
      const remaining = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeRemaining(remaining);

      if (remaining === 0) {
        clearInterval(timer);
        // Refresh once so the UI picks up the expired state, then stop polling.
        void fetchSession();
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [fetchSession, session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin text-4xl mb-4">⏳</div>
          <p className="text-text-secondary">Loading session...</p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/lecturer/sessions" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Sessions
        </Link>

        <div className="card">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error || 'Session not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  const isActive = session.status === 'active';
  const isExpired = session.status === 'expired';

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/lecturer/sessions" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Sessions
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">{session.course.code}</h1>
            <p className="text-text-secondary mt-1">{session.course.title}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-text-secondary">Status</p>
            <span
              className={`inline-block mt-1 px-4 py-2 text-sm font-bold rounded-full ${
                isActive
                  ? 'bg-green-100 text-green-700'
                  : isExpired
                  ? 'bg-gray-100 text-gray-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {isActive ? '🔴 Active' : isExpired ? '⏹ Ended' : '📅 Scheduled'}
            </span>
          </div>
        </div>
      </div>

      {/* Alert for expired sessions */}
      {isExpired && (
        <div className="flex gap-3 p-4 bg-orange-50 border border-orange-200 rounded-lg text-orange-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold">Session Ended</p>
            <p className="text-sm mt-1">This session is no longer accepting attendance marks.</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* QR Code Display */}
        <div className="lg:col-span-1">
          {qrCodeImage && (
            <QRDisplay
              sessionId={session._id}
              qrCodeData={qrCodeImage}
              courseName={`${session.course.code} - ${session.course.title}`}
              endTime={session.endTime}
            />
          )}
        </div>

        {/* Live Attendance */}
        <div className="lg:col-span-2">
          {isActive && (
            <LiveAttendance
              sessionId={session._id}
              courseName={`${session.course.code}`}
              timeRemaining={timeRemaining}
            />
          )}
          {!isActive && (
            <div className="card">
              <p className="text-text-secondary text-center py-12">
                Attendance tracking is not available for this session
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Session Details */}
      <div className="card">
        <h3 className="text-lg font-bold text-text-primary mb-4">Session Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase">Started</p>
            <p className="text-text-primary mt-1">
              {new Date(session.startTime).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase">Ends</p>
            <p className="text-text-primary mt-1">
              {new Date(session.endTime).toLocaleString()}
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase">Duration</p>
            <p className="text-text-primary mt-1">
              {Math.floor(
                (new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000
              )}{' '}
              minutes
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-text-secondary uppercase">QR Token</p>
            <p className="text-text-primary mt-1 font-mono text-sm truncate">{session.qrCode}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
