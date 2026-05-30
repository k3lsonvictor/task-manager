import { ApiError, createTask, fetchTasks } from '@/lib/api/api';
import { jsonWithOptionalAuthCookies, runWithAuthRefresh } from '@/lib/auth/api-route-auth';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ projectId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { projectId } = await params;

  try {
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => fetchTasks(projectId, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao carregar tarefas';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

export async function POST(request: Request, { params }: Params) {
  const { projectId } = await params;

  try {
    const body = await request.json();
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => createTask(projectId, body, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao criar tarefa';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
