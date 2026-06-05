'use client';

import { useState, useEffect } from 'react';
import { Play, StopCircle, Trash2, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import Link from 'next/link';

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

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.success) {
        setSessions(data.data || []);
      }
    } catch (err) {
      setError('Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchSessions();
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
        setSessions(sessions.map(s => s._id === sessionId ? { ...s, status: 'expired' } : s));
      }
    } catch (err) {
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
        setSessions(sessions.filter(s => s._id !== sessionId));
      } else {
        const data = await res.json();
        alert(data.error || 'Failed to delete session');
      }
    } catch (err) {
      alert('Failed to delete session');
    }
  };

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
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Attendance Sessions</h1>
          <p className="text-text-secondary mt-1">Manage and monitor your attendance sessions</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-semibold text-text-primary transition disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Sessions Table */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin text-2xl mb-2">⏳</div>
          <p className="text-text-secondary">Loading sessions...</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-text-secondary mb-4">No sessions yet</p>
          <p className="text-sm text-text-secondary">Create a new session to get started</p>
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
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      {formatTime(session.startTime)}
                    </td>
                    <td className="px-6 py-4 text-text-secondary text-sm">
                      {formatDuration(session.startTime, session.endTime)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(session.status)}`}>
                        {session.status === 'active' ? '🔴 Active' : session.status === 'expired' ? '⏹ Ended' : '📅 Scheduled'}
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
    </div>
  );
}
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sessions.map((session: any) => (
              <tr key={session._id} className="hover:bg-gray-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="font-bold text-brand-dark">{session.course?.title}</div>
                  <div className="text-xs text-gray-500">{session.course?.code}</div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {new Date(session.startTime).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-600">
                  {Math.round((new Date(session.endTime).getTime() - new Date(session.startTime).getTime()) / 60000)} mins
                </td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                    session.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {session.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-brand-blue font-bold text-sm hover:underline">View Report</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
