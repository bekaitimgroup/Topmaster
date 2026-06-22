import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Pages that don't require auth
const PUBLIC_PATHS = ['/auth'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths and Next.js internals
  if (
    PUBLIC_PATHS.some((p) => pathname.startsWith(p)) ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  // If no auth cookie, redirect to /auth
  const token = request.cookies.get('token');
  if (!token) {
    const loginUrl = new URL('/auth', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
