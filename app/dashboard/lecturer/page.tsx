'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CourseSessionModal from '@/components/lecturer/course-session-modal';
import { useRealtimeEvents } from '@/hooks/use-realtime-events';
import { ErrorState, LoadingState } from '@/components/ui/status-state';
import {
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Clock,
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
    totalStudents: 0,
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
        const attendanceRate =
          attendanceData.summary?.classAttendanceRate ??
          attendanceData.summary?.attendanceRate ??
          0;

        setStats((current) => ({
          ...current,
          avgAttendance: attendanceRate,
          totalStudents: attendanceData.summary?.totalStudents ?? attendanceData.summary?.classSize ?? 0,
        }));
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDashboard();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useRealtimeEvents({
    lecturerId: profile?.id,
    handlers: {
      onSessionCreated: () => {
        void loadDashboard();
      },
      onSessionExpired: () => {
        void loadDashboard();
      },
    },
  });

  const handleSessionCreated = () => {
    loadDashboard();
  };

  if (loading) {
    return <LoadingState title="Loading lecturer dashboard" description="Pulling in your sessions, courses, and attendance summary." compact />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load lecturer dashboard"
        message={error}
        onRetry={loadDashboard}
      />
    );
  }

  return (
    <div className="space-y-10">
      <div className="rounded-3xl overflow-hidden border border-slate-200 bg-transparent text-slate-900 shadow-lg">
        <div className="p-8 md:p-10 grid grid-cols-1 lg:grid-cols-[1.3fr_0.7fr] gap-8 items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Lecturer DashBoard</p>
            <h1 className="text-3xl md:text-4xl font-black mt-3">Manage sessions, attendance, and course activity in one place.</h1>
            <p className="text-slate-600 mt-4 max-w-2xl">
              Welcome back, {profile?.name || 'lecturer'}. Start a session, monitor attendance live, and check who may need follow-up.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setIsModalOpen(true)} className="btn-primary gap-2 bg-primary text-white hover:bg-primary/90">
                <Plus className="h-4 w-4" />
                Create Session
              </button>
              <Link href="/dashboard/lecturer/reports" className="btn-secondary gap-2 bg-slate-200 border-slate-300 text-slate-900 hover:bg-slate-300">
                <RefreshCw className="h-4 w-4" />
                View Reports
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-white border border-slate-300 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Active</p>
              <h2 className="text-3xl font-black mt-2">{stats.activeSessions}</h2>
              <p className="text-xs text-slate-600 mt-1">live sessions</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-300 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Courses</p>
              <h2 className="text-3xl font-black mt-2">{stats.totalCourses}</h2>
              <p className="text-xs text-slate-600 mt-1">assigned to you</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-300 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Attendance</p>
              <h2 className="text-3xl font-black mt-2">{stats.avgAttendance}%</h2>
              <p className="text-xs text-slate-600 mt-1">system average</p>
            </div>
            <div className="rounded-2xl bg-white border border-slate-300 p-4">
              <p className="text-[10px] uppercase tracking-[0.3em] text-slate-600">Total Students</p>
              <h2 className="text-3xl font-black mt-2">{stats.totalStudents}</h2>
              <p className="text-xs text-slate-600 mt-1">students provisioned</p>
            </div>
          </div>
        </div>
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

      <div className="grid grid-cols-1 lg:grid-cols-[1.25fr_0.75fr] gap-8">
        <div className="space-y-4">
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
            <h3 className="text-lg font-bold text-text-primary">At Risk Students</h3>
            <span className="text-[10px] font-bold uppercase tracking-widest text-error bg-error/10 px-2 py-1 rounded-full">
              Alerts
            </span>
          </div>
          <div className="card space-y-4">
            {stats.avgAttendance >= 75 ? (
              <p className="text-sm text-text-secondary">
                No critical attendance alerts right now. Students below threshold will appear here.
              </p>
            ) : (
              <p className="text-sm text-text-secondary">
                Attendance trends are below target. Review the reports page for low-attendance students.
              </p>
            )}
            <Link href="/dashboard/lecturer/reports" className="btn-secondary w-full">
              Open Attendance Reports
            </Link>
          </div>
        </div>
      </div>

      <CourseSessionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreated={handleSessionCreated}
        lecturerId={profile?.id || ''}
      />
    </div>
  );
}
