import { 
  Users, 
  Activity, 
  Database, 
  ShieldCheck,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

function formatUptime(seconds: number) {
  const days = Math.floor(seconds / (3600 * 24));
  const hours = Math.floor((seconds % (3600 * 24)) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export default async function AdminOverview() {
  await connectDB();
  
  const totalUsers = await User.countDocuments();
  
  // 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus = mongoose.connection.readyState === 1 ? 'Active' : 'Offline';
  
  const uptime = formatUptime(process.uptime());

  // Count roles for user distribution
  const studentCount = await User.countDocuments({ role: 'student' });
  const lecturerCount = await User.countDocuments({ role: 'lecturer' });
  const adminCount = await User.countDocuments({ role: 'admin' });

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
          { label: 'Total Users', value: totalUsers.toString(), icon: Users, color: 'text-primary', bg: 'bg-primary/5' },
          { label: 'DB Connections', value: dbStatus, icon: Database, color: dbStatus === 'Active' ? 'text-success' : 'text-error', bg: dbStatus === 'Active' ? 'bg-success/5' : 'bg-error/5' },
          { label: 'System Uptime', value: uptime, icon: Activity, color: 'text-accent', bg: 'bg-accent/5' },
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
                <p className="text-xs text-text-secondary mt-1">All systems operational.</p>
              </div>
            </div>
            {dbStatus !== 'Active' && (
              <div className="flex items-start gap-4 p-4 bg-error/5 rounded-md border border-error/10">
                <AlertTriangle className="h-5 w-5 text-error mt-1" />
                <div>
                  <p className="text-sm font-bold text-error">Database Error</p>
                  <p className="text-xs text-text-secondary mt-1">MongoDB connection is currently offline or unreachable.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Distribution */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold">User Distribution</h3>
          <div className="card flex flex-col justify-center py-10">
            <div className="flex justify-around items-end gap-2 px-6 h-32">
              {[
                { label: 'Students', count: studentCount, h: totalUsers > 0 ? (studentCount / totalUsers) * 100 : 0 },
                { label: 'Lecturers', count: lecturerCount, h: totalUsers > 0 ? (lecturerCount / totalUsers) * 100 : 0 },
                { label: 'Admins', count: adminCount, h: totalUsers > 0 ? (adminCount / totalUsers) * 100 : 0 },
              ].map((role, i) => (
                <div key={i} className="w-16 flex flex-col items-center">
                  <div className="w-full bg-slate-100 rounded-t-md relative group h-24 flex items-end">
                    <div 
                      className="w-full bg-primary hover:bg-accent transition-all rounded-t-md cursor-help" 
                      style={{ height: `${Math.max(role.h, 5)}%` }} // minimum height for visibility
                    />
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-bg-dark text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      {role.count}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-text-secondary uppercase mt-2">{role.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
