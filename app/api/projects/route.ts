import { ApiError, createProject, fetchProjects } from '@/lib/api/api';
import { jsonWithOptionalAuthCookies, runWithAuthRefresh } from '@/lib/auth/api-route-auth';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => fetchProjects(authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao carregar projetos';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, refreshedTokens } = await runWithAuthRefresh(
      request,
      (authHeader) => createProject(body, authHeader)
    );

    return jsonWithOptionalAuthCookies(data, refreshedTokens);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Falha ao criar projeto';

    return NextResponse.json(
      { error: message },
      { status }
    );
  }
}
