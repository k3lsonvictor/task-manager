'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
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
      <div className="flex w-full max-w-md flex-col gap-2 px-6 text-white">
        <div className="mb-6 flex w-full flex-col items-center gap-6 text-center">
          <h1 className="text-2xl font-semibold tracking-wide">TASK MANAGER</h1>
          <div className="flex flex-col gap-2">
            <p className="text-white/90">Digite o código enviado para seu email.</p>
            <p className="text-sm text-white/70">
              Depois da verificação, volte ao login para acessar sua conta.
            </p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
          <InputField
            label="Email"
            name="email"
            type="email"
            ref={emailInputRef}
            defaultValue={initialEmail}
            placeholder="Digite seu e-mail"
            required
          />
          <InputField
            label="Código de verificação"
            name="verificationCode"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="Digite o código recebido"
            required
            minLength={4}
            maxLength={8}
          />
          <div className="mt-2.5">
            <Button type="submit" disabled={submitting}>
              {verifyEmailMutation.isPending ? 'Verificando...' : 'Verificar código'}
            </Button>
          </div>
          {message ? <p className="text-center text-sm text-white/70">{message}</p> : null}
          {verifyEmailMutation.error ? (
            <p className="text-center text-sm text-red-300">{verifyEmailMutation.error.message}</p>
          ) : null}
          {resendVerificationEmailMutation.error ? (
            <p className="text-center text-sm text-red-300">
              {resendVerificationEmailMutation.error.message}
            </p>
          ) : null}
        </form>

        <div className="mt-2 flex flex-col items-center gap-2">
          <button
            type="button"
            className="cursor-pointer border-none bg-transparent text-center text-sm text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
            disabled={submitting}
            onClick={resendCode}
          >
            {resendVerificationEmailMutation.isPending ? 'Reenviando...' : 'Reenviar código'}
          </button>
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
