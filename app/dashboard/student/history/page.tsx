'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Filter,
  MapPin,
} from 'lucide-react';
import { ErrorState, LoadingState } from '@/components/ui/status-state';

export default function StudentHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<any[]>([]);
  const [studentName, setStudentName] = useState('Student');
  const [studentCode, setStudentCode] = useState('');
  const [summary, setSummary] = useState({
    attendanceRate: 0,
    presentCount: 0,
    lateCount: 0,
    totalRecords: 0,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();

        if (!meData.success) {
          throw new Error(meData.error || 'Failed to load student profile');
        }

        setStudentName(meData.data.name || 'Student');
        setStudentCode(meData.data.studentId || meData.data.id);
        const resolvedStudentId = meData.data.id;

        const historyRes = await fetch(`/api/attendance?studentId=${resolvedStudentId}`);
        const historyData = await historyRes.json();

        if (!historyData.success) {
          throw new Error(historyData.error || 'Failed to load attendance history');
        }

        setHistory(historyData.data || []);
        setSummary(
          historyData.summary || {
            attendanceRate: 0,
            presentCount: 0,
            lateCount: 0,
            totalRecords: 0,
          }
        );
      } catch (err: any) {
        setError(err.message || 'Failed to load attendance history');
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const exportCsv = () => {
    const rows = [
      ['Course', 'Session Start', 'Session End', 'Status', 'Marked At'],
      ...history.map((record) => [
        `${record.course?.code} - ${record.course?.title}`,
        new Date(record.session?.startTime || record.timestamp).toLocaleString(),
        new Date(record.session?.endTime || record.timestamp).toLocaleString(),
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
    link.download = 'attendance-history.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const attendanceLabel = useMemo(() => {
    if (summary.totalRecords === 0) return 'No records yet';
    if (summary.attendanceRate >= 90) return 'Excellent';
    if (summary.attendanceRate >= 75) return 'Steady';
    return 'Needs attention';
  }, [summary.attendanceRate, summary.totalRecords]);

  if (loading) {
    return <LoadingState title="Loading attendance history" description="Fetching your timeline, summary, and recent marks." compact />;
  }

  if (error) {
    return <ErrorState title="Unable to load attendance history" message={error} onRetry={() => window.location.reload()} />;
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Attendance History</p>
          <h1 className="text-2xl font-bold text-text-primary mt-1">{studentName}'s Record</h1>
          <p className="text-text-secondary text-sm mt-1">
            Review your activity, trend, and export your records.
          </p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary gap-2 text-xs">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
          <button onClick={exportCsv} className="btn-primary gap-2 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/5 rounded-md flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase">Overall Presence</p>
            <p className="text-xl font-bold">{summary.attendanceRate}%</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-10 w-10 bg-warning/5 rounded-md flex items-center justify-center">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase">Late Arrivals</p>
            <p className="text-xl font-bold">{summary.lateCount} Sessions</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-10 w-10 bg-success/5 rounded-md flex items-center justify-center">
            <Calendar className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase">Total Records</p>
            <p className="text-xl font-bold">{summary.totalRecords} Logs</p>
          </div>
        </div>
      </div>

      <div className="card flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Performance Insight</p>
          <h2 className="text-xl font-bold text-text-primary mt-1">{attendanceLabel}</h2>
          <p className="text-sm text-text-secondary mt-1">
            Your attendance rate is currently {summary.attendanceRate}%.
          </p>
        </div>
        <div className="text-sm font-semibold text-primary bg-primary/5 px-3 py-2 rounded-full w-fit">
          Student ID: {studentCode || 'N/A'}
        </div>
      </div>

      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">Course</th>
              <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">Date & Time</th>
              <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">Location</th>
              <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {history.length > 0 ? (
              history.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="font-semibold text-text-primary text-sm">
                        {log.course?.code} - {log.course?.title}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-primary font-medium">
                      {new Date(log.session?.startTime || log.timestamp).toLocaleDateString()}
                    </div>
                    <div className="text-[10px] text-text-secondary font-bold uppercase">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <MapPin className="h-3 w-3" />
                      {log.session?.status || 'Recorded'}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                        log.status === 'present' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                  No attendance history found yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
