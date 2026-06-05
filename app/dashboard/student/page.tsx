'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import QRScanner from '@/components/qr/qr-scanner';
import { LoadingState } from '@/components/ui/status-state';
import { BarChart3, Clock3, History, ScanLine, Sparkles } from 'lucide-react';

type AttendanceRecord = {
  _id: string;
  course?: { code?: string; title?: string };
  timestamp: string;
  status: 'present' | 'late';
};

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [studentId, setStudentId] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [studentName, setStudentName] = useState('Student');
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
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
        setStudentCode(meData.data.studentId || meData.data.id);
        setStudentId(meData.data.id);

        const attendanceRes = await fetch(`/api/attendance?studentId=${meData.data.id}`);
        const attendanceData = await attendanceRes.json();

        if (!attendanceData.success) {
          throw new Error(attendanceData.error || 'Failed to load attendance summary');
        }

        setAttendance(attendanceData.data || []);
        setSummary(
          attendanceData.summary || {
            attendanceRate: 0,
            presentCount: 0,
            lateCount: 0,
            totalRecords: 0,
          }
        );
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
    if (summary.attendanceRate >= 90) return 'Excellent attendance. Keep maintaining your consistency.';
    if (summary.attendanceRate >= 75) return 'Your attendance is on track, but there is room to improve.';
    return 'Attendance is below target. Try to attend upcoming sessions consistently.';
  }, [summary.attendanceRate]);

  const attendanceMood = useMemo(() => {
    if (summary.attendanceRate >= 90) return 'Strong';
    if (summary.attendanceRate >= 75) return 'Stable';
    return 'Needs focus';
  }, [summary.attendanceRate]);

  if (loading) {
    return <LoadingState title="Loading student dashboard" description="Fetching your profile, attendance summary, and recent activity." />;
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12">
      <div className="max-w-5xl mx-auto space-y-8">
        <section className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900 shadow-lg">
          <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8 items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">My Attendance Hub</p>
              <h1 className="text-3xl md:text-4xl font-black mt-3">Welcome back, {studentName}.</h1>
              <p className="text-slate-600 mt-4 max-w-2xl">
                Scan into class, review your record, and keep an eye on your attendance trend from one personal dashboard.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/dashboard/student/scan" className="btn-primary gap-2 bg-primary text-white hover:bg-primary/90">
                  <ScanLine className="h-4 w-4" />
                  Scan QR
                </Link>
                <Link href="/dashboard/student/history" className="btn-secondary gap-2 bg-slate-200 border-slate-300 text-slate-900 hover:bg-slate-300">
                  <History className="h-4 w-4" />
                  View History
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white border border-slate-300 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Attendance</p>
                <h2 className="text-3xl font-black mt-2">{summary.attendanceRate}%</h2>
                <p className="text-xs text-slate-600 mt-1">current rate</p>
              </div>
              <div className="rounded-lg bg-white border border-slate-300 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Mood</p>
                <h2 className="text-3xl font-black mt-2">{attendanceMood}</h2>
                <p className="text-xs text-slate-600 mt-1">progress signal</p>
              </div>
              <div className="rounded-lg bg-white border border-slate-300 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Present</p>
                <h2 className="text-3xl font-black mt-2">{summary.presentCount}</h2>
                <p className="text-xs text-slate-600 mt-1">successful scans</p>
              </div>
              <div className="rounded-lg bg-white border border-slate-300 p-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Code</p>
                <h2 className="text-xl font-black mt-2 truncate">{studentCode || 'N/A'}</h2>
                <p className="text-xs text-slate-600 mt-1">student profile</p>
              </div>
            </div>
          </div>
        </section>

        {statusMessage && (
          <div
            className={`p-4 rounded-lg font-bold flex items-center gap-3 ${
              statusMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            <Sparkles className="h-5 w-5" />
            {statusMessage.text}
          </div>
        )}

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

        <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
          <section className="card bg-gradient-to-br from-white to-sky-50">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-text-primary mb-2">Ready to scan?</h2>
                <p className="text-text-secondary">
                  Use the QR reader when your lecturer opens a live session.
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-primary bg-primary/10 px-3 py-2 rounded-full w-fit">
                <BarChart3 className="h-4 w-4" />
                Personal view
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
                  Your student profile is missing a usable ID.
                </div>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-text-primary">Your Recent Attendance</h3>
                <Link href="/dashboard/student/history" className="btn-ghost text-xs">
                  Full history
                </Link>
              </div>
              <div className="space-y-3">
                {attendance.slice(0, 4).map((record) => (
                  <div
                    key={record._id}
                    className="flex justify-between items-center p-4 bg-white rounded-lg border border-gray-100 shadow-sm"
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
                {attendance.length === 0 && <p className="text-sm text-text-secondary">No attendance records found yet.</p>}
              </div>
            </div>

            <div className="card space-y-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Performance Insight</p>
                <h3 className="text-lg font-bold text-text-primary mt-1">Your attendance trend</h3>
              </div>
              <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-md border border-primary/10">
                <Clock3 className="h-5 w-5 text-primary mt-0.5" />
                <p className="text-sm text-text-secondary">{insight}</p>
              </div>
              <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-md border border-slate-200">
                <History className="h-5 w-5 text-text-secondary mt-0.5" />
                <p className="text-sm text-text-secondary">
                  Open your history page for a full timeline, export options, and deeper attendance review.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
