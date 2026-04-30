'use client';

import { useState } from 'react';
import Sidebar from '@/components/dashboard/sidebar';
import Navbar from '@/components/dashboard/navbar';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  // Determine role based on URL path
  let role: 'student' | 'lecturer' | 'admin' = 'student';
  if (pathname.includes('/lecturer')) role = 'lecturer';
  if (pathname.includes('/admin')) role = 'admin';

  return (
    <div className="min-h-screen bg-bg-light">
      <Sidebar 
        role={role} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />
      <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
      
      {/* Main Content Area */}
      <main className="pt-16 md:ml-64 min-h-screen p-6 md:p-10">
        <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}

