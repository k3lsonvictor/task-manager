export const API_BASE_URL = process.env.API_BASE_URL ?? process.env.NEXT_PUBLIC_API_URL;

const DEFAULT_TIMEOUT_MS = 8_000;

export async function fetchWithTimeout(
  path: string,
  init?: RequestInit,
  timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(`${API_BASE_URL?.replace(/\/$/, '')}/${path}`, {
      ...init,
      cache: 'no-store',
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export function getAuthHeaders(authHeader?: string | null): HeadersInit | undefined {
  if (!authHeader) return undefined;

  return {
    Authorization: authHeader,
  };
}
