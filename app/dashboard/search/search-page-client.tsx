'use client';

import { useEffect, useMemo, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Search, BookOpen, History, Users } from 'lucide-react';
import { LoadingState } from '@/components/ui/status-state';

type Course = {
  _id: string;
  code: string;
  title: string;
  studentCount?: number;
};

type Session = {
  _id: string;
  course: { code: string; title: string };
  status: 'active' | 'expired' | 'scheduled';
  startTime: string;
  endTime: string;
  expectedStudentCount?: number | null;
};

type AttendanceRecord = {
  _id: string;
  student?: { name?: string; studentId?: string };
  course?: { code?: string; title?: string };
  session?: { _id?: string; startTime?: string; endTime?: string; status?: string };
};

export default function DashboardSearchClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(() => initialQuery);
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError('');

        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();

        if (!meData.success) {
          throw new Error(meData.error || 'Failed to load profile');
        }

        const currentRole = (meData.data.role || 'student') as 'student' | 'lecturer' | 'admin';

        if (currentRole === 'lecturer') {
          const [coursesRes, sessionsRes] = await Promise.all([
            fetch(`/api/courses?lecturerId=${meData.data.id}`),
            fetch(`/api/sessions?lecturerId=${meData.data.id}`),
          ]);

          const [coursesData, sessionsData] = await Promise.all([coursesRes.json(), sessionsRes.json()]);

          if (!coursesData.success) {
            throw new Error(coursesData.error || 'Failed to load courses');
          }
          if (!sessionsData.success) {
            throw new Error(sessionsData.error || 'Failed to load sessions');
          }

          setCourses(coursesData.data || []);
          setSessions(sessionsData.data || []);
        } else if (currentRole === 'admin') {
          const [coursesRes, sessionsRes, attendanceRes] = await Promise.all([
            fetch('/api/courses'),
            fetch('/api/sessions'),
            fetch('/api/attendance'),
          ]);

          const [coursesData, sessionsData, attendanceData] = await Promise.all([
            coursesRes.json(),
            sessionsRes.json(),
            attendanceRes.json(),
          ]);

          if (!coursesData.success) {
            throw new Error(coursesData.error || 'Failed to load courses');
          }
          if (!sessionsData.success) {
            throw new Error(sessionsData.error || 'Failed to load sessions');
          }
          if (!attendanceData.success) {
            throw new Error(attendanceData.error || 'Failed to load attendance');
          }

          setCourses(coursesData.data || []);
          setSessions(sessionsData.data || []);
          setAttendance(attendanceData.data || []);
        } else {
          const attendanceRes = await fetch(`/api/attendance?studentId=${meData.data.id}`);
          const attendanceData = await attendanceRes.json();

          if (!attendanceData.success) {
            throw new Error(attendanceData.error || 'Failed to load attendance');
          }

          setAttendance(attendanceData.data || []);
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Failed to load search data');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const normalizedQuery = query.trim().toLowerCase();

  const courseResults = useMemo(
    () =>
      courses.filter((course) =>
        [course.code, course.title].some((value) => value.toLowerCase().includes(normalizedQuery))
      ),
    [courses, normalizedQuery]
  );

  const sessionResults = useMemo(
    () =>
      sessions.filter((session) =>
        [session.course.code, session.course.title, session.status].some((value) =>
          value.toLowerCase().includes(normalizedQuery)
        )
      ),
    [normalizedQuery, sessions]
  );

  const attendanceResults = useMemo(
    () =>
      attendance.filter((record) =>
        [
          record.student?.name || '',
          record.student?.studentId || '',
          record.course?.code || '',
          record.course?.title || '',
        ].some((value) => value.toLowerCase().includes(normalizedQuery))
      ),
    [attendance, normalizedQuery]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextQuery = query.trim();
    router.replace(nextQuery ? `/dashboard/search?q=${encodeURIComponent(nextQuery)}` : '/dashboard/search');
  };

  if (loading) {
    return (
      <LoadingState
        title="Searching dashboard"
        description="Loading the course, session, and attendance sources."
        compact
      />
    );
  }

  if (error) {
    return (
      <div className="card">
        <p className="text-red-700 font-medium">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Search</p>
        <h1 className="text-3xl font-bold text-text-primary mt-1">Find courses, sessions, and scans</h1>
        <p className="text-text-secondary mt-2">Search results are filtered from your accessible dashboard data.</p>
      </div>

      <form onSubmit={handleSubmit} className="card flex items-center gap-3">
        <Search className="h-5 w-5 text-slate-400" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="w-full bg-transparent outline-none text-text-primary placeholder:text-slate-400"
          placeholder="Search by course code, title, student ID, or session status..."
        />
        <button type="submit" className="btn-primary">
          Search
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <BookOpen className="h-5 w-5 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-4">Courses</p>
          <p className="text-3xl font-black text-text-primary mt-2">{courseResults.length}</p>
        </div>
        <div className="card">
          <History className="h-5 w-5 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-4">Sessions</p>
          <p className="text-3xl font-black text-text-primary mt-2">{sessionResults.length}</p>
        </div>
        <div className="card">
          <Users className="h-5 w-5 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-4">Attendance</p>
          <p className="text-3xl font-black text-text-primary mt-2">{attendanceResults.length}</p>
        </div>
      </div>

      {!normalizedQuery ? (
        <div className="card text-text-secondary">Type a search term above to filter your data.</div>
      ) : (
        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">Courses</h2>
            {courseResults.length === 0 ? (
              <p className="text-text-secondary">No matching courses.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courseResults.map((course) => (
                  <Link
                    key={course._id}
                    href={`/dashboard/lecturer/courses/${course._id}`}
                    className="card hover:border-primary transition"
                  >
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">{course.code}</p>
                    <h3 className="text-lg font-bold text-text-primary mt-2">{course.title}</h3>
                    <p className="text-sm text-text-secondary mt-2">{course.studentCount ?? 0} students enrolled</p>
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">Sessions</h2>
            {sessionResults.length === 0 ? (
              <p className="text-text-secondary">No matching sessions.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sessionResults.map((session) => (
                  <div key={session._id} className="card">
                    <p className="text-xs font-bold uppercase tracking-widest text-primary">{session.course.code}</p>
                    <h3 className="text-lg font-bold text-text-primary mt-2">{session.course.title}</h3>
                    <p className="text-sm text-text-secondary mt-2 capitalize">Status: {session.status}</p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold text-text-primary">Attendance</h2>
            {attendanceResults.length === 0 ? (
              <p className="text-text-secondary">No matching attendance records.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {attendanceResults.map((record) => (
                  <div key={record._id} className="card">
                    <h3 className="text-lg font-bold text-text-primary">
                      {record.student?.name || record.student?.studentId || 'Unknown student'}
                    </h3>
                    <p className="text-sm text-text-secondary mt-2">
                      {record.course?.code || 'Unknown course'} {record.course?.title ? `- ${record.course.title}` : ''}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
