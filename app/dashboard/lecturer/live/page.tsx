'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowRight, CircleDot, PlayCircle, Radio } from 'lucide-react';
import LiveAttendance from '@/components/lecturer/live-attendance';

type Session = {
  _id: string;
  course: { title: string; code: string };
  startTime: string;
  endTime: string;
  status: 'active' | 'expired' | 'scheduled';
};

type UserProfile = {
  id: string;
  name: string;
  role: string;
};

export default function LecturerLiveViewPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();

        if (!meData.success) {
          throw new Error(meData.error || 'Failed to load profile');
        }

        setProfile(meData.data);

        const sessionsRes = await fetch(`/api/sessions?lecturerId=${meData.data.id}`);
        const sessionsData = await sessionsRes.json();

        if (sessionsData.success) {
          setSessions(sessionsData.data || []);
        } else {
          throw new Error(sessionsData.error || 'Failed to load sessions');
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load live view');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status === 'active'),
    [sessions]
  );
  const currentSession = activeSessions[0] || null;

  if (loading) {
    return (
      <div className="card text-center py-16">
        <div className="inline-block animate-spin text-2xl mb-3">Loading</div>
        <p className="text-text-secondary">Preparing your live attendance view...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-text-primary">Live Attendance</h1>
        <div className="flex gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
        <Link href="/dashboard/lecturer" className="btn-secondary">
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Lecturer Live View</p>
          <h1 className="text-3xl font-bold text-text-primary mt-1">
            {profile?.name || 'Lecturer'}
          </h1>
          <p className="text-text-secondary mt-2">
            Monitor the active session, live scans, and time remaining from one place.
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-semibold text-success bg-success/10 px-3 py-2 rounded-full w-fit">
          <Radio className="h-4 w-4" />
          {activeSessions.length} active session{activeSessions.length === 1 ? '' : 's'}
        </div>
      </div>

      {!currentSession ? (
        <div className="card text-center py-16 space-y-4">
          <CircleDot className="h-10 w-10 mx-auto text-text-secondary opacity-40" />
          <div>
            <h2 className="text-xl font-bold text-text-primary">No live session right now</h2>
            <p className="text-text-secondary mt-2">
              Start a new session from the dashboard to begin live attendance tracking.
            </p>
          </div>
          <Link href="/dashboard/lecturer" className="btn-primary inline-flex w-fit mx-auto gap-2">
            Create Session
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
          <LiveAttendance
            sessionId={currentSession._id}
            courseName={`${currentSession.course.code} - ${currentSession.course.title}`}
            timeRemaining={Math.max(
              0,
              Math.floor((new Date(currentSession.endTime).getTime() - Date.now()) / 1000)
            )}
          />

          <div className="card space-y-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Active Sessions</p>
              <h2 className="text-xl font-bold text-text-primary mt-1">Quick Switch</h2>
            </div>
            <div className="space-y-3">
              {activeSessions.map((session) => (
                <div
                  key={session._id}
                  className={`rounded-lg border px-4 py-3 transition ${
                    session._id === currentSession._id
                      ? 'border-primary bg-primary/5'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <p className="font-semibold text-text-primary">{session.course.code}</p>
                  <p className="text-xs text-text-secondary mt-1">{session.course.title}</p>
                  <p className="text-[11px] text-text-secondary mt-2">
                    Ends {new Date(session.endTime).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
            <Link href="/dashboard/lecturer/sessions" className="btn-secondary w-full">
              Manage sessions
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
