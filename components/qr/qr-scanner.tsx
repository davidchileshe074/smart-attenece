'use client';

import { useEffect, useState } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

interface QRScannerProps {
  studentId: string;
  onSuccess: (data: any) => void;
  onError: (error: string) => void;
}

export default function QRScanner({ studentId, onSuccess, onError }: QRScannerProps) {
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!scanning) return;

    const scanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      /* verbose= */ false
    );

    scanner.render(
      async (decodedText) => {
        // Success
        scanner.clear();
        setScanning(false);
        
        try {
          const res = await fetch('/api/attendance/mark', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              qrCode: decodedText,
              studentId: studentId
            })
          });
          const result = await res.json();
          onSuccess(result);
        } catch (err) {
          onError('Failed to process attendance');
        }
      },
      (error) => {
        // Error (silent usually)
      }
    );

    return () => {
      scanner.clear().catch(err => console.error("Scanner clear failed", err));
    };
  }, [scanning, studentId]);

  return (
    <div className="w-full max-w-md mx-auto">
      {!scanning ? (
        <button 
          onClick={() => setScanning(true)}
          className="btn-primary w-full py-6 text-xl shadow-2xl"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Open QR Scanner
        </button>
      ) : (
        <div className="glass-card">
          <div id="reader" className="overflow-hidden rounded-xl"></div>
          <button 
            onClick={() => setScanning(false)}
            className="w-full mt-4 py-2 text-gray-500 font-semibold"
          >
            Cancel Scan
          </button>
        </div>
      )}
    </div>
  );
}
