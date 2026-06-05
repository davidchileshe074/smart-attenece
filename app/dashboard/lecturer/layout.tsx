import type { ReactNode } from 'react';
import { requireRole } from '@/lib/dashboard-auth';

export default async function LecturerDashboardLayout({ children }: { children: ReactNode }) {
  await requireRole('lecturer');
  return children;
}
