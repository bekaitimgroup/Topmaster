import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow Next.js internals and the access gate itself
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname === '/access' ||
    pathname.startsWith('/access/')
  ) {
    return NextResponse.next();
  }

  // Site passphrase gate (when SITE_PASSPHRASE is set)
  const passphrase = process.env.SITE_PASSPHRASE;
  if (passphrase) {
    const siteAccess = request.cookies.get('site_access');
    if (!siteAccess || siteAccess.value !== passphrase) {
      return NextResponse.redirect(new URL('/access', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
