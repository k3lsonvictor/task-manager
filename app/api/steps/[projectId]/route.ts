import { ApiError } from '@/lib/api/api';
import { createStep, fetchSteps } from '@/lib/api/steps-api';
import { jsonWithOptionalAuthCookies, runWithAuthRefresh } from '@/lib/auth/api-route-auth';
import { NextResponse } from 'next/server';

type Params = { params: Promise<{ projectId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { projectId } = await params;

  try {
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => fetchSteps(projectId, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao carregar etapas';

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
      (authHeader) => createStep(projectId, body, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao criar etapa';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
