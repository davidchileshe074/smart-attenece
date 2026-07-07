'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Eye, Plus, RefreshCw, StopCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import CourseSessionModal from '@/components/lecturer/course-session-modal';
import { useRealtimeEvents } from '@/hooks/use-realtime-events';
import { ErrorState, LoadingState } from '@/components/ui/status-state';

interface Session {
  _id: string;
  course: { title: string; code: string };
  startTime: string;
  endTime: string;
  status: 'active' | 'expired' | 'scheduled';
  qrCode: string;
}

export default function LecturerSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [lecturerId, setLecturerId] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const loadSessions = async () => {
    try {
      setLoading(true);
      setError('');

      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.success) {
        throw new Error(meData.error || 'Failed to load lecturer profile');
      }

      setLecturerId(meData.data.id);
      const res = await fetch(`/api/sessions?lecturerId=${meData.data.id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load sessions');
      }

      setSessions(data.data || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSessions();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useRealtimeEvents({
    lecturerId: lecturerId || undefined,
    handlers: {
      onSessionCreated: () => {
        void loadSessions();
      },
      onSessionExpired: () => {
        void loadSessions();
      },
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadSessions();
    setRefreshing(false);
  };

  const handleEndSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to end this session? Students will no longer be able to mark attendance.')) {
      return;
    }

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'expired' }),
      });

      if (res.ok) {
        setSessions((current) =>
          current.map((session) => (session._id === sessionId ? { ...session, status: 'expired' } : session))
        );
      }
    } catch {
      alert('Failed to end session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) {
      return;
    }

    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' });
      if (res.ok) {
        setSessions((current) => current.filter((session) => session._id !== sessionId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete session');
      }
    } catch {
      alert('Failed to delete session');
    }
  };

  const stats = useMemo(() => {
    const active = sessions.filter((session) => session.status === 'active').length;
    const ended = sessions.filter((session) => session.status === 'expired').length;
    return {
      total: sessions.length,
      active,
      ended,
    };
  }, [sessions]);

  const formatTime = (dateString: string) => new Date(dateString).toLocaleString();
  const formatDuration = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    return `${minutes} min`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700';
      case 'expired':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-blue-100 text-blue-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Session Management</p>
          <h1 className="text-3xl font-bold text-text-primary">Attendance Sessions</h1>
          <p className="text-text-secondary mt-1">Manage and monitor your attendance sessions</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => setIsCreateOpen(true)} className="btn-primary gap-2" type="button">
            <Plus className="h-4 w-4" />
            Create Session
          </button>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-text-primary transition disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { label: 'Total Sessions', value: stats.total },
          { label: 'Active', value: stats.active },
          { label: 'Ended', value: stats.ended },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">{stat.label}</p>
            <h2 className="text-3xl font-black text-text-primary mt-2">{stat.value}</h2>
          </div>
        ))}
      </div>

      {error && (
        <ErrorState title="Unable to load sessions" message={error} onRetry={loadSessions} />
      )}

      {loading ? (
        <LoadingState title="Loading sessions" description="Fetching your attendance sessions." compact />
      ) : sessions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary mb-4">No sessions yet</p>
          <p className="text-sm text-text-secondary">Create a new session from your dashboard to get started</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-200 bg-gray-50">
                <tr>
                  <th className="px-6 py-4 font-semibold text-text-primary">Course</th>
                  <th className="px-6 py-4 font-semibold text-text-primary">Started</th>
                  <th className="px-6 py-4 font-semibold text-text-primary">Duration</th>
                  <th className="px-6 py-4 font-semibold text-text-primary">Status</th>
                  <th className="px-6 py-4 font-semibold text-text-primary text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sessions.map((session) => (
                  <tr key={session._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-text-primary">{session.course.code}</p>
                        <p className="text-xs text-text-secondary">{session.course.title}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">{formatTime(session.startTime)}</td>
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      {formatDuration(session.startTime, session.endTime)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(session.status)}`}
                      >
                        {session.status === 'active'
                          ? 'Active'
                          : session.status === 'expired'
                          ? 'Ended'
                          : 'Scheduled'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/dashboard/lecturer/sessions/${session._id}`}
                          title="View details"
                          className="p-2 hover:bg-blue-50 rounded-lg text-blue-600 transition"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>
                        {session.status === 'active' && (
                          <button
                            onClick={() => handleEndSession(session._id)}
                            title="End session"
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                          >
                            <StopCircle className="h-4 w-4" />
                          </button>
                        )}
                        {session.status !== 'active' && (
                          <button
                            onClick={() => handleDeleteSession(session._id)}
                            title="Delete session"
                            className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <CourseSessionModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        lecturerId={lecturerId}
        onCreated={loadSessions}
      />
    </div>
  );
}
