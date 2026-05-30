import { ApiError, updateTask } from '@/lib/api/api';
import { jsonWithOptionalAuthCookies, runWithAuthRefresh } from '@/lib/auth/api-route-auth';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ projectId: string; taskId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { projectId, taskId } = await params;

  try {
    const body = await request.json();
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => updateTask(projectId, taskId, body, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao atualizar tarefa';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
