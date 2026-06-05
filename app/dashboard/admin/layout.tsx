import type { ReactNode } from 'react';
import { requireRole } from '@/lib/dashboard-auth';

export default async function AdminDashboardLayout({ children }: { children: ReactNode }) {
  await requireRole('admin');
  return children;
}
