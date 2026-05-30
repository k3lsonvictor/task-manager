import { ApiError } from '@/lib/api/api-errors';
import { refreshSession, type AuthTokens } from '@/lib/api/auth-api';
import {
  getAuthHeaderFromRequest,
  getRefreshTokenFromCookieHeader,
  REFRESH_SESSION_COOKIE_MAX_AGE,
  REFRESH_SESSION_COOKIE_NAME,
  SESSION_COOKIE_MAX_AGE,
  SESSION_COOKIE_NAME,
} from '@/lib/auth/session';
import { NextResponse } from 'next/server';

type AuthenticatedHandler<T> = (authHeader: string | null) => Promise<T>;

export function applyAuthCookies(response: NextResponse, tokens: AuthTokens) {
  if (tokens.accessToken) {
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: tokens.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_COOKIE_MAX_AGE,
    });
  }

  if (tokens.refreshToken) {
    response.cookies.set({
      name: REFRESH_SESSION_COOKIE_NAME,
      value: tokens.refreshToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: REFRESH_SESSION_COOKIE_MAX_AGE,
    });
  }
}

export function clearAuthCookies(response: NextResponse) {
  response.cookies.delete(SESSION_COOKIE_NAME);
  response.cookies.delete(REFRESH_SESSION_COOKIE_NAME);
}

export async function runWithAuthRefresh<T>(
  request: Request,
  handler: AuthenticatedHandler<T>
): Promise<{ data: T; refreshedTokens?: AuthTokens }> {
  try {
    return {
      data: await handler(getAuthHeaderFromRequest(request)),
    };
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) {
      throw error;
    }

    const refreshToken = getRefreshTokenFromCookieHeader(request.headers.get('cookie'));

    if (!refreshToken) {
      throw error;
    }

    const refreshedTokens = await refreshSession(refreshToken);

    if (!refreshedTokens.accessToken) {
      throw error;
    }

    return {
      data: await handler(`Bearer ${refreshedTokens.accessToken}`),
      refreshedTokens,
    };
  }
}

export function jsonWithOptionalAuthCookies<T>(
  data: T,
  refreshedTokens?: AuthTokens
): NextResponse {
  const response = NextResponse.json(data);

  if (refreshedTokens) {
    applyAuthCookies(response, refreshedTokens);
  }

  return response;
}
