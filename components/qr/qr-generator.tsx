'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface QRGeneratorProps {
  sessionId: string;
}

export default function QRGenerator({ sessionId }: QRGeneratorProps) {
  const [qrData, setQrData] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const fetchQR = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/qr/generate?sessionId=${sessionId}`);
      const result = await res.json();

      if (result.success) {
        setQrData(result.data.qrImage);
        
        // Calculate time left in seconds
        const expiry = new Date(result.data.expiresAt).getTime();
        const now = new Date().getTime();
        setTimeLeft(Math.max(0, Math.floor((expiry - now) / 1000)));
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError('Failed to load QR code');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionId) {
      fetchQR();
    }
  }, [sessionId]);

  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) return <div className="p-8 text-center">Generating secure QR code...</div>;
  if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Scan to Mark Attendance</h3>
      
      {qrData && (
        <div className="relative p-4 bg-gray-50 rounded-lg border-2 border-indigo-500">
          <Image 
            src={qrData} 
            alt="Session QR Code" 
            width={300} 
            height={300}
            className="rounded-md"
          />
        </div>
      )}

      {timeLeft !== null && (
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-500 uppercase tracking-wider font-semibold">Code Expires In</p>
          <p className={`text-3xl font-mono font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-indigo-600'}`}>
            {formatTime(timeLeft)}
          </p>
        </div>
      )}

      <button 
        onClick={fetchQR}
        className="mt-6 px-4 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        Refresh Code
      </button>
    </div>
  );
}
