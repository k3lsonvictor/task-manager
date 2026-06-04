'use client';

import { useMutation } from '@tanstack/react-query';
import {
  ApiError,
  type CreateUserDto,
  type LoginDto,
  type LoginResponse,
  type ResendVerificationEmailDto,
  type VerifyEmailDto,
} from '@/lib/api/api';
import { getErrorMessage, getErrorStatus } from '@/lib/api/api-errors';

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
    throw new ApiError(
      getErrorMessage(data, 'Não foi possível fazer login'),
      getErrorStatus(data, response.status)
    );
  }

  return data;
}

async function createUser(dto: CreateUserDto): Promise<unknown> {
  const response = await fetch('/api/users', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Não foi possível criar sua conta'), response.status);
  }

  return data;
}

async function verifyEmail(dto: VerifyEmailDto): Promise<unknown> {
  const response = await fetch('/api/users/verify-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(getErrorMessage(data, 'Não foi possível verificar seu email'), response.status);
  }

  return data;
}

async function resendVerificationEmail(
  dto: ResendVerificationEmailDto
): Promise<unknown> {
  const response = await fetch('/api/users/resend-verification-email', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dto),
  });
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(data, 'Não foi possível reenviar o email de verificação'),
      response.status
    );
  }

  return data;
}

export function useLogin() {
  return useMutation<LoginResponse, Error, LoginDto>({
    mutationFn: login,
  });
}

export function useCreateUser() {
  return useMutation<unknown, Error, CreateUserDto>({
    mutationFn: createUser,
  });
}

export function useVerifyEmail() {
  return useMutation<unknown, Error, VerifyEmailDto>({
    mutationFn: verifyEmail,
  });
}

export function useResendVerificationEmail() {
  return useMutation<unknown, Error, ResendVerificationEmailDto>({
    mutationFn: resendVerificationEmail,
  });
}
