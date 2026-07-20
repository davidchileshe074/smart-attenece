import { 
  Search, 
  MoreVertical, 
  UserPlus,
  Mail,
  Shield,
  UserCheck,
  Filter
} from 'lucide-react';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AdminUsersPage() {
  await connectDB();
  
  // Fetch users from DB
  const users = await User.find().lean().sort({ createdAt: -1 });
  const totalUsers = await User.countDocuments();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">User Management</h1>
          <p className="text-text-secondary text-sm">Create, manage, and audit system users.</p>
        </div>
        <Link href="/dashboard/admin/create-user" className="btn-primary gap-2 flex items-center">
          <UserPlus className="h-4 w-4" />
          Add New User
        </Link>
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
        <button className="btn-secondary gap-2 text-xs flex items-center">
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
            {users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-text-secondary">
                  No users found in the system.
                </td>
              </tr>
            ) : (
              users.map((user: any) => (
                <tr key={user._id.toString()} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200">
                        {user.role === 'lecturer' ? <Shield className="h-4 w-4 text-primary" /> : <UserCheck className="h-4 w-4 text-slate-500" />}
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
                    <span className="text-xs font-medium text-text-primary capitalize">{user.role}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-tighter bg-success/10 text-success">
                      Active
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

      {/* Pagination Footer */}
      <div className="flex justify-between items-center text-sm text-text-secondary px-2">
        <p>Showing 1 to {users.length} of {totalUsers} users</p>
        <div className="flex gap-2">
          <button className="btn-secondary py-1.5 px-3 disabled:opacity-30" disabled>Previous</button>
          <button className="btn-secondary py-1.5 px-3 disabled:opacity-30" disabled>Next</button>
        </div>
      </div>
    </div>
  );
}
