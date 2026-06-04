import { verifyEmail } from '@/lib/api/auth-api';
import { ApiError, getErrorMessage } from '@/lib/api/api-errors';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = await verifyEmail(body);

    return NextResponse.json(data);
  } catch (error) {
    const status = error instanceof ApiError ? error.status : 502;
    const message = error instanceof Error ? error.message : 'Não foi possível verificar seu email';

    return NextResponse.json(
      { error: getErrorMessage(error, message) },
      { status }
    );
  }
}
