'use client';

import { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  MoreVertical, 
  UserPlus,
  Mail,
  Shield,
  UserCheck,
  Filter
} from 'lucide-react';

export default function AdminUsersPage() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Simulate fetching users
    const timer = setTimeout(() => {
      setUsers([
        { id: 1, name: 'Dr. John Doe', email: 'j.doe@univ.edu', role: 'Lecturer', status: 'Active' },
        { id: 2, name: 'Jane Smith', email: 'j.smith@student.edu', role: 'Student', status: 'Active' },
        { id: 3, name: 'Admin Chileshe', email: 'admin@system.com', role: 'Admin', status: 'Active' },
        { id: 4, name: 'Mark Wilson', email: 'm.wilson@student.edu', role: 'Student', status: 'Suspended' },
        { id: 5, name: 'Sarah Parker', email: 's.parker@univ.edu', role: 'Lecturer', status: 'Active' },
      ]);
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary text-sm">Create, manage, and audit system users.</p>
        </div>
        <button className="btn-primary gap-2">
          <UserPlus className="h-4 w-4" />
          Add New User
        </button>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by name, email, or role..." 
            className="input-base pl-10"
          />
        </div>
        <button className="btn-secondary gap-2 text-xs">
          <Filter className="h-4 w-4" />
          More Filters
        </button>
      </div>

      {/* Users Table */}
      <div className="card !p-0 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">User</th>
              <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase">Role</th>
              <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase text-right">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-text-secondary uppercase text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {loading ? (
              [1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td className="px-6 py-4"><div className="h-10 w-48 bg-slate-100 animate-pulse rounded" /></td>
                  <td className="px-6 py-4"><div className="h-4 w-20 bg-slate-100 animate-pulse rounded" /></td>
                  <td className="px-6 py-4 text-right flex justify-end"><div className="h-6 w-16 bg-slate-100 animate-pulse rounded-full" /></td>
                  <td className="px-6 py-4 text-right"><div className="h-4 w-4 bg-slate-100 animate-pulse rounded ml-auto" /></td>
                </tr>
              ))
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200">
                        {user.role === 'Lecturer' ? <Shield className="h-4 w-4 text-primary" /> : <UserCheck className="h-4 w-4 text-slate-500" />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-primary">{user.name}</p>
                        <p className="text-[10px] text-text-secondary flex items-center gap-1 uppercase tracking-wider">
                          <Mail className="h-2 w-2" /> {user.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-medium text-text-primary">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter ${
                      user.status === 'Active' ? 'bg-success/10 text-success' : 'bg-error/10 text-error'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="h-8 w-8 hover:bg-slate-100 rounded-md flex items-center justify-center ml-auto transition-colors">
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Placeholder */}
      <div className="flex justify-between items-center text-sm text-text-secondary px-2">
        <p>Showing 1 to 5 of 4,821 users</p>
        <div className="flex gap-2">
          <button className="btn-secondary py-1.5 px-3 disabled:opacity-30" disabled>Previous</button>
          <button className="btn-secondary py-1.5 px-3">Next</button>
        </div>
      </div>
    </div>
  );
}
