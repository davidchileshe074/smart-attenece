'use client';

import { useState, useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Download,
  Filter,
  CheckCircle2,
  Clock
} from 'lucide-react';

export default function StudentHistoryPage() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setHistory([
        { id: 1, course: 'CS101: Intro to CS', date: 'Oct 24, 2024', time: '10:00 AM', status: 'Present', location: 'Hall A' },
        { id: 2, course: 'MAT201: Calculus II', date: 'Oct 23, 2024', time: '02:15 PM', status: 'Present', location: 'Room 402' },
        { id: 3, course: 'PHY105: Physics I', date: 'Oct 22, 2024', time: '09:05 AM', status: 'Late', location: 'Lab 1' },
        { id: 4, course: 'CS101: Intro to CS', date: 'Oct 20, 2024', time: '10:01 AM', status: 'Present', location: 'Hall A' },
      ]);
      setLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Attendance History</h1>
          <p className="text-text-secondary text-sm">Review your activity and signature logs.</p>
        </div>
        <div className="flex gap-2">
          <button className="btn-secondary gap-2 text-xs">
            <Filter className="h-3.5 w-3.5" />
            Filter
          </button>
          <button className="btn-primary gap-2 text-xs">
            <Download className="h-3.5 w-3.5" />
            Export PDF
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex items-center gap-4">
          <div className="h-10 w-10 bg-primary/5 rounded-md flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase">Overall Presence</p>
            <p className="text-xl font-bold">94.2%</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-10 w-10 bg-warning/5 rounded-md flex items-center justify-center">
            <Clock className="h-5 w-5 text-warning" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase">Late Arrivals</p>
            <p className="text-xl font-bold">3 Sessions</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="h-10 w-10 bg-success/5 rounded-md flex items-center justify-center">
            <Calendar className="h-5 w-5 text-success" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-text-secondary uppercase">Total Records</p>
            <p className="text-xl font-bold">42 Logs</p>
          </div>
        </div>
      </div>

      {/* History Table */}
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
            {loading ? (
              // Skeleton Rows
              [1, 2, 3, 4, 5].map((i) => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-4 w-32 bg-slate-100 animate-pulse rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-24 bg-slate-100 animate-pulse rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded" /></td>
                  <td className="px-6 py-4 text-right flex justify-end"><div className="h-6 w-16 bg-slate-100 animate-pulse rounded-full" /></td>
                </tr>
              ))
            ) : (
              history.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <FileText className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
                      <span className="font-semibold text-text-primary text-sm">{log.course}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-text-primary font-medium">{log.date}</div>
                    <div className="text-[10px] text-text-secondary font-bold uppercase">{log.time}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-text-secondary text-sm">
                      <MapPin className="h-3 w-3" />
                      {log.location}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                      log.status === 'Present' 
                        ? 'bg-success/10 text-success' 
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
