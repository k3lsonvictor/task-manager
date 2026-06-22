'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useResendVerificationEmail, useVerifyEmail } from '@/lib/hooks/use-auth';

export function VerifyEmailCode() {
  const searchParams = useSearchParams();
  const initialEmail = searchParams.get('email') ?? '';
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationEmailMutation = useResendVerificationEmail();
  const submitting = verifyEmailMutation.isPending || resendVerificationEmailMutation.isPending;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const code = String(formData.get('verificationCode') ?? '').trim();

    if (!email || !code) {
      setMessage('Informe o email e o código de verificação.');
      return;
    }

    setMessage(null);
    verifyEmailMutation.mutate(
      { email, code },
      {
        onSuccess() {
          setMessage('Email verificado com sucesso. Agora você já pode fazer login.');
        },
      }
    );
  }

  function resendCode() {
    const email = emailInputRef.current?.value.trim() ?? initialEmail;

    if (!email) {
      setMessage('Informe seu email para reenviar o código de verificação.');
      return;
    }

    setMessage(null);
    resendVerificationEmailMutation.mutate(
      { email },
      {
        onSuccess() {
          setMessage(`Reenviamos o código de verificação para ${email}.`);
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
            <p className="text-foreground/90">Digite o código enviado para seu email.</p>
            <p className="text-sm text-foreground/70">
              Depois da verificação, volte ao login para acessar sua conta.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground/80">Email</span>
            <Input
              name="email"
              type="email"
              ref={emailInputRef}
              defaultValue={initialEmail}
              placeholder="Digite seu e-mail"
              required
              className="h-11 rounded-lg border border-foreground/10 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-accent"
            />
          </label>
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-foreground/80">Código de verificação</span>
            <Input
              name="verificationCode"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="Digite o código recebido"
              required
              minLength={4}
              maxLength={8}
              className="h-11 rounded-lg border border-foreground/10 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-accent"
            />
          </label>
          <div className="mt-2.5">
            <Button type="submit" disabled={submitting}>
              {verifyEmailMutation.isPending ? 'Verificando...' : 'Verificar código'}
            </Button>
          </div>
          {message ? <p className="text-center text-sm text-foreground/70">{message}</p> : null}
          {verifyEmailMutation.error ? (
            <p className="text-center text-sm text-destructive">{verifyEmailMutation.error.message}</p>
          ) : null}
          {resendVerificationEmailMutation.error ? (
            <p className="text-center text-sm text-destructive">
              {resendVerificationEmailMutation.error.message}
            </p>
          ) : null}
        </form>

        <div className="mt-2 flex flex-col items-center gap-2">
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-60"
            disabled={submitting}
            onClick={resendCode}
          >
            {resendVerificationEmailMutation.isPending ? 'Reenviando...' : 'Reenviar código'}
          </Button>
          <Button asChild variant="link" className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
            <Link href="/login">Voltar para login</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
