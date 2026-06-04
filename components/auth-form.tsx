'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';
import { ApiError } from '@/lib/api/api';
import {
  useCreateUser,
  useLogin,
  useResendVerificationEmail,
  useVerifyEmail,
} from '@/lib/hooks/use-auth';

type Props = { mode: 'login' | 'signin' };
type SigninStep = 'account' | 'verification';

type PendingAccount = {
  email: string;
  password: string;
};

function getSafeRedirectPath() {
  const redirectPath = new URLSearchParams(window.location.search).get('redirect');

  if (!redirectPath || !redirectPath.startsWith('/') || redirectPath.startsWith('//')) {
    return '/tasks';
  }

  return redirectPath;
}

function normalizeErrorMessage(message: string) {
  return message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function isUnverifiedEmailError(error: Error) {
  const message = normalizeErrorMessage(error.message);
  const status = error instanceof ApiError ? error.status : null;

  return (
    (message.includes('email') &&
      (message.includes('verific') ||
        message.includes('verify') ||
        message.includes('verified') ||
        message.includes('confirm'))) ||
    (status === 403 && (message.includes('email') || message.includes('verific')))
  );
}

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [signinStep, setSigninStep] = useState<SigninStep>('account');
  const [pendingAccount, setPendingAccount] = useState<PendingAccount | null>(null);
  const [signinMessage, setSigninMessage] = useState<string | null>(null);
  const loginMutation = useLogin();
  const createUserMutation = useCreateUser();
  const verifyEmailMutation = useVerifyEmail();
  const resendVerificationEmailMutation = useResendVerificationEmail();
  const submitting =
    loginMutation.isPending ||
    createUserMutation.isPending ||
    verifyEmailMutation.isPending;
  const isSigninVerification = mode === 'signin' && signinStep === 'verification';
  const authError =
    loginMutation.error ??
    createUserMutation.error ??
    verifyEmailMutation.error ??
    resendVerificationEmailMutation.error;

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mode === 'signin') {
      const formData = new FormData(event.currentTarget);

      if (signinStep === 'verification') {
        const verificationCode = String(formData.get('verificationCode') ?? '').trim();

        if (!verificationCode) {
          setSigninMessage('Informe o código de verificação enviado para o seu email.');
          return;
        }

        if (!pendingAccount) {
          setSigninMessage('Informe seu email antes de verificar o código.');
          setSigninStep('account');
          return;
        }

        setSigninMessage(null);
        verifyEmailMutation.mutate(
          {
            email: pendingAccount.email,
            code: verificationCode,
          },
          {
            onSuccess() {
              loginMutation.mutate(
                {
                  email: pendingAccount.email,
                  password: pendingAccount.password,
                },
                {
                  onSuccess() {
                    router.push('/tasks');
                  },
                }
              );
            },
          }
        );

        return;
      }

      const account = {
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        password: String(formData.get('password') ?? ''),
      };

      setSigninMessage(null);
      createUserMutation.mutate(account, {
        onSuccess() {
          setPendingAccount(account);
          setSigninStep('verification');
          setSigninMessage(`Enviamos um código de verificação para ${account.email}.`);
        },
      });

      return;
    }

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim();
    const password = String(formData.get('password') ?? '');

    loginMutation.mutate(
      { email, password },
      {
        onSuccess() {
          router.push(getSafeRedirectPath());
        },
        onError(error) {
          console.log(error)
          if (isUnverifiedEmailError(error)) {
            router.push(`/verify-email?email=${encodeURIComponent(email)}`);
          }
        },
      }
    );
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-auth-bg">
      <div className="flex w-full max-w-md flex-col gap-2 px-6 text-white">
        <div className="mb-6 flex w-full flex-col items-center gap-6">
          <h1 className="text-2xl font-semibold tracking-wide">TASK MANAGER</h1>
          <p className="text-white/80">
            {mode === 'login'
              ? 'Faça login aqui.'
              : isSigninVerification
                ? 'Digite o código enviado para seu email.'
                : 'Crie sua conta aqui.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
          {isSigninVerification ? (
            <>
              <InputField
                label="Email"
                name="email"
                type="email"
                value={pendingAccount?.email ?? ''}
                readOnly
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
            </>
          ) : (
            <>
              {mode === 'signin' ? (
                <InputField
                  label="Nome"
                  name="name"
                  placeholder="Digite seu nome"
                  required
                  minLength={3}
                />
              ) : null}
              <InputField
                label="Email"
                name="email"
                type="email"
                placeholder="Digite seu e-mail"
                required
              />
              <InputField
                label="Senha"
                name="password"
                type="password"
                placeholder="Digite sua senha"
                required
                minLength={6}
              />
            </>
          )}
          <div className="mt-2.5">
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Enviando...'
                : mode === 'login'
                  ? 'Entrar'
                  : isSigninVerification
                    ? 'Verificar código'
                    : 'Cadastrar'}
            </Button>
          </div>
          {signinMessage ? (
            <p className="text-center text-sm text-white/70">{signinMessage}</p>
          ) : null}
          {authError ? (
            <p className="text-center text-sm text-red-300">{authError.message}</p>
          ) : null}
        </form>

        {isSigninVerification ? (
          <div className="mt-2 flex flex-col items-center gap-2">
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent text-center text-sm text-white/70 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!pendingAccount || resendVerificationEmailMutation.isPending}
              onClick={() => {
                if (!pendingAccount) return;

                setSigninMessage(null);
                resendVerificationEmailMutation.mutate(
                  { email: pendingAccount.email },
                  {
                    onSuccess() {
                      setSigninMessage(`Reenviamos o código para ${pendingAccount.email}.`);
                    },
                  }
                );
              }}
            >
              {resendVerificationEmailMutation.isPending ? 'Reenviando...' : 'Reenviar código'}
            </button>
            <button
              type="button"
              className="cursor-pointer border-none bg-transparent text-center text-sm text-white/70 hover:text-white"
              onClick={() => {
                setSigninStep('account');
                setSigninMessage(null);
              }}
            >
              Alterar email
            </button>
          </div>
        ) : (
          <Link
            href={mode === 'login' ? '/signin' : '/login'}
            className="mt-2 cursor-pointer border-none bg-transparent text-center text-sm text-white/70 hover:text-white"
          >
            {mode === 'login' ? 'Crie uma conta aqui' : 'Já tenho conta'}
          </Link>
        )}
      </div>
    </main>
  );
}
