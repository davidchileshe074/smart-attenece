'use client';

import { useEffect, useState } from 'react';

export default function LecturerCoursesPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lecturerName, setLecturerName] = useState('Lecturer');

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();

        if (meData.success) {
          setLecturerName(meData.data.name || 'Lecturer');
          const res = await fetch(`/api/courses?lecturerId=${meData.data.id}`);
          const data = await res.json();
          if (data.success) setCourses(data.data || []);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Course Management</p>
        <h1 className="text-3xl font-bold text-text-primary mt-1">Manage Your Courses</h1>
        <p className="text-text-secondary mt-2">Courses currently assigned to {lecturerName}.</p>
      </div>

      {loading ? (
        <div className="card text-center py-12 text-text-secondary">Loading courses...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: any) => (
            <div key={course._id} className="card hover:border-primary transition-all">
              <span className="text-xs font-bold text-primary uppercase">{course.code}</span>
              <h3 className="text-xl font-bold mt-1 mb-4 text-text-primary">{course.title}</h3>
              <div className="flex justify-between items-center text-sm text-text-secondary">
                <span>{course.students?.length || 0} Students</span>
                <button className="text-primary font-semibold hover:underline">View Details</button>
              </div>
            </div>
          ))}

          <button className="border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-slate-50 transition-all group">
            <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center mb-3 group-hover:bg-primary group-hover:text-white transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <span className="font-bold text-slate-400 group-hover:text-primary">Add New Course</span>
          </button>
        </div>
      )}
    </div>
  );
}
