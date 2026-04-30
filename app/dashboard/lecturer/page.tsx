'use client';

import { 
  Users, 
  Clock, 
  CheckCircle2, 
  ArrowUpRight, 
  Calendar,
  MoreHorizontal,
  Plus
} from 'lucide-react';

export default function LecturerOverview() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard Overview</h1>
          <p className="text-text-secondary text-sm">Welcome back! Here's what's happening today.</p>
        </div>
        <button className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Create Session
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Students', value: '1,284', icon: Users, color: 'text-primary', bg: 'bg-primary/5', trend: '+12%' },
          { label: 'Active Sessions', value: '3', icon: Clock, color: 'text-warning', bg: 'bg-warning/5', trend: 'Live' },
          { label: 'Avg. Attendance', value: '92%', icon: CheckCircle2, color: 'text-success', bg: 'bg-success/5', trend: '+2.4%' },
          { label: 'Courses', value: '12', icon: Calendar, color: 'text-accent', bg: 'bg-accent/5', trend: 'Fixed' },
        ].map((stat, i) => (
          <div key={i} className="card flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-md ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded uppercase">{stat.trend}</span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</p>
              <h2 className="text-2xl font-bold text-text-primary mt-1">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Sessions Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Recent Sessions</h3>
            <button className="btn-ghost text-xs">View all</button>
          </div>
          <div className="card !p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase">Course</th>
                  <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase">Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase">Attendees</th>
                  <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {[
                  { course: 'CS101: Intro to CS', date: 'Oct 24, 2024', count: '142', status: 'Completed' },
                  { course: 'MAT201: Calculus II', date: 'Oct 23, 2024', count: '89', status: 'Completed' },
                  { course: 'PHY105: Physics I', date: 'Oct 22, 2024', count: '124', status: 'Completed' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-text-primary">{row.course}</td>
                    <td className="px-6 py-4 text-text-secondary">{row.date}</td>
                    <td className="px-6 py-4 font-medium">{row.count}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live Feed / Activity */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold">Activity Feed</h3>
            <MoreHorizontal className="h-4 w-4 text-slate-400 cursor-pointer" />
          </div>
          <div className="card space-y-6">
            {[1,2,3,4].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-text-primary leading-tight font-medium">
                    New student registered for <span className="font-bold">CS101</span>
                  </p>
                  <p className="text-[10px] text-text-secondary mt-1">2 MINUTES AGO</p>
                </div>
              </div>
            ))}
            <button className="w-full btn-secondary text-xs py-2 mt-2">
              Refresh Feed
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
