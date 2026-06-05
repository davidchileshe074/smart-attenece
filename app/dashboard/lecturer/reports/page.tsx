'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Download, TrendingUp, ShieldAlert, BarChart3 } from 'lucide-react';

type AttendanceRecord = {
  _id: string;
  student: { _id: string; name: string; studentId: string; email?: string };
  course: { title: string; code: string };
  session: { startTime: string; endTime: string; status: string };
  timestamp: string;
  status: 'present' | 'late';
};

type Summary = {
  totalRecords: number;
  presentCount: number;
  lateCount: number;
  attendanceRate: number;
  lowAttendanceAlerts: Array<{
    name: string;
    studentId: string;
    email?: string;
    present: number;
    total: number;
    rate: number;
  }>;
};

export default function LecturerReportsPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lecturerName, setLecturerName] = useState('Lecturer');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();

        if (!meData.success) {
          throw new Error(meData.error || 'Failed to load profile');
        }

        setLecturerName(meData.data.name || 'Lecturer');

        const res = await fetch(`/api/attendance?lecturerId=${meData.data.id}`);
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load reports');
        }

        setRecords(data.data || []);
        setSummary(data.summary || null);
      } catch (err: any) {
        setError(err.message || 'Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    loadReports();
  }, []);

  const exportCsv = () => {
    const rows = [
      ['Student', 'Student ID', 'Course', 'Session Start', 'Status', 'Marked At'],
      ...records.map((record) => [
        record.student.name,
        record.student.studentId,
        `${record.course.code} - ${record.course.title}`,
        new Date(record.session.startTime).toLocaleString(),
        record.status,
        new Date(record.timestamp).toLocaleString(),
      ]),
    ];

    const csv = rows
      .map((row) =>
        row.map((value) => `"${String(value ?? '').replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lecturer-attendance-report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const alertCount = summary?.lowAttendanceAlerts.length || 0;
  const topAlerts = useMemo(() => summary?.lowAttendanceAlerts.slice(0, 5) || [], [summary]);

  if (loading) {
    return <div className="card text-center py-16 text-text-secondary">Loading lecturer report...</div>;
  }

  if (error) {
    return (
      <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-900 via-primary to-bg-dark text-white">
        <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-accent">Lecturer Reports</p>
            <h1 className="text-3xl md:text-4xl font-black mt-3">Attendance analytics for {lecturerName}</h1>
            <p className="text-slate-300 mt-4 max-w-2xl">
              Review your class attendance trends, export reports, and identify students who need extra support.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={exportCsv} className="btn-primary gap-2 bg-white text-primary hover:bg-slate-100">
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <Link href="/dashboard/lecturer/sessions" className="btn-secondary gap-2 bg-white/10 border-white/15 text-white hover:bg-white/15">
              <BarChart3 className="h-4 w-4" />
              Sessions
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Attendance Rate</p>
          <h2 className="text-3xl font-black text-text-primary mt-2">{summary?.attendanceRate || 0}%</h2>
        </div>
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Present Marks</p>
          <h2 className="text-3xl font-black text-success mt-2">{summary?.presentCount || 0}</h2>
        </div>
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Late Marks</p>
          <h2 className="text-3xl font-black text-warning mt-2">{summary?.lateCount || 0}</h2>
        </div>
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Alerts</p>
          <h2 className="text-3xl font-black text-error mt-2">{alertCount}</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Recent Attendance</h2>
              <p className="text-sm text-text-secondary">Latest marks in your classes</p>
            </div>
            <TrendingUp className="h-5 w-5 text-primary" />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-widest text-text-secondary">
                <tr>
                  <th className="py-3 pr-4">Student</th>
                  <th className="py-3 pr-4">Course</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Marked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.slice(0, 8).map((record) => (
                  <tr key={record._id}>
                    <td className="py-4 pr-4">
                      <p className="font-semibold text-text-primary">{record.student.name}</p>
                      <p className="text-xs text-text-secondary">{record.student.studentId}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <p className="font-medium text-text-primary">{record.course.code}</p>
                      <p className="text-xs text-text-secondary">{record.course.title}</p>
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          record.status === 'present'
                            ? 'bg-success/10 text-success'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="py-4 text-right text-text-secondary">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <ShieldAlert className="h-5 w-5 text-error" />
              <div>
                <h2 className="text-xl font-bold text-text-primary">Low Attendance Alerts</h2>
                <p className="text-sm text-text-secondary">Students below 75% attendance</p>
              </div>
            </div>

            {topAlerts.length === 0 ? (
              <p className="text-sm text-text-secondary">No students are currently below the threshold.</p>
            ) : (
              <div className="space-y-3">
                {topAlerts.map((student) => (
                  <div key={student.studentId} className="rounded-lg border border-slate-200 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-text-primary">{student.name}</p>
                        <p className="text-xs text-text-secondary">{student.studentId}</p>
                        <p className="text-sm text-text-secondary mt-1">
                          {student.rate}% attendance across {student.total} records
                        </p>
                      </div>
                      {student.email ? (
                        <a
                          href={`mailto:${student.email}?subject=Attendance%20Alert&body=Your%20current%20attendance%20is%20${student.rate}%25.`}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                        >
                          Notify
                        </a>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Next Step</p>
            <h3 className="text-lg font-bold text-text-primary mt-1">Need a live session?</h3>
            <p className="text-sm text-text-secondary mt-2">
              Open your sessions page to create a new scan window and start taking attendance immediately.
            </p>
            <Link href="/dashboard/lecturer" className="btn-secondary mt-4 w-full">
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
