import { ApiError, deleteStep, updateStep } from '@/lib/api/api';
import { jsonWithOptionalAuthCookies, runWithAuthRefresh } from '@/lib/auth/api-route-auth';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ projectId: string; stepId: string }> };

export async function PATCH(request: Request, { params }: Params) {
  const { projectId, stepId } = await params;

  try {
    const body = await request.json();
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => updateStep(projectId, stepId, body, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao atualizar etapa';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

export async function DELETE(request: Request, { params }: Params) {
  const { projectId, stepId } = await params;

  try {
    const { refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => deleteStep(projectId, stepId, authHeader)
    );

    return jsonWithOptionalAuthCookies({ ok: true }, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao excluir etapa';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
