'use client';

import { useState, useEffect } from 'react';

export default function LecturerSessionsPage() {
  const [sessions, setSessions] = useState([]);

  useEffect(() => {
    const fetchSessions = async () => {
      const res = await fetch('/api/sessions');
      const data = await res.json();
      if (data.success) setSessions(data.data);
    };
    fetchSessions();
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Attendance Sessions</h1>
      
      <div className="glass-card overflow-hidden !p-0">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Course</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Date</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Duration</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600">Status</th>
              <th className="px-6 py-4 text-sm font-bold text-gray-600 text-right">Actions</th>
            </tr>
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
