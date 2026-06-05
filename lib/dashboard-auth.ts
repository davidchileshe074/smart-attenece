import connectDB from '@/lib/db';
import User from '@/models/user.model';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_dev_only'
);

type AuthenticatedUser = {
  userId: string;
  role: 'student' | 'lecturer' | 'admin';
  email?: string;
};

async function readVerifiedUser(): Promise<AuthenticatedUser> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) {
    redirect('/login');
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const userId = payload.userId as string | undefined;
    const tokenRole = payload.role as string | undefined;

    if (!userId || !tokenRole) {
      redirect('/login');
    }

    await connectDB();
    const user = await User.findById(userId).select('_id role email');

    if (!user) {
      redirect('/login');
    }

    const role = user.role as AuthenticatedUser['role'];
    return {
      userId: user._id.toString(),
      role: role || (tokenRole as AuthenticatedUser['role']),
      email: user.email,
    };
  } catch {
    redirect('/login');
  }
}

export async function requireRole(expectedRole: 'student' | 'lecturer' | 'admin') {
  const user = await readVerifiedUser();

  if (user.role !== expectedRole) {
    redirect('/dashboard');
  }

  return user;
}

export async function getAuthenticatedUser() {
  return readVerifiedUser();
}
