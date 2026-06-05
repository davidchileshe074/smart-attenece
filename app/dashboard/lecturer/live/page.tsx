'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, CircleDot, Radio } from 'lucide-react';
import LiveAttendance from '@/components/lecturer/live-attendance';
import CourseSessionModal from '@/components/lecturer/course-session-modal';
import { useRealtimeEvents } from '@/hooks/use-realtime-events';
import { ErrorState, LoadingState } from '@/components/ui/status-state';

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
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

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
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load live view');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadData();
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  useRealtimeEvents({
    lecturerId: profile?.id,
    handlers: {
      onSessionCreated: () => {
        void loadData();
      },
      onSessionExpired: () => {
        void loadData();
      },
    },
  });

  const refreshSessions = async (lecturerId: string) => {
    try {
      const sessionsRes = await fetch(`/api/sessions?lecturerId=${lecturerId}`);
      const sessionsData = await sessionsRes.json();

      if (sessionsData.success) {
        setSessions(sessionsData.data || []);
        return true;
      }
    } catch {
      // Fall back to a full reload below.
    }

    return false;
  };

  const handleSessionCreated = async () => {
    setIsSessionModalOpen(false);

    if (profile?.id) {
      const refreshed = await refreshSessions(profile.id);
      if (!refreshed) {
        void loadData();
      }
      return;
    }

    void loadData();
  };

  const activeSessions = useMemo(
    () => sessions.filter((session) => session.status === 'active'),
    [sessions]
  );
  const currentSession = activeSessions[0] || null;

  useEffect(() => {
    if (!currentSession) return;

    const updateTimeRemaining = () => {
      const now = new Date().getTime();
      const endTime = new Date(currentSession.endTime).getTime();
      setTimeRemaining(Math.max(0, Math.floor((endTime - now) / 1000)));
    };

    const immediateTimer = setTimeout(updateTimeRemaining, 0);
    const timer = setInterval(updateTimeRemaining, 1000);
    return () => {
      clearTimeout(immediateTimer);
      clearInterval(timer);
    };
  }, [currentSession]);

  if (loading) {
    return <LoadingState title="Preparing live attendance" description="Loading your active session and live scan stream." compact />;
  }

  if (error) {
    return (
      <ErrorState
        title="Unable to load live attendance"
        message={error}
        actionHref="/dashboard/lecturer"
        actionLabel="Back to dashboard"
      />
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
          <button
            type="button"
            onClick={() => setIsSessionModalOpen(true)}
            disabled={!profile?.id}
            className="btn-primary inline-flex w-fit mx-auto gap-2 disabled:opacity-50"
          >
            Create Session
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.9fr] gap-6">
          <LiveAttendance
            sessionId={currentSession._id}
            courseName={`${currentSession.course.code} - ${currentSession.course.title}`}
            timeRemaining={timeRemaining}
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

      <CourseSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        onCreated={handleSessionCreated}
        lecturerId={profile?.id || ''}
      />
    </div>
  );
}
