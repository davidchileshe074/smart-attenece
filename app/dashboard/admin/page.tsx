'use client';

import { 
  Users, 
  Activity, 
  Database, 
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function AdminOverview() {
  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">System Administration</h1>
        <p className="text-text-secondary text-sm">Monitor system health and manage global resources.</p>
      </div>

      {/* Admin Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Users', value: '4,821', icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'DB Connections', value: 'Active', icon: Database, color: 'text-success', bg: 'bg-success/5' },
          { label: 'System Uptime', value: '99.98%', icon: Activity, color: 'text-accent', bg: 'bg-accent/5' },
          { label: 'Security Audits', value: 'Passed', icon: ShieldCheck, color: 'text-slate-600', bg: 'bg-slate-100' },
        ].map((stat, i) => (
          <div key={i} className="card border-l-4 border-l-primary">
            <div className={`p-2 w-fit rounded-md mb-4 ${stat.bg}`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
            <p className="text-xs font-bold text-text-secondary uppercase tracking-widest">{stat.label}</p>
            <h2 className="text-3xl font-black text-text-primary mt-1">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* System Health / Warnings */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">System Health</h3>
          <div className="card space-y-4">
            <div className="flex items-start gap-4 p-4 bg-slate-50 rounded-md border border-slate-100">
              <TrendingUp className="h-5 w-5 text-success mt-1" />
              <div>
                <p className="text-sm font-bold">Optimal Performance</p>
                <p className="text-xs text-text-secondary mt-1">Latency is currently at 42ms. All systems operational.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 p-4 bg-warning/5 rounded-md border border-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning mt-1" />
              <div>
                <p className="text-sm font-bold text-warning">Minor Warning</p>
                <p className="text-xs text-text-secondary mt-1">High disk usage detected on MongoDB Cluster 0 (84%).</p>
              </div>
            </div>
          </div>
        </div>

        {/* User Distribution (Visual Placeholder) */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">User Distribution</h3>
          <div className="card flex flex-col justify-center py-10">
            <div className="flex justify-between items-end gap-2 px-6 h-32">
              {[60, 80, 45, 90, 70].map((h, i) => (
                <div key={i} className="w-full bg-slate-100 rounded-t-md relative group">
                  <div 
                    className="absolute bottom-0 w-full bg-primary hover:bg-accent transition-all rounded-t-md cursor-help" 
                    style={{ height: `${h}%` }}
                  />
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    {h * 42}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-6 text-[10px] font-bold text-text-secondary uppercase">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
