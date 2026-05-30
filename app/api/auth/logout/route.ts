import { logout } from '@/lib/api/auth-api';
import { clearAuthCookies } from '@/lib/auth/api-route-auth';
import { getRefreshTokenFromCookieHeader } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const refreshToken = getRefreshTokenFromCookieHeader(request.headers.get('cookie'));

  await logout(refreshToken);

  const response = NextResponse.json({ ok: true });

  clearAuthCookies(response);

  return response;
}
