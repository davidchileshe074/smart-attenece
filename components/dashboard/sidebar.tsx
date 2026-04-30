'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  BookOpen, 
  History, 
  QrCode, 
  Users, 
  BarChart3, 
  Settings,
  LogOut,
  ShieldCheck,
  X
} from 'lucide-react';

interface SidebarProps {
  role: 'student' | 'lecturer' | 'admin';
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ role, isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  const links = {
    lecturer: [
      { name: 'Dashboard', href: '/dashboard/lecturer', icon: LayoutDashboard },
      { name: 'Courses', href: '/dashboard/lecturer/courses', icon: BookOpen },
      { name: 'Sessions', href: '/dashboard/lecturer/sessions', icon: History },
      { name: 'Live View', href: '/dashboard/lecturer/live', icon: QrCode },
    ],
    student: [
      { name: 'Home', href: '/dashboard/student', icon: LayoutDashboard },
      { name: 'Scan QR', href: '/dashboard/student/scan', icon: QrCode },
      { name: 'History', href: '/dashboard/student/history', icon: History },
    ],
    admin: [
      { name: 'Admin Hub', href: '/dashboard/admin', icon: LayoutDashboard },
      { name: 'Manage Users', href: '/dashboard/admin/users', icon: Users },
      { name: 'System Reports', href: '/dashboard/admin/reports', icon: BarChart3 },
    ]
  };

  const currentLinks = links[role] || [];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-bg-dark/50 backdrop-blur-sm z-[60] md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={`
        w-64 h-screen bg-white border-r border-slate-200 fixed left-0 top-0 flex flex-col z-[70] transition-transform duration-300
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-md flex items-center justify-center">
              <ShieldCheck className="text-white h-5 w-5" />
            </div>
            <span className="font-bold text-text-primary tracking-tight">Smart Attend</span>
          </Link>
          <button onClick={onClose} className="md:hidden p-1 hover:bg-slate-100 rounded-md">
            <X className="h-5 w-5 text-text-secondary" />
          </button>
        </div>


      {/* Nav Links */}
      <div className="flex-1 py-6 px-4 space-y-1">
        {currentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                isActive 
                  ? 'bg-primary/5 text-primary shadow-sm border border-primary/10' 
                  : 'text-text-secondary hover:bg-slate-50 hover:text-text-primary'
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-slate-400'}`} />
              {link.name}
            </Link>
          );
        })}
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-slate-100">
        <Link 
          href="/dashboard/settings"
          className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-slate-50 hover:text-text-primary transition-all mb-1"
        >
          <Settings className="h-4 w-4 text-slate-400" />
          Settings
        </Link>
        <button className="flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium text-text-secondary hover:bg-red-50 hover:text-error transition-all w-full text-left">
          <LogOut className="h-4 w-4 text-slate-400" />
          Sign out
        </button>
      </div>
    </aside>
    </>
  );
}

