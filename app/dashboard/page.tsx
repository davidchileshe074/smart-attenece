import { redirect } from 'next/navigation';
import { getAuthenticatedUser } from '@/lib/dashboard-auth';

export default async function DashboardPage() {
  let role: 'student' | 'lecturer' | 'admin';

  try {
    ({ role } = await getAuthenticatedUser());
  } catch {
    redirect('/login');
  }

  if (role === 'student') {
    redirect('/dashboard/student');
  }

  if (role === 'lecturer') {
    redirect('/dashboard/lecturer');
  }

  if (role === 'admin') {
    redirect('/dashboard/admin');
  }

  redirect('/login');
}
