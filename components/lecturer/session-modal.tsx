'use client';

import { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface SessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  lecturerId: string;
}

export default function SessionModal({ isOpen, onClose, onSuccess, lecturerId }: SessionModalProps) {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    courseId: '',
    durationInMinutes: '60',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
    }
  }, [isOpen]);

  const fetchCourses = async () => {
    try {
      const res = await fetch(`/api/courses?lecturerId=${lecturerId}`);
      const data = await res.json();
      if (data.success) {
        setCourses(data.data || []);
      }
    } catch (err) {
      setError('Failed to load courses');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: formData.courseId,
          lecturerId,
          durationInMinutes: parseInt(formData.durationInMinutes),
        }),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || 'Failed to create session');
        return;
      }

      setFormData({ courseId: '', durationInMinutes: '60' });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-text-primary">Create New Session</h2>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          {/* Course Selection */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Select Course
            </label>
            <select
              required
              value={formData.courseId}
              onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Choose a course...</option>
              {courses.map((course) => (
                <option key={course._id} value={course._id}>
                  {course.code} - {course.title}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-semibold text-text-primary mb-2">
              Duration (minutes)
            </label>
            <input
              type="number"
              required
              min="5"
              max="480"
              value={formData.durationInMinutes}
              onChange={(e) => setFormData({ ...formData, durationInMinutes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="text-xs text-text-secondary mt-1">
              Students can scan QR within this duration
            </p>
          </div>

          {/* Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
            <p className="font-semibold mb-1">ℹ️ How it works:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Session starts immediately upon creation</li>
              <li>QR code will be available to display/project</li>
              <li>Students can scan within the duration window</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-text-primary hover:bg-gray-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Session'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
