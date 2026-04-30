import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_dev_only'
);

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const role = payload.role as string;

    // Redirect based on role
    if (role === 'student') {
      redirect('/dashboard/student');
    } else if (role === 'lecturer') {
      redirect('/dashboard/lecturer');
    } else if (role === 'admin') {
      redirect('/dashboard/admin');
    } else {
      redirect('/login');
    }
  } catch (error) {
    redirect('/login');
  }
}
