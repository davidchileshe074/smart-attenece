'use client';

import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import CourseSessionModal from '@/components/lecturer/course-session-modal';
import { LoadingState } from '@/components/ui/status-state';

export default function LecturerCoursesPage() {
  type Course = {
    _id: string;
    code: string;
    title: string;
    students?: unknown[];
  };

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [lecturerName, setLecturerName] = useState('Lecturer');
  const [lecturerId, setLecturerId] = useState('');
  const [isCourseModalOpen, setIsCourseModalOpen] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();

        if (meData.success) {
          setLecturerName(meData.data.name || 'Lecturer');
          setLecturerId(meData.data.id);
          const res = await fetch(`/api/courses?lecturerId=${meData.data.id}`);
          const data = await res.json();
          if (data.success) setCourses(data.data || []);
        }
      } catch {
        // Keep the UI responsive even if the initial fetch fails.
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const refreshCourses = async () => {
    if (!lecturerId) return;

    const res = await fetch(`/api/courses?lecturerId=${lecturerId}`);
    const data = await res.json();
    if (data.success) {
      setCourses(data.data || []);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Course Management</p>
        <h1 className="text-3xl font-bold text-text-primary mt-1">Manage Your Courses</h1>
        <p className="text-text-secondary mt-2">Courses currently assigned to {lecturerName}.</p>
      </div>

      {loading ? (
        <LoadingState title="Loading courses" description="Fetching your assigned course list." compact />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <div key={course._id} className="card hover:border-primary transition-all">
              <span className="text-xs font-bold text-primary uppercase">{course.code}</span>
              <h3 className="text-xl font-bold mt-1 mb-4 text-text-primary">{course.title}</h3>
              <div className="flex justify-between items-center text-sm text-text-secondary">
                <span>{course.students?.length || 0} Students</span>
                <button className="text-primary font-semibold hover:underline">View Details</button>
              </div>
            </div>
          ))}

          <button
            onClick={() => setIsCourseModalOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-slate-50 transition-all group"
            type="button"
          >
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-bold text-slate-400 group-hover:text-primary">Add New Course</span>
          </button>
        </div>
      )}

      <CourseSessionModal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        lecturerId={lecturerId}
        onCreated={refreshCourses}
      />
    </div>
  );
}
