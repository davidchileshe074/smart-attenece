'use client';

import { useEffect, useMemo, useState } from 'react';
import { Download, Mail, ShieldAlert, TrendingUp } from 'lucide-react';
import { ErrorState, LoadingState } from '@/components/ui/status-state';

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
  classAttendanceRate?: number;
  classSize?: number;
  totalStudents?: number;
  sessionCount?: number;
  lowAttendanceAlerts: Array<{
    name: string;
    studentId: string;
    email?: string;
    present: number;
    total: number;
    rate: number;
  }>;
};

export default function AdminReportsPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadReports = async () => {
      try {
        const res = await fetch('/api/attendance');
        const data = await res.json();

        if (!data.success) {
          throw new Error(data.error || 'Failed to load reports');
        }

        setRecords(data.data || []);
        setSummary(data.summary || null);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load reports');
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
        row
          .map((value) => {
            const text = String(value ?? '');
            return `"${text.replace(/"/g, '""')}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'attendance-report.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const lowAttendanceCount = summary?.lowAttendanceAlerts.length || 0;
  const recentAlerts = useMemo(
    () => summary?.lowAttendanceAlerts.slice(0, 5) || [],
    [summary]
  );

  if (loading) {
    return <LoadingState title="Loading system reports" description="Building attendance analytics for the whole system." compact />;
  }

  if (error) {
    return <ErrorState title="Unable to load system reports" message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">System Reports</p>
          <h1 className="text-3xl font-bold text-text-primary mt-1">Attendance Analytics</h1>
          <p className="text-text-secondary mt-2">
            Monitor overall attendance, identify low-engagement students, and export reports.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={exportCsv} className="btn-secondary gap-2">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button onClick={() => window.print()} className="btn-primary gap-2">
            <Download className="h-4 w-4" />
            Save as PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Attendance Rate</p>
          <h2 className="text-3xl font-black text-text-primary mt-2">
            {summary?.classAttendanceRate ?? summary?.attendanceRate ?? 0}%
          </h2>
          <p className="text-sm text-text-secondary mt-1">Benchmark uses the full class size.</p>
        </div>
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Present Students</p>
          <h2 className="text-3xl font-black text-success mt-2">{summary?.presentCount || 0}</h2>
          <p className="text-sm text-text-secondary mt-1">Students marked present.</p>
        </div>
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Late Students</p>
          <h2 className="text-3xl font-black text-warning mt-2">{summary?.lateCount || 0}</h2>
          <p className="text-sm text-text-secondary mt-1">Students marked late.</p>
        </div>
        <div className="card">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Total Students</p>
          <h2 className="text-3xl font-black text-primary mt-2">{summary?.totalStudents ?? summary?.classSize ?? 0}</h2>
          <p className="text-sm text-text-secondary mt-1">Students provisioned in the class.</p>
        </div>
      </div>

      <p className="text-sm text-text-secondary">
        {lowAttendanceCount > 0
          ? `${lowAttendanceCount} student${lowAttendanceCount === 1 ? '' : 's'} are currently below the 75% attendance threshold.`
          : 'No students are currently below the 75% attendance threshold.'}
      </p>

      <div className="grid grid-cols-1 xl:grid-cols-[1.25fr_0.95fr] gap-6">
        <div className="card">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Recent Attendance</h2>
              <p className="text-sm text-text-secondary">Latest scan records across the system</p>
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
                <h2 className="text-xl font-bold text-text-primary">Attendance Alerts</h2>
                <p className="text-sm text-text-secondary">Auto-generated escalation list</p>
              </div>
            </div>

            {recentAlerts.length === 0 ? (
              <p className="text-sm text-text-secondary">No students are currently below the threshold.</p>
            ) : (
              <div className="space-y-3">
                {recentAlerts.map((student) => (
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
                          href={`mailto:${student.email}?subject=Attendance%20Alert&body=Your%20current%20attendance%20is%20${student.rate}%25.%20Please%20speak%20with%20your%20lecturer.`}
                          className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
                        >
                          <Mail className="h-4 w-4" />
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
            <h2 className="text-xl font-bold text-text-primary">Export Notes</h2>
            <p className="text-sm text-text-secondary mt-2">
              CSV export is available immediately. For PDF, the current button opens the browser print flow so you can
              save the report as a PDF without adding another server dependency.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
