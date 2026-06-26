'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { AlertCircle, RefreshCw, Timer } from 'lucide-react';

interface QRDisplayProps {
  sessionId: string;
  qrCodeData?: string;
  courseName: string;
  endTime: string;
  rotationIntervalMs?: number;
}

export default function QRDisplay({
  sessionId,
  qrCodeData,
  courseName,
  endTime,
  rotationIntervalMs = 3000,
}: QRDisplayProps) {
  const [qrCodeImage, setQrCodeImage] = useState(qrCodeData || '');
  const [loading, setLoading] = useState(!qrCodeData);
  const [error, setError] = useState('');
  const [secondsLeft, setSecondsLeft] = useState(0);

  const refreshQRCode = useCallback(async () => {
    const expiresAt = new Date(endTime).getTime();

    if (Number.isNaN(expiresAt) || Date.now() >= expiresAt) {
      setError('This session has ended.');
      setLoading(false);
      return false;
    }

    try {
      setLoading(true);
      const res = await fetch(`/api/qr/generate?sessionId=${sessionId}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to refresh QR code');
      }

      setQrCodeImage(data.data.qrImage);
      setSecondsLeft(Math.max(0, Math.floor((new Date(data.data.expiresAt).getTime() - Date.now()) / 1000)));
      setError('');
      return true;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to refresh QR code');
      return false;
    } finally {
      setLoading(false);
    }
  }, [endTime, sessionId]);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => {
      void refreshQRCode();
    }, 0);

    return () => window.clearTimeout(initialLoad);
  }, [refreshQRCode]);

  useEffect(() => {
    if (!qrCodeImage) return;

    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(endTime).getTime() - Date.now()) / 1000));
      setSecondsLeft(remaining);
      if (remaining <= 0) {
        setError('This session has ended.');
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [endTime, qrCodeImage]);

  useEffect(() => {
    if (!qrCodeImage || error) return;

    const interval = window.setInterval(() => {
      void refreshQRCode();
    }, rotationIntervalMs);

    return () => window.clearInterval(interval);
  }, [error, qrCodeImage, refreshQRCode, rotationIntervalMs]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{courseName}</h3>
          <p className="text-sm text-text-secondary">QR updates every 3 seconds to prevent proxy attendance.</p>
        </div>

        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-slate-200">
          {loading && !qrCodeImage ? (
            <div className="w-full aspect-square bg-slate-50 rounded flex flex-col items-center justify-center gap-2 text-text-secondary">
              <RefreshCw className="h-5 w-5 animate-spin" />
              <p className="text-sm">Refreshing QR code...</p>
            </div>
          ) : error ? (
            <div className="w-full aspect-square bg-red-50 rounded flex flex-col items-center justify-center gap-2 text-red-700 p-6 text-center">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          ) : (
            <Image
              src={qrCodeImage}
              alt="Session QR Code"
              width={320}
              height={320}
              unoptimized
              className="w-full h-auto rounded-md"
            />
          )}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="font-semibold text-blue-900 mb-2">Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 text-xs">
            <li>Display this QR code on your screen or projector</li>
            <li>Students scan with their phones</li>
            <li>The code rotates every 3 seconds</li>
          </ol>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-text-secondary">
          <Timer className="h-4 w-4" />
          Expires in {formatTime(secondsLeft)}
        </div>
      </div>
    </div>
  );
}
