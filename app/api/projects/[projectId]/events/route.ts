import { API_BASE_URL, getAuthHeaders } from '@/lib/api/api-client';
import { ApiError, getErrorMessage } from '@/lib/api/api-errors';
import { refreshSession, type AuthTokens } from '@/lib/api/auth-api';
import { applyAuthCookies } from '@/lib/auth/api-route-auth';
import {
  getAuthHeaderFromRequest,
  getRefreshTokenFromCookieHeader,
} from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type Params = { params: Promise<{ projectId: string }> };

async function openProjectEventsStream(projectId: string, authHeader: string | null) {
  const apiUrl = API_BASE_URL?.replace(/\/$/, '');

  if (!apiUrl) {
    throw new ApiError('URL da API não configurada', 500);
  }

  return fetch(`${apiUrl}/projects/${projectId}/events`, {
    headers: getAuthHeaders(authHeader),
    cache: 'no-store',
  });
}

async function openProjectEventsStreamWithRefresh(
  request: Request,
  projectId: string
): Promise<{ response: Response; refreshedTokens?: AuthTokens }> {
  const response = await openProjectEventsStream(projectId, getAuthHeaderFromRequest(request));

  if (response.status !== 401) {
    return { response };
  }

  response.body?.cancel().catch(() => null);

  const refreshToken = getRefreshTokenFromCookieHeader(request.headers.get('cookie'));

  if (!refreshToken) {
    return { response };
  }

  const refreshedTokens = await refreshSession(refreshToken);

  if (!refreshedTokens.accessToken) {
    return { response };
  }

  return {
    response: await openProjectEventsStream(projectId, `Bearer ${refreshedTokens.accessToken}`),
    refreshedTokens,
  };
}

export async function GET(request: Request, { params }: Params) {
  const { projectId } = await params;

  try {
    const { response, refreshedTokens } = await openProjectEventsStreamWithRefresh(request, projectId);

    if (!response.ok || !response.body) {
      const data = await response.json().catch(() => null);
      const message = getErrorMessage(data, 'Falha ao conectar ao stream do projeto');

      return NextResponse.json({ error: message }, { status: response.status || 502 });
    }

    const streamResponse = new NextResponse(response.body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') ?? 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        Connection: 'keep-alive',
      },
    });

    if (refreshedTokens) {
      applyAuthCookies(streamResponse, refreshedTokens);
    }

    return streamResponse;
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao conectar ao stream do projeto';

    return NextResponse.json({ error: message }, { status });
  }
}
