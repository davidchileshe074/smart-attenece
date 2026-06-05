'use client';

import { useState, useEffect } from 'react';
import { Users, Clock, AlertCircle } from 'lucide-react';

interface AttendanceRecord {
  _id: string;
  student: { name: string; studentId: string };
  timestamp: string;
  status: 'present' | 'late';
  location?: { coordinates: number[] };
}

interface LiveAttendanceProps {
  sessionId: string;
  courseName: string;
  timeRemaining: number;
}

export default function LiveAttendance({ sessionId, courseName, timeRemaining }: LiveAttendanceProps) {
  const [attendanceList, setAttendanceList] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await fetch(`/api/sessions/${sessionId}/attendance`);
        const data = await res.json();
        if (data.success) {
          setAttendanceList(data.data || []);
        }
      } catch (err) {
        console.error('Failed to fetch attendance:', err);
      } finally {
        setLoading(false);
      }
    };

    if (autoRefresh) {
      const timer = setInterval(fetchAttendance, 3000); // Refresh every 3 seconds
      fetchAttendance();
      return () => clearInterval(timer);
    }
  }, [sessionId, autoRefresh]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isTimeWarning = timeRemaining < 300; // 5 minutes

  return (
    <div className="card space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-text-primary">{courseName}</h3>
          <p className="text-sm text-text-secondary">Live Attendance Tracking</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full text-sm font-semibold ${isTimeWarning ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
            <Clock className="inline h-4 w-4 mr-1" />
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
          <p className="text-xs text-green-700 font-semibold">PRESENT</p>
          <p className="text-2xl font-bold text-green-900 mt-1">
            {attendanceList.filter((a) => a.status === 'present').length}
          </p>
        </div>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-center">
          <p className="text-xs text-orange-700 font-semibold">LATE</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">
            {attendanceList.filter((a) => a.status === 'late').length}
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer">
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
            className="rounded"
          />
          Auto-refresh
        </label>
      </div>

      {/* Attendance List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-text-secondary">
            <div className="inline-block animate-spin">⏳</div>
            <p className="text-sm mt-2">Loading attendance...</p>
          </div>
        ) : attendanceList.length === 0 ? (
          <div className="text-center py-8 text-text-secondary">
            <Users className="h-8 w-8 mx-auto opacity-20 mb-2" />
            <p className="text-sm">Waiting for students to scan...</p>
          </div>
        ) : (
          attendanceList.map((record) => (
            <div
              key={record._id}
              className="flex justify-between items-center p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
            >
              <div>
                <p className="font-semibold text-sm text-text-primary">{record.student.name}</p>
                <p className="text-xs text-text-secondary">{record.student.studentId}</p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold px-2 py-1 rounded ${
                    record.status === 'present'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-orange-100 text-orange-700'
                  }`}
                >
                  {record.status === 'present' ? '✓ Present' : '⏱ Late'}
                </span>
                <span className="text-xs text-text-secondary">
                  {new Date(record.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {isTimeWarning && timeRemaining > 0 && (
        <div className="flex gap-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <AlertCircle className="h-4 w-4 flex-shrink-0 text-orange-700 mt-0.5" />
          <p className="text-xs text-orange-700">
            <strong>Ending soon!</strong> Students have {formatTime(timeRemaining)} left to scan.
          </p>
        </div>
      )}
    </div>
  );
}
