'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface QRDisplayProps {
  sessionId: string;
  qrCodeData: string;
  courseName: string;
  endTime: string;
}

export default function QRDisplay({ sessionId, qrCodeData, courseName, endTime }: QRDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(qrCodeData);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadQR = () => {
    const link = document.createElement('a');
    link.href = qrCodeData;
    link.download = `qr-${sessionId}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card max-w-md mx-auto">
      <div className="text-center space-y-4">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{courseName}</h3>
          <p className="text-sm text-text-secondary">Expires at {new Date(endTime).toLocaleTimeString()}</p>
        </div>

        {/* QR Code Display */}
        <div className="bg-white p-4 rounded-lg border-2 border-dashed border-gray-300">
          {qrCodeData ? (
            <img src={qrCodeData} alt="Session QR Code" className="w-full" />
          ) : (
            <div className="w-full aspect-square bg-gray-100 rounded flex items-center justify-center">
              <p className="text-text-secondary">Loading...</p>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
          <p className="font-semibold text-blue-900 mb-2">📱 Instructions:</p>
          <ol className="list-decimal list-inside space-y-1 text-blue-800 text-xs">
            <li>Display this QR code on your screen or projector</li>
            <li>Students scan with their phones</li>
            <li>Attendance is recorded instantly</li>
          </ol>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={handleCopy}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-semibold text-text-primary transition"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy
              </>
            )}
          </button>
          <button
            onClick={downloadQR}
            className="flex-1 px-3 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-semibold transition"
          >
            Download
          </button>
        </div>
      </div>
    </div>
  );
}
