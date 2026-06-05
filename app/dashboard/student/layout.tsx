import type { ReactNode } from 'react';
import { requireRole } from '@/lib/dashboard-auth';

export default async function StudentDashboardLayout({ children }: { children: ReactNode }) {
  await requireRole('student');
  return children;
}
