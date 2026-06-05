'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarPlus, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { COURSE_CATALOG, findProgramByKey } from '@/lib/course-catalog';

type Course = {
  _id: string;
  code: string;
  title: string;
};

interface CourseSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  lecturerId: string;
  onCreated: () => void | Promise<void>;
}

export default function CourseSessionModal({
  isOpen,
  onClose,
  lecturerId,
  onCreated,
}: CourseSessionModalProps) {
  const router = useRouter();
  const [existingCourses, setExistingCourses] = useState<Course[]>([]);
  const [programKey, setProgramKey] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [durationInMinutes, setDurationInMinutes] = useState('60');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchCourses = useCallback(async () => {
    if (!lecturerId) return;

    try {
      const res = await fetch(`/api/courses?lecturerId=${lecturerId}`);
      const data = await res.json();
      if (data.success) {
        setExistingCourses(data.data || []);
      }
    } catch {
      setError('Failed to load your course list.');
    }
  }, [lecturerId]);

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      void fetchCourses();
    }, 0);

    return () => clearTimeout(timer);
  }, [fetchCourses, isOpen]);

  const selectedProgram = useMemo(() => findProgramByKey(programKey), [programKey]);
  const selectedCourse = useMemo(() => {
    if (!selectedProgram) return null;
    return selectedProgram.courses.find((course) => course.code === courseCode) || null;
  }, [courseCode, selectedProgram]);

  const handleProgramChange = (nextProgramKey: string) => {
    setProgramKey(nextProgramKey);
    setCourseCode('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!lecturerId) {
      setError('Your profile is still loading. Please try again in a moment.');
      return;
    }

    if (!selectedProgram || !selectedCourse) {
      setError('Please choose both a programme and a course.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const existingCourse = existingCourses.find((course) => course.code === selectedCourse.code);
      let courseId = existingCourse?._id;

      if (!courseId) {
        const createCourseRes = await fetch('/api/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: selectedCourse.title,
            code: selectedCourse.code,
            lecturer: lecturerId,
            description: selectedProgram.label,
          }),
        });

        const createCourseData = await createCourseRes.json();

        if (!createCourseData.success) {
          throw new Error(createCourseData.error || 'Failed to create course');
        }

        courseId = createCourseData.data?._id;
        if (!courseId) {
          throw new Error('Course was created but its ID could not be read.');
        }
      }

      const sessionRes = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          lecturerId,
          durationInMinutes: parseInt(durationInMinutes, 10),
        }),
      });

      const sessionData = await sessionRes.json();

      if (!sessionData.success) {
        throw new Error(sessionData.error || 'Failed to create session');
      }

      onCreated();
      onClose();
      router.push(`/dashboard/lecturer/sessions/${sessionData.data._id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong while creating the session.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-lg bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 p-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-primary">Course Manager</p>
            <h2 className="mt-2 text-2xl font-bold text-text-primary">Select programme and course</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Pick a programme, choose a course, and we will create the session for you.
            </p>
          </div>
          <button onClick={onClose} className="rounded-sm p-2 text-text-secondary hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div className="flex gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">Programme</label>
              <select
                required
                value={programKey}
                onChange={(e) => handleProgramChange(e.target.value)}
                className="input-base h-11"
              >
                <option value="">Choose a programme...</option>
                {COURSE_CATALOG.map((program) => (
                  <option key={program.key} value={program.key}>
                    {program.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-primary">Course</label>
              <select
                required
                disabled={!selectedProgram}
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                className="input-base h-11 disabled:cursor-not-allowed disabled:bg-slate-50"
              >
                <option value="">Choose a course...</option>
                {(selectedProgram?.courses || []).map((course) => (
                  <option key={course.code} value={course.code}>
                    {course.code} - {course.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-text-primary">Duration in minutes</label>
            <input
              type="number"
              min="5"
              max="480"
              required
              value={durationInMinutes}
              onChange={(e) => setDurationInMinutes(e.target.value)}
              className="input-base h-11"
            />
            <p className="mt-1 text-xs text-text-secondary">The session will start immediately after creation.</p>
          </div>

          {selectedCourse && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-text-secondary">
              <p className="font-semibold text-text-primary">{selectedCourse.code}</p>
              <p className="mt-1">{selectedCourse.title}</p>
              <p className="mt-2 text-xs uppercase tracking-widest text-text-secondary">
                {selectedProgram?.label}
              </p>
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 justify-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center gap-2 disabled:opacity-50"
            >
              <CalendarPlus className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
