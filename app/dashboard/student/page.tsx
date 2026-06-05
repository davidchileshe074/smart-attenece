'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import QRScanner from '@/components/qr/qr-scanner';
import { BarChart3, Clock3, History } from 'lucide-react';

export default function StudentDashboard() {
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [studentId, setStudentId] = useState('');
  const [studentName, setStudentName] = useState('Student');
  const [attendance, setAttendance] = useState<any[]>([]);
  const [summary, setSummary] = useState({
    attendanceRate: 0,
    presentCount: 0,
    lateCount: 0,
    totalRecords: 0,
  });

  useEffect(() => {
    const loadStudent = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();

        if (!meData.success) {
          throw new Error(meData.error || 'Failed to load student profile');
        }

        setStudentName(meData.data.name || 'Student');
        const resolvedStudentId = meData.data.studentId || meData.data.id;
        setStudentId(resolvedStudentId);

        const attendanceRes = await fetch(`/api/attendance?studentId=${resolvedStudentId}`);
        const attendanceData = await attendanceRes.json();

        if (attendanceData.success) {
          setAttendance(attendanceData.data || []);
          setSummary(
            attendanceData.summary || {
              attendanceRate: 0,
              presentCount: 0,
              lateCount: 0,
              totalRecords: 0,
            }
          );
        }
      } catch (error) {
        setStatusMessage({
          type: 'error',
          text: 'Unable to load your profile or attendance summary.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStudent();
  }, []);

  const handleScanSuccess = (result: any) => {
    if (result.success) {
      setStatusMessage({ type: 'success', text: result.message });
    } else {
      setStatusMessage({ type: 'error', text: result.error });
    }

    setTimeout(() => setStatusMessage(null), 5000);
  };

  const insight = useMemo(() => {
    if (summary.attendanceRate >= 90) {
      return 'Excellent attendance. Keep maintaining your consistency.';
    }
    if (summary.attendanceRate >= 75) {
      return 'Your attendance is on track, but there is room to improve.';
    }
    return 'Attendance is below target. Try to attend upcoming sessions consistently.';
  }, [summary.attendanceRate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-12">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="h-10 w-56 bg-slate-200 animate-pulse rounded-md" />
          <div className="h-28 w-full bg-slate-100 animate-pulse rounded-2xl" />
          <div className="h-72 w-full bg-slate-100 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-12">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Student Portal</p>
          <h1 className="text-3xl font-extrabold text-text-primary mt-1">Attendance Overview</h1>
          <p className="text-gray-500 mt-2">
            Scan the QR code in class to mark your attendance and review your progress.
          </p>
        </header>

        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl font-bold flex items-center gap-3 animate-bounce ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {statusMessage.text}
          </div>
        )}

        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Attendance Rate</p>
              <h2 className="text-3xl font-black text-text-primary mt-2">{summary.attendanceRate}%</h2>
            </div>
            <div className="card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Present</p>
              <h2 className="text-3xl font-black text-success mt-2">{summary.presentCount}</h2>
            </div>
            <div className="card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Late</p>
              <h2 className="text-3xl font-black text-warning mt-2">{summary.lateCount}</h2>
            </div>
            <div className="card">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-secondary">Records</p>
              <h2 className="text-3xl font-black text-primary mt-2">{summary.totalRecords}</h2>
            </div>
          </div>

          <div className="card bg-gradient-to-br from-white to-slate-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Ready to Scan?</h2>
                <p className="text-text-secondary">
                  Use the live QR reader to mark your current session attendance.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-success bg-success/10 px-3 py-2 rounded-full w-fit">
                <BarChart3 className="h-4 w-4" />
                Profile connected
              </div>
            </div>

            <div className="mt-8">
              {studentId ? (
                <QRScanner
                  studentId={studentId}
                  onSuccess={handleScanSuccess}
                  onError={(err) => setStatusMessage({ type: 'error', text: err })}
                />
              ) : (
                <div className="text-center py-12 text-text-secondary">
                  Your student ID is missing from your profile.
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Your Recent Attendance</h3>
                <Link href="/dashboard/student/history" className="btn-ghost text-xs">
                  View full history
                </Link>
              </div>
              <div className="space-y-3">
                {attendance.slice(0, 4).map((record) => (
                  <div
                    key={record._id}
                    className="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100 shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-gray-800">{record.course?.code}</p>
                      <p className="text-xs text-gray-500">{new Date(record.timestamp).toLocaleString()}</p>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        record.status === 'present'
                          ? 'bg-blue-100 text-brand-blue'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {record.status}
                    </span>
                  </div>
                ))}
                {attendance.length === 0 && (
                  <p className="text-sm text-text-secondary">No attendance records found yet.</p>
                )}
              </div>
            </div>

            <div className="card space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">
                  Performance Insight
                </p>
                <h3 className="text-lg font-bold text-text-primary mt-1">Your attendance trend</h3>
              </div>
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-lg border border-primary/10">
                <Clock3 className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-text-secondary">{insight}</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                <History className="h-5 w-5 text-text-secondary mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Check your history page for a full record, filtered views, and export options.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
