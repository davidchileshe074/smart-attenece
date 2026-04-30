'use client';

import { Bell, Search, User, Menu } from 'lucide-react';

interface NavbarProps {
  onMenuClick?: () => void;
}

export default function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-100 fixed top-0 right-0 left-0 md:left-64 z-40 px-6 flex items-center justify-between">
      {/* Mobile Menu Toggle */}
      <button 
        onClick={onMenuClick}
        className="md:hidden p-2 -ml-2 hover:bg-slate-100 rounded-md transition-colors"
      >
        <Menu className="h-5 w-5 text-text-primary" />
      </button>

      {/* Search Bar (Linear style) */}

      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-md border border-slate-200 text-slate-500 w-64 cursor-pointer hover:bg-slate-200 transition-colors">
        <Search className="h-4 w-4" />
        <span className="text-xs font-medium">Search anything...</span>
        <span className="ml-auto text-[10px] bg-white px-1.5 py-0.5 rounded border border-slate-300">⌘K</span>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-4">
        <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-slate-100 transition-colors relative">
          <Bell className="h-4 w-4 text-slate-600" />
          <span className="absolute top-2 right-2 h-1.5 w-1.5 bg-error rounded-full" />
        </button>
        
        <div className="h-6 w-px bg-slate-200 mx-1" />

        <div className="flex items-center gap-3 cursor-pointer group">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-text-primary group-hover:text-primary transition-colors">David Chileshe</p>
            <p className="text-[10px] text-text-secondary uppercase tracking-wider font-semibold">Lecturer</p>
          </div>
          <div className="h-8 w-8 bg-slate-100 rounded-md flex items-center justify-center border border-slate-200 group-hover:border-primary/30 transition-all">
            <User className="h-4 w-4 text-slate-500" />
          </div>
        </div>
      </div>
    </header>
  );
}
