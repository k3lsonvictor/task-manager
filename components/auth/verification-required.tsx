'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <div className="flex w-full max-w-md flex-col gap-2 px-6 text-foreground">
        <div className="mb-6 flex w-full flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-semibold tracking-wide">TASK MANAGER</h1>
          <div className="flex flex-col gap-2">
            <p className="text-foreground/90">Seu email ainda não foi verificado.</p>
            <p className="text-sm text-foreground/70">
              Reenvie o código de verificação para liberar o acesso à sua conta.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground/80">Email</span>
            <Input
              name="email"
              type="email"
              defaultValue={initialEmail}
              placeholder="Digite seu e-mail"
              required
              className="h-11 rounded-lg border border-foreground/10 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-accent"
            />
          </label>
          <div className="mt-2.5">
            <Button type="submit" disabled={resendVerificationEmailMutation.isPending}>
              {resendVerificationEmailMutation.isPending ? 'Reenviando...' : 'Reenviar código'}
            </Button>
          </div>
          {message ? <p className="text-center text-sm text-foreground/70">{message}</p> : null}
          {resendVerificationEmailMutation.error ? (
            <p className="text-center text-sm text-destructive">
              {resendVerificationEmailMutation.error.message}
            </p>
          ) : null}
        </form>

        <div className="mt-2 flex flex-col items-center gap-2">
          <Link
            href={`/verify-email/code${initialEmail ? `?email=${encodeURIComponent(initialEmail)}` : ''}`}
            className="cursor-pointer border-none bg-transparent text-center text-sm text-foreground/70 hover:text-foreground"
          >
            Verificar código
          </Link>
          <Link
            href="/login"
            className="cursor-pointer border-none bg-transparent text-center text-sm text-foreground/70 hover:text-foreground"
          >
            Voltar para login
          </Link>
        </div>
      </div>
    </main>
  );
}
