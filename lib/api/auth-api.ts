import { fetchWithTimeout } from '@/lib/api/api-client';
import { ApiError, getErrorMessage } from '@/lib/api/api-errors';
import type { LoginDto, LoginResponse } from '@/lib/api/api-types';
import {
  BACKEND_AUTH_COOKIE_NAME,
  BACKEND_REFRESH_COOKIE_NAME,
  getRefreshTokenFromLoginResponse,
  getTokenFromLoginResponse,
} from '@/lib/auth/session';

export type AuthTokens = {
  accessToken?: string;
  refreshToken?: string;
};

function getSetCookieHeaders(response: Response): string[] {
  const headers = response.headers as Headers & { getSetCookie?: () => string[] };
  const setCookieHeaders = headers.getSetCookie?.();

  if (setCookieHeaders) return setCookieHeaders;

  const setCookieHeader = response.headers.get('set-cookie');

  if (!setCookieHeader) return [];

  return setCookieHeader.split(/,(?=\s*[^;,]+=)/).map((cookie) => cookie.trim());
}

function getCookieValueFromSetCookieHeaders(headers: string[], cookieName: string): string | undefined {
  const cookie = headers.find((header) => header.startsWith(`${cookieName}=`));
  const value = cookie?.split(';')[0]?.split('=').slice(1).join('=');

  return value ? decodeURIComponent(value) : undefined;
}

export function getTokensFromAuthResponse(
  response: Response,
  data: LoginResponse | null
): AuthTokens {
  const setCookieHeaders = getSetCookieHeaders(response);

  return {
    accessToken:
      getTokenFromLoginResponse(data) ??
      getCookieValueFromSetCookieHeaders(setCookieHeaders, BACKEND_AUTH_COOKIE_NAME),
    refreshToken:
      getRefreshTokenFromLoginResponse(data) ??
      getCookieValueFromSetCookieHeaders(setCookieHeaders, BACKEND_REFRESH_COOKIE_NAME),
  };
}

export async function login(dto: LoginDto): Promise<LoginResponse> {
  const response = await fetchWithTimeout('auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Não foi possível fazer login'), response.status);
  }

  return data;
}

export async function loginWithTokens(dto: LoginDto): Promise<{
  data: LoginResponse;
  tokens: AuthTokens;
}> {
  const response = await fetchWithTimeout('auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Não foi possível fazer login'), response.status);
  }

  return {
    data,
    tokens: getTokensFromAuthResponse(response, data),
  };
}

export async function refreshSession(refreshToken: string): Promise<AuthTokens> {
  const response = await fetchWithTimeout('auth/refresh', {
    method: 'POST',
    headers: {
      Cookie: `${BACKEND_REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
    },
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Não foi possível renovar a sessão'), response.status);
  }

  return getTokensFromAuthResponse(response, data);
}

export async function logout(refreshToken?: string | null): Promise<void> {
  await fetchWithTimeout('auth/logout', {
    method: 'POST',
    headers: refreshToken
      ? {
          Cookie: `${BACKEND_REFRESH_COOKIE_NAME}=${encodeURIComponent(refreshToken)}`,
        }
      : undefined,
  }).catch(() => null);
}
