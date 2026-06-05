'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import SessionModal from '@/components/lecturer/session-modal';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
  MoreHorizontal,
  Plus,
  RefreshCw,
} from 'lucide-react';

type Session = {
  _id: string;
  course: { title: string; code: string };
  startTime: string;
  endTime: string;
  status: 'active' | 'expired' | 'scheduled';
};

type Profile = {
  id: string;
  name: string;
  role: string;
};

export default function LecturerOverview() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    activeSessions: 0,
    totalCourses: 0,
    avgAttendance: 0,
  });
  const [recentSessions, setRecentSessions] = useState<Session[]>([]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError('');

      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.success) {
        throw new Error(meData.error || 'Failed to load lecturer profile');
      }

      setProfile(meData.data);

      const [sessionsRes, coursesRes, attendanceRes] = await Promise.all([
        fetch(`/api/sessions?lecturerId=${meData.data.id}`),
        fetch(`/api/courses?lecturerId=${meData.data.id}`),
        fetch(`/api/attendance?lecturerId=${meData.data.id}`),
      ]);

      const sessionsData = await sessionsRes.json();
      const coursesData = await coursesRes.json();
      const attendanceData = await attendanceRes.json();

      if (sessionsData.success) {
        const sessions = sessionsData.data || [];
        setRecentSessions(sessions.slice(0, 3));
        setStats((current) => ({
          ...current,
          activeSessions: sessions.filter((session: Session) => session.status === 'active').length,
        }));
      }

      if (coursesData.success) {
        setStats((current) => ({ ...current, totalCourses: coursesData.data?.length || 0 }));
      }

      if (attendanceData.success) {
        setStats((current) => ({
          ...current,
          avgAttendance: attendanceData.summary?.attendanceRate || 0,
        }));
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleSessionCreated = () => {
    loadDashboard();
  };

  if (loading) {
    return (
      <div className="card text-center py-16">
        <div className="inline-block animate-spin text-2xl mb-3">Loading</div>
        <p className="text-text-secondary">Loading lecturer dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card">
        <p className="text-error font-semibold">Unable to load dashboard</p>
        <p className="text-text-secondary mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Lecturer Dashboard</p>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard Overview</h1>
          <p className="text-text-secondary text-sm mt-1">
            Welcome back, {profile?.name || 'lecturer'}. Here is your teaching activity today.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn-primary gap-2">
          <Plus className="h-4 w-4" />
          Create Session
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: 'Active Sessions',
            value: stats.activeSessions,
            icon: Clock,
            color: 'text-warning',
            bg: 'bg-warning/5',
            trend: 'Live',
          },
          {
            label: 'Attendance Rate',
            value: `${stats.avgAttendance}%`,
            icon: CheckCircle2,
            color: 'text-success',
            bg: 'bg-success/5',
            trend: 'Avg',
          },
          {
            label: 'Total Courses',
            value: stats.totalCourses,
            icon: Calendar,
            color: 'text-accent',
            bg: 'bg-accent/5',
            trend: 'Assigned',
          },
          {
            label: 'Session Tools',
            value: 'Ready',
            icon: RefreshCw,
            color: 'text-primary',
            bg: 'bg-primary/5',
            trend: 'Manage',
          },
        ].map((stat, i) => (
          <div key={i} className="card flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className={`p-2 rounded-md ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <span className="text-[10px] font-bold text-success bg-success/10 px-1.5 py-0.5 rounded uppercase">
                {stat.trend}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider">{stat.label}</p>
              <h2 className="text-2xl font-bold text-text-primary mt-1">{stat.value}</h2>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/dashboard/lecturer/sessions" className="card hover:border-primary transition group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition">
                Manage Sessions
              </h3>
              <p className="text-sm text-text-secondary mt-1">Start, stop, and review session history.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-text-secondary group-hover:text-primary transition" />
          </div>
        </Link>

        <Link href="/dashboard/lecturer/courses" className="card hover:border-primary transition group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition">
                Course Management
              </h3>
              <p className="text-sm text-text-secondary mt-1">See the classes assigned to you.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-text-secondary group-hover:text-primary transition" />
          </div>
        </Link>

        <Link href="/dashboard/lecturer/live" className="card hover:border-primary transition group">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-bold text-text-primary group-hover:text-primary transition">
                Live Attendance
              </h3>
              <p className="text-sm text-text-secondary mt-1">Monitor the current scan stream in real time.</p>
            </div>
            <ArrowUpRight className="h-5 w-5 text-text-secondary group-hover:text-primary transition" />
          </div>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary">Recent Sessions</h3>
            <Link href="/dashboard/lecturer/sessions" className="btn-ghost text-xs">
              View all
            </Link>
          </div>
          <div className="card !p-0 overflow-hidden">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase">Course</th>
                  <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase">Started</th>
                  <th className="px-6 py-3 text-xs font-bold text-text-secondary uppercase text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-sm">
                {recentSessions.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-8 text-center text-text-secondary">
                      No sessions yet. Create one from the button above.
                    </td>
                  </tr>
                ) : (
                  recentSessions.map((session) => (
                    <tr key={session._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-text-primary">{session.course.code}</p>
                        <p className="text-xs text-text-secondary">{session.course.title}</p>
                      </td>
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(session.startTime).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] font-bold text-success bg-success/10 px-2 py-1 rounded-full uppercase tracking-tighter">
                          {session.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-text-primary">Activity Feed</h3>
            <MoreHorizontal className="h-4 w-4 text-slate-400 cursor-pointer" />
          </div>
          <div className="card space-y-6">
            {[
              'Students are scanning live for your active sessions.',
              'Session analytics are now connected to your attendance data.',
              'Use the reports page to export CSV or save a PDF copy.',
            ].map((message, index) => (
              <div key={message} className="flex gap-4">
                <div className="h-2 w-2 rounded-full bg-primary mt-1.5 shrink-0" />
                <div>
                  <p className="text-sm text-text-primary leading-tight font-medium">{message}</p>
                  <p className="text-[10px] text-text-secondary mt-1">
                    {index === 0 ? 'LIVE NOW' : index === 1 ? 'TODAY' : 'READY'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleSessionCreated}
        lecturerId={profile?.id || ''}
      />
    </div>
  );
}
