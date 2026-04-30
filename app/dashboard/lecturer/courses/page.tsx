'use client';

import { useState, useEffect } from 'react';

export default function LecturerCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      const res = await fetch('/api/courses');
      const data = await res.json();
      if (data.success) setCourses(data.data);
      setLoading(false);
    };
    fetchCourses();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Manage Your Courses</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: any) => (
          <div key={course._id} className="glass-card hover:border-brand-blue transition-all">
            <span className="text-xs font-bold text-brand-blue uppercase">{course.code}</span>
            <h3 className="text-xl font-bold mt-1 mb-4">{course.title}</h3>
            <div className="flex justify-between items-center text-sm text-gray-500">
              <span>0 Students</span>
              <button className="text-brand-blue font-semibold hover:underline">View Details</button>
            </div>
          </div>
        ))}
        
        {/* Create Course Placeholder */}
        <button className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 hover:bg-gray-50 transition-all group">
          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center mb-3 group-hover:bg-brand-blue group-hover:text-white transition-all">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="font-bold text-gray-400 group-hover:text-brand-blue">Add New Course</span>
        </button>
      </div>
    </div>
  );
}
