'use client';

import { useState, useEffect } from 'react';
import { Loader2, ShieldCheck } from 'lucide-react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 320);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/95 backdrop-blur-sm animate-out fade-out duration-500 fill-mode-forwards">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 bg-primary rounded-md flex items-center justify-center mb-4 shadow-lg shadow-primary/20">
          <ShieldCheck className="text-white h-8 w-8" />
        </div>
        <p className="text-xs font-bold text-text-primary tracking-[0.2em] uppercase">
          Smart Attendance
        </p>
        <div className="mt-4 flex items-center gap-2 text-text-secondary">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span className="text-xs font-medium">Loading workspace</span>
        </div>
        <div className="w-32 h-0.5 bg-slate-100 mt-4 overflow-hidden rounded-full">
          <div className="h-full bg-primary w-1/3 animate-[loading_1.1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
