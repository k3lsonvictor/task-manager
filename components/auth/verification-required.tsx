'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { useResendVerificationEmail } from '@/lib/hooks/use-auth';

export function VerificationRequired() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') ?? '';
  const [message, setMessage] = useState<string | null>(null);
  const resendVerificationEmailMutation = useResendVerificationEmail();

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();

    if (!email) {
      setMessage('Informe seu email para reenviar o código de verificação.');
      return;
    }

    setMessage(null);
    resendVerificationEmailMutation.mutate(
      { email },
      {
        onSuccess() {
          router.push(`/verify-email/code?email=${encodeURIComponent(email)}`);
        },
      }
    );
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-auth-bg">
      <div className="flex w-full max-w-md flex-col gap-2 px-6 text-white">
        <div className="mb-6 flex w-full flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-semibold tracking-wide">TASK MANAGER</h1>
          <div className="flex flex-col gap-2">
            <p className="text-white/90">Seu email ainda não foi verificado.</p>
            <p className="text-sm text-white/70">
              Reenvie o código de verificação para liberar o acesso à sua conta.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
          <InputField
            label="Email"
            name="email"
            type="email"
            defaultValue={initialEmail}
            placeholder="Digite seu e-mail"
            required
          />
          <div className="mt-2.5">
            <Button type="submit" disabled={resendVerificationEmailMutation.isPending}>
              {resendVerificationEmailMutation.isPending ? 'Reenviando...' : 'Reenviar código'}
            </Button>
          </div>
          {message ? <p className="text-center text-sm text-white/70">{message}</p> : null}
          {resendVerificationEmailMutation.error ? (
            <p className="text-center text-sm text-red-300">
              {resendVerificationEmailMutation.error.message}
            </p>
          ) : null}
        </form>

        <div className="mt-2 flex flex-col items-center gap-2">
          <Link
            href={`/verify-email/code${initialEmail ? `?email=${encodeURIComponent(initialEmail)}` : ''}`}
            className="cursor-pointer border-none bg-transparent text-center text-sm text-white/70 hover:text-white"
          >
            Verificar código
          </Link>
          <Link
            href="/login"
            className="cursor-pointer border-none bg-transparent text-center text-sm text-white/70 hover:text-white"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
