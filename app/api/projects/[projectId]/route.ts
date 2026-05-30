import { ApiError, fetchProject, updateProject } from '@/lib/api/api';
import { jsonWithOptionalAuthCookies, runWithAuthRefresh } from '@/lib/auth/api-route-auth';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ projectId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { projectId } = await params;

  try {
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => fetchProject(projectId, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao carregar projeto';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

export async function PATCH(request: Request, { params }: Params) {
  const { projectId } = await params;

  try {
    const body = await request.json();
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => updateProject(projectId, body, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao atualizar projeto';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
