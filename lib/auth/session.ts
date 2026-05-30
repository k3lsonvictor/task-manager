import type { LoginResponse } from '@/lib/api/api-types';

export const SESSION_COOKIE_NAME = 'task_manager_session';
export const REFRESH_SESSION_COOKIE_NAME = 'task_manager_refresh';
export const BACKEND_AUTH_COOKIE_NAME = 'access_token';
export const BACKEND_REFRESH_COOKIE_NAME = 'refresh_token';

export const SESSION_COOKIE_MAX_AGE = 60 * 15;
export const REFRESH_SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function getTokenFromLoginResponse(data: LoginResponse | null): string | undefined {
  return data?.access_token ?? data?.accessToken ?? data?.token;
}

export function getRefreshTokenFromLoginResponse(data: LoginResponse | null): string | undefined {
  return data?.refresh_token ?? data?.refreshToken;
}

export function withoutToken(
  data: LoginResponse | null
): Omit<LoginResponse, 'access_token' | 'accessToken' | 'token' | 'refresh_token' | 'refreshToken'> {
  if (!data) return {};

  const { access_token, accessToken, refresh_token, refreshToken, token, ...safeData } = data;
  void access_token;
  void accessToken;
  void refresh_token;
  void refreshToken;
  void token;

  return safeData;
}

export function getCookieValueFromCookieHeader(
  cookieHeader: string | null,
  cookieName: string
): string | null {
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';');

  for (const cookie of cookies) {
    const [name, ...valueParts] = cookie.trim().split('=');

    if (name === cookieName) {
      return decodeURIComponent(valueParts.join('='));
    }
  }

  return null;
}

export function getSessionTokenFromCookieHeader(cookieHeader: string | null): string | null {
  return getCookieValueFromCookieHeader(cookieHeader, SESSION_COOKIE_NAME);
}

export function getRefreshTokenFromCookieHeader(cookieHeader: string | null): string | null {
  return getCookieValueFromCookieHeader(cookieHeader, REFRESH_SESSION_COOKIE_NAME);
}

export function getAuthHeaderFromRequest(request: Request): string | null {
  const token = getSessionTokenFromCookieHeader(request.headers.get('cookie'));

  return token ? `Bearer ${token}` : null;
}
