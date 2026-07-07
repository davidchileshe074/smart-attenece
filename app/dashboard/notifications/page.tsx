'use client';

import Link from 'next/link';
import { ArrowLeft, BellRing, CircleAlert, CheckCircle2 } from 'lucide-react';

const notifications = [
  {
    title: 'Session expiring soon',
    message: 'Your active session will end in 15 minutes.',
    tone: 'warning',
  },
  {
    title: 'Attendance scan received',
    message: 'A student has just marked attendance in your live session.',
    tone: 'success',
  },
  {
    title: 'Low attendance alert',
    message: 'A class report is now ready for review.',
    tone: 'info',
  },
] as const;

export default function NotificationsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      <Link href="/dashboard" className="flex items-center gap-2 text-primary hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-text-secondary">Notifications</p>
        <h1 className="text-3xl font-bold text-text-primary mt-1">Recent alerts and updates</h1>
        <p className="text-text-secondary mt-2">This page gives the bell icon a real destination.</p>
      </div>

      <div className="card space-y-4">
        {notifications.map((notification) => (
          <div
            key={notification.title}
            className="flex items-start gap-4 rounded-lg border border-slate-200 bg-white px-4 py-3"
          >
            <div className="mt-0.5">
              {notification.tone === 'warning' ? (
                <CircleAlert className="h-5 w-5 text-warning" />
              ) : notification.tone === 'success' ? (
                <CheckCircle2 className="h-5 w-5 text-success" />
              ) : (
                <BellRing className="h-5 w-5 text-primary" />
              )}
            </div>
            <div>
              <p className="font-semibold text-text-primary">{notification.title}</p>
              <p className="text-sm text-text-secondary mt-1">{notification.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
