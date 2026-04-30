import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';
import { jwtVerify } from 'jose'; // Using jose for Edge-compatible JWT verification

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback_secret_for_dev_only'
);

export async function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value;
  const { pathname } = req.nextUrl;

  // 1. Protect Dashboard Routes
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url));
    }

    try {
      // Verify token
      const { payload } = await jwtVerify(token, JWT_SECRET);
      const role = payload.role as string;

      // 2. Role-based Access Control (RBAC)
      if (pathname.startsWith('/dashboard/student') && role !== 'student') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (pathname.startsWith('/dashboard/lecturer') && role !== 'lecturer') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
      if (pathname.startsWith('/dashboard/admin') && role !== 'admin') {
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }

      return NextResponse.next();
    } catch (error) {
      // Token invalid or expired
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // 3. Redirect logged-in users away from Auth pages
  if ((pathname === '/login' || pathname === '/register') && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
