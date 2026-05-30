import { REFRESH_SESSION_COOKIE_NAME, SESSION_COOKIE_NAME } from '@/lib/auth/session';
import { NextRequest, NextResponse } from 'next/server';

const AUTH_PAGES = ['/login', '/signin'];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const hasSession = request.cookies.has(SESSION_COOKIE_NAME);
  const hasRefreshSession = request.cookies.has(REFRESH_SESSION_COOKIE_NAME);
  const hasAnySession = hasSession || hasRefreshSession;

  if (pathname.startsWith('/tasks') && !hasAnySession) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  if (AUTH_PAGES.includes(pathname) && hasAnySession) {
    return NextResponse.redirect(new URL('/tasks', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/tasks/:path*', '/login', '/signin'],
};
