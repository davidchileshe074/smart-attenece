'use client';

import { useState, useEffect } from 'react';
import QRScanner from '@/components/qr/qr-scanner';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentScanPage() {
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  type ScanResult = { success?: boolean; message?: string; error?: string };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();

        if (data.success && data.data.role === 'student') {
          setStudentId(data.data.id);
        } else {
          setStatus({ type: 'error', message: data.error || 'Unable to load your student profile.' });
        }
      } catch {
        setStatus({ type: 'error', message: 'Unable to load your student profile.' });
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleScanSuccess = (result: ScanResult) => {
    if (result.success) {
      setStatus({ type: 'success', message: result.message || 'Attendance marked successfully!' });
    } else {
      setStatus({ type: 'error', message: result.error || 'Verification failed.' });
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-md space-y-6 px-4 py-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-md" />
        <div className="card h-80 w-full animate-pulse bg-slate-50" />
        <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
      <div className="mb-6 sm:mb-8 text-center">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Scan QR Code</h1>
        <p className="text-sm sm:text-base text-text-secondary">
          Point your camera at the session QR code displayed by the lecturer.
        </p>
      </div>

      {status ? (
        <div
          className={`card text-center py-10 sm:py-12 animate-in fade-in zoom-in duration-300 ${
            status.type === 'success' ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'
          }`}
        >
          <div className="flex justify-center mb-5 sm:mb-6">
            {status.type === 'success' ? (
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-success text-white rounded-full flex items-center justify-center shadow-lg shadow-success/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 bg-error text-white rounded-full flex items-center justify-center shadow-lg shadow-error/20">
                <AlertCircle className="h-10 w-10" />
              </div>
            )}
          </div>
          <h2 className={`text-xl sm:text-2xl font-bold mb-2 ${status.type === 'success' ? 'text-success' : 'text-error'}`}>
            {status.type === 'success' ? 'Verified!' : 'Scan Failed'}
          </h2>
          <p className="text-sm sm:text-base text-text-secondary mb-6 sm:mb-8">{status.message}</p>
          <button onClick={() => setStatus(null)} className="btn-secondary">
            Scan Another Code
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card !p-0 overflow-hidden relative border-2 border-primary/20">
            <div className="bg-slate-900 rounded-[inherit] p-4 sm:p-6 flex items-center justify-center text-white">
              {studentId ? (
                <QRScanner
                  studentId={studentId}
                  onSuccess={handleScanSuccess}
                  onError={(err) => setStatus({ type: 'error', message: err })}
                />
              ) : (
                <p className="text-sm text-slate-300 px-6 text-center">
                  Your student ID is missing from your profile. Contact an administrator to update it.
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 p-4 bg-primary/5 rounded-md border border-primary/10">
            <div className="h-10 w-10 bg-white rounded-md border border-primary/20 flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary leading-tight">Camera Active</p>
              <p className="text-[11px] text-text-secondary uppercase font-bold tracking-wider">
                Secured via End-to-End Encryption
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
