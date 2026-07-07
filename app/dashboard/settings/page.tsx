'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Lock, UserCircle2 } from 'lucide-react';
import Link from 'next/link';

type Profile = {
  name: string;
  email: string;
  role: string;
  studentId?: string | null;
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      const res = await fetch('/api/auth/me');
      const data = await res.json();

      if (data.success && data.data) {
        setProfile(data.data);
      }
    };

    void loadProfile();
  }, []);

  return (
    <div className="space-y-8 max-w-4xl">
      <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Account Settings</p>
        <h1 className="text-3xl font-bold text-text-primary mt-1">Profile and preferences</h1>
        <p className="text-text-secondary mt-2">Your account information is shown below for quick reference.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <UserCircle2 className="h-5 w-5 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-4">Name</p>
          <p className="text-lg font-bold text-text-primary mt-1">{profile?.name || 'Loading...'}</p>
        </div>
        <div className="card">
          <Bell className="h-5 w-5 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-4">Email</p>
          <p className="text-lg font-bold text-text-primary mt-1 break-all">{profile?.email || 'Loading...'}</p>
        </div>
        <div className="card">
          <Lock className="h-5 w-5 text-primary" />
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mt-4">Role</p>
          <p className="text-lg font-bold text-text-primary mt-1 capitalize">{profile?.role || 'Loading...'}</p>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xl font-bold text-text-primary">What is available here</h2>
        <p className="text-sm text-text-secondary">
          This area is now a real route, so the settings icon and sidebar link no longer dead-end. It can be extended
          later for password changes, profile edits, and notification preferences.
        </p>
      </div>
    </div>
  );
}
