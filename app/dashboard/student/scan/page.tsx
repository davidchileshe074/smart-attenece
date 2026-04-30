'use client';

import { useState, useEffect } from 'react';
import QRScanner from '@/components/qr/qr-scanner';
import { Camera, CheckCircle2, AlertCircle } from 'lucide-react';

export default function StudentScanPage() {
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  // Simulate initial loading for Skeleton demonstration
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleScanSuccess = (result: any) => {
    if (result.success) {
      setStatus({ type: 'success', message: result.message || 'Attendance marked successfully!' });
    } else {
      setStatus({ type: 'error', message: result.error || 'Verification failed.' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="h-8 w-48 bg-slate-200 animate-pulse rounded-md" />
        <div className="card h-80 w-full animate-pulse bg-slate-50" />
        <div className="h-10 w-full bg-slate-200 animate-pulse rounded-md" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto py-10">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Scan QR Code</h1>
        <p className="text-text-secondary">Point your camera at the session QR code displayed by the lecturer.</p>
      </div>

      {status ? (
        <div className={`card text-center py-12 animate-in fade-in zoom-in duration-300 ${
          status.type === 'success' ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'
        }`}>
          <div className="flex justify-center mb-6">
            {status.type === 'success' ? (
              <div className="h-20 w-20 bg-success text-white rounded-full flex items-center justify-center shadow-lg shadow-success/20">
                <CheckCircle2 className="h-10 w-10" />
              </div>
            ) : (
              <div className="h-20 w-20 bg-error text-white rounded-full flex items-center justify-center shadow-lg shadow-error/20">
                <AlertCircle className="h-10 w-10" />
              </div>
            )}
          </div>
          <h2 className={`text-2xl font-bold mb-2 ${status.type === 'success' ? 'text-success' : 'text-error'}`}>
            {status.type === 'success' ? 'Verified!' : 'Scan Failed'}
          </h2>
          <p className="text-text-secondary mb-8">{status.message}</p>
          <button 
            onClick={() => setStatus(null)}
            className="btn-secondary"
          >
            Scan Another Code
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="card !p-0 overflow-hidden relative border-2 border-primary/20">
             {/* Scanner Placeholder Logic */}
             <div className="bg-slate-900 aspect-square flex items-center justify-center text-white">
                <QRScanner 
                  studentId="671111111111111111111111" 
                  onSuccess={handleScanSuccess}
                  onError={(err) => setStatus({ type: 'error', message: err })}
                />
             </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-primary/5 rounded-md border border-primary/10">
            <div className="h-10 w-10 bg-white rounded-md border border-primary/20 flex items-center justify-center shrink-0">
              <Camera className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm font-bold text-primary leading-tight">Camera Active</p>
              <p className="text-[11px] text-text-secondary uppercase font-bold tracking-wider">Secured via End-to-End Encryption</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
