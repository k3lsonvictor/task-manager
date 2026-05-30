import { ApiError } from '@/lib/api/api';
import { createStep } from '@/lib/api/steps-api';
import { jsonWithOptionalAuthCookies, runWithAuthRefresh } from '@/lib/auth/api-route-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { projectId, ...stepDto } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: 'Projeto não informado' },
        { status: 400 }
      );
    }

    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => createStep(projectId, stepDto, authHeader)
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
