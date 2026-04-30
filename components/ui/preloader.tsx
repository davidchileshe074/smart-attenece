'use client';

import { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';

export default function Preloader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white animate-out fade-out duration-500 fill-mode-forwards">
      <div className="flex flex-col items-center">
        <div className="h-16 w-16 bg-primary rounded-md flex items-center justify-center mb-4 animate-bounce">
          <ShieldCheck className="text-white h-8 w-8" />
        </div>
        <p className="text-xs font-bold text-text-primary tracking-[0.2em] uppercase">
          Smart Attendance
        </p>
        <div className="w-32 h-0.5 bg-slate-100 mt-4 overflow-hidden rounded-full">
          <div className="h-full bg-primary w-1/2 animate-[loading_1s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
