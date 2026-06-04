import { loginWithTokens } from '@/lib/api/auth-api';
import { ApiError, getErrorMessage } from '@/lib/api/api-errors';
import { applyAuthCookies } from '@/lib/auth/api-route-auth';
import { withoutToken } from '@/lib/auth/session';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { data, tokens } = await loginWithTokens(body);

    if (!tokens.accessToken) {
      return NextResponse.json(
        { error: 'Backend não retornou um token de sessão' },
        { status: 502 }
      );
    }

    const response = NextResponse.json(withoutToken(data));

    applyAuthCookies(response, tokens);

    return response;
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Não foi possível fazer login';

    return NextResponse.json(
      { error: getErrorMessage(error, message), statusCode: status },
      { status }
    );
  }
}
