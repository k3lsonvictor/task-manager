'use client';

import { useMutation } from '@tanstack/react-query';
import { ApiError, type LoginDto, type LoginResponse } from '@/lib/api/api';
import { getErrorMessage } from '@/lib/api/api-errors';

async function login(dto: LoginDto): Promise<LoginResponse> {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Não foi possível fazer login'), response.status);
  }

  return data;
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginDto>({
    mutationFn: login,
  });
}
