'use client';

import { useState } from 'react';
import QRScanner from '@/components/qr/qr-scanner';

export default function StudentDashboard() {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Mock Student ID
  const studentId = "671111111111111111111111";

  const handleScanSuccess = (result: any) => {
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.error });
    }
    
    // Clear message after 5 seconds
    setTimeout(() => setStatusMessage(null), 5000);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-brand-blue">Student Portal</h1>
          <p className="text-gray-500">Scan the QR code in class to mark your attendance</p>
        </header>

        {statusMessage && (
          <div className={`mb-6 p-4 rounded-xl font-bold flex items-center gap-3 animate-bounce ${
            statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {statusMessage.type === 'success' ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {statusMessage.text}
          </div>
        )}

        <div className="space-y-8">
          <div className="glass-card py-12 text-center">
            <h2 className="text-2xl font-bold mb-8">Ready to Scan?</h2>
            <QRScanner 
              studentId={studentId} 
              onSuccess={handleScanSuccess} 
              onError={(err) => setStatusMessage({ type: 'error', text: err })}
            />
          </div>

          <div className="glass-card">
            <h3 className="text-lg font-bold mb-4">Your Recent Attendance</h3>
            <div className="space-y-3">
              {[
                { course: "CS101", date: "Today, 10:00 AM", status: "Present" },
                { course: "MAT202", date: "Yesterday, 2:00 PM", status: "Present" },
                { course: "PHY101", date: "28th Oct, 9:00 AM", status: "Late" },
              ].map((record, i) => (
                <div key={i} className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm">
                  <div>
                    <p className="font-bold text-gray-800">{record.course}</p>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    record.status === 'Present' ? 'bg-blue-100 text-brand-blue' : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {record.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
