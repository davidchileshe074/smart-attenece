import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import User from '@/models/user.model';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { verifyToken } from '@/lib/auth';
import { cookies } from 'next/headers';

const ALLOWED_ROLES = new Set(['student', 'lecturer', 'admin']);

async function generateUniqueStudentId() {
  for (let attempts = 0; attempts < 5; attempts += 1) {
    const candidate = `STU-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;
    const existing = await User.findOne({ studentId: candidate }).select('_id');
    if (!existing) {
      return candidate;
    }
  }

  throw new Error('Failed to generate a unique student ID');
}

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'admin') {
      return NextResponse.json({ success: false, error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await connectDB();
    const body = await req.json();
    const name = String(body.name || '').trim();
    const email = String(body.email || '').trim().toLowerCase();
    const password = String(body.password || '');
    const role = String(body.role || 'student').toLowerCase();

    if (!name || !email || !password) {
      return NextResponse.json({ success: false, error: 'Please fill in all required fields.' }, { status: 400 });
    }

    if (!ALLOWED_ROLES.has(role)) {
      return NextResponse.json(
        { success: false, error: 'Invalid registration role. Choose student, lecturer, or admin.' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, error: 'Password must be at least 8 characters long.' },
        { status: 400 }
      );
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return NextResponse.json({ success: false, error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const studentId = role === 'student' ? await generateUniqueStudentId() : undefined;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      ...(studentId ? { studentId } : {}),
    });

    return NextResponse.json(
      {
        success: true,
        message: 'User created successfully',
        user: {
          name: user.name,
          role: user.role,
          email: user.email,
          studentId: user.studentId || null,
        }
      },
      { status: 201 }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
