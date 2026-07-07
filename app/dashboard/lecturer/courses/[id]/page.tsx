'use client';

import { use, useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, ArrowLeft, CalendarDays, Clock3, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import CourseSessionModal from '@/components/lecturer/course-session-modal';
import { LoadingState } from '@/components/ui/status-state';

type Student = {
  _id: string;
  name: string;
  studentId: string;
  email?: string;
};

type SessionSummary = {
  _id: string;
  startTime: string;
  endTime: string;
  status: 'active' | 'expired' | 'scheduled';
  expectedStudentCount?: number | null;
};

type CourseDetail = {
  _id: string;
  code: string;
  title: string;
  description?: string;
  studentCount?: number;
  recordedStudentCount?: number;
  studentCountBreakdown?: number;
  recordedStudents?: Student[];
  students?: Student[];
  sessionCount?: number;
  activeSessionCount?: number;
  recentSessions?: SessionSummary[];
};

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: courseId } = use(params);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [lecturerId, setLecturerId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSessionModalOpen, setIsSessionModalOpen] = useState(false);

  const loadCourse = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const meRes = await fetch('/api/auth/me');
      const meData = await meRes.json();

      if (!meData.success) {
        throw new Error(meData.error || 'Failed to load profile');
      }

      setLecturerId(meData.data.id);

      const res = await fetch(`/api/courses/${courseId}?lecturerId=${meData.data.id}`);
      const data = await res.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to load course');
      }

      setCourse(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCourse();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [loadCourse]);

  const enrolledStudents = useMemo(() => course?.students || [], [course]);
  const recordedStudents = useMemo(() => course?.recordedStudents || [], [course]);
  const recentSessions = useMemo(() => course?.recentSessions || [], [course]);

  if (loading) {
    return <LoadingState title="Loading course details" description="Fetching your students, sessions, and course summary." compact />;
  }

  if (error || !course) {
    return (
      <div className="space-y-6">
        <Link href="/dashboard/lecturer/courses" className="flex items-center gap-2 text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to Courses
        </Link>

        <div className="card">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-red-700">{error || 'Course not found'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard/lecturer/courses" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Courses
      </Link>

      <div className="rounded-3xl overflow-hidden border border-slate-200 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-slate-900 shadow-lg">
        <div className="p-8 md:p-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Course Details</p>
            <h1 className="text-3xl md:text-4xl font-black mt-3">{course.code}</h1>
            <p className="text-slate-600 mt-2 max-w-2xl">{course.title}</p>
          </div>
          <button onClick={() => setIsSessionModalOpen(true)} className="btn-primary gap-2 bg-primary text-white hover:bg-primary/90">
            <Plus className="h-4 w-4" />
            Create Session
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        {[
          { label: 'Enrolled Students', value: course.studentCount ?? enrolledStudents.length, icon: Users },
          { label: 'Recorded Students', value: course.recordedStudentCount ?? recordedStudents.length, icon: Users },
          { label: 'Sessions', value: course.sessionCount || 0, icon: CalendarDays },
          { label: 'Active Sessions', value: course.activeSessionCount || 0, icon: Clock3 },
        ].map((stat) => (
          <div key={stat.label} className="card">
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-md bg-primary/5">
                <stat.icon className="h-5 w-5 text-primary" />
              </div>
            </div>
            <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-4">{stat.label}</p>
            <h2 className="text-3xl font-black text-text-primary mt-2">{stat.value}</h2>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Enrolled Students</h2>
              <p className="text-sm text-text-secondary">Students linked to this course record.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-2 py-1 rounded-full">
              {enrolledStudents.length}
            </span>
          </div>

          {enrolledStudents.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No enrolled students have been synced for this course yet.
            </p>
          ) : (
            <div className="space-y-3">
              {enrolledStudents.map((student) => (
                <div key={student._id} className="rounded-lg border border-slate-200 px-4 py-3">
                  <p className="font-semibold text-text-primary">{student.name}</p>
                  <p className="text-xs text-text-secondary">{student.studentId}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Recorded Students</h2>
              <p className="text-sm text-text-secondary">Students who have already scanned into this course.</p>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-success bg-success/10 px-2 py-1 rounded-full">
              {recordedStudents.length}
            </span>
          </div>

          {recordedStudents.length === 0 ? (
            <p className="text-sm text-text-secondary">
              No attendance scans have been recorded for this course yet.
            </p>
          ) : (
            <div className="space-y-3">
              {recordedStudents.map((student) => (
                <div key={student._id} className="rounded-lg border border-slate-200 px-4 py-3">
                  <p className="font-semibold text-text-primary">{student.name}</p>
                  <p className="text-xs text-text-secondary">{student.studentId}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-xl font-bold text-text-primary">Recent Sessions</h2>
            <p className="text-sm text-text-secondary">Allocated class size appears on each session below.</p>
          </div>
        </div>

        {recentSessions.length === 0 ? (
          <p className="text-sm text-text-secondary">No sessions have been created for this course yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-widest text-text-secondary">
                <tr>
                  <th className="py-3 pr-4">Session</th>
                  <th className="py-3 pr-4">Started</th>
                  <th className="py-3 pr-4">Expected Students</th>
                  <th className="py-3 pr-4">Status</th>
                  <th className="py-3 text-right">Open</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentSessions.map((session) => (
                  <tr key={session._id}>
                    <td className="py-4 pr-4 font-medium text-text-primary">{course.code}</td>
                    <td className="py-4 pr-4 text-text-secondary">{new Date(session.startTime).toLocaleString()}</td>
                    <td className="py-4 pr-4 text-text-secondary">
                      {session.expectedStudentCount ?? enrolledStudents.length ?? 0}
                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider ${
                          session.status === 'active'
                            ? 'bg-success/10 text-success'
                            : session.status === 'expired'
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {session.status}
                      </span>
                    </td>
                    <td className="py-4 text-right">
                      <Link href={`/dashboard/lecturer/sessions/${session._id}`} className="text-primary font-semibold hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CourseSessionModal
        isOpen={isSessionModalOpen}
        onClose={() => setIsSessionModalOpen(false)}
        lecturerId={lecturerId}
        onCreated={loadCourse}
      />
    </div>
  );
}
