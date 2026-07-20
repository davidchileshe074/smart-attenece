'use client';

import { useState } from 'react';
import { UserPlus, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function CreateUserPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, message: string}>({
    type: null,
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: null, message: '' });

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (data.success) {
        setStatus({
          type: 'success',
          message: `User ${data.user.name} created successfully as ${data.user.role}.`
        });
        setFormData({
          name: '',
          email: '',
          password: '',
          role: 'student',
        });
      } else {
        setStatus({
          type: 'error',
          message: data.error || 'Failed to create user'
        });
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'A network error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
          <UserPlus className="h-6 w-6 text-primary" />
          Create New User
        </h1>
        <p className="text-text-secondary text-sm mt-1">
          Add a new student, lecturer, or administrator to the system.
        </p>
      </div>

      {status.type === 'success' && (
        <div className="flex items-center gap-3 p-4 bg-success/10 text-success rounded-md border border-success/20">
          <CheckCircle2 className="h-5 w-5" />
          <p className="font-medium">{status.message}</p>
        </div>
      )}

      {status.type === 'error' && (
        <div className="flex items-center gap-3 p-4 bg-error/10 text-error rounded-md border border-error/20">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">{status.message}</p>
        </div>
      )}

      <div className="card p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Full Name</label>
              <input 
                type="text" 
                name="name"
                required
                className="input-base"
                placeholder="e.g. John Doe"
                value={formData.name}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Email Address</label>
              <input 
                type="email" 
                name="email"
                required
                className="input-base"
                placeholder="name@university.edu"
                value={formData.email}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Password</label>
              <input 
                type="password" 
                name="password"
                required
                minLength={8}
                className="input-base"
                placeholder="At least 8 characters"
                value={formData.password}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-1.5">Role</label>
              <select 
                name="role"
                className="input-base"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {loading ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
