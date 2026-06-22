'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
      <div className="flex w-full max-w-md flex-col gap-2 px-6 text-foreground">
        <div className="mb-6 flex w-full flex-col items-center gap-6">
          <h1 className="text-2xl font-semibold tracking-wide">TASK MANAGER</h1>
          <p className="text-foreground/80">
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
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground/80">Email</span>
                <Input
                name="email"
                type="email"
                value={pendingAccount?.email ?? ''}
                readOnly
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
            </>
          ) : (
            <>
              {mode === 'signin' ? (
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-foreground/80">Nome</span>
                  <Input
                  name="name"
                  placeholder="Digite seu nome"
                  required
                  minLength={3}
                    className="h-11 rounded-lg border border-foreground/10 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-accent"
                  />
                </label>
              ) : null}
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground/80">Email</span>
                <Input
                name="email"
                type="email"
                placeholder="Digite seu e-mail"
                required
                className="h-11 rounded-lg border border-foreground/10 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-accent"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground/80">Senha</span>
                <Input
                name="password"
                type="password"
                placeholder="Digite sua senha"
                required
                minLength={6}
                className="h-11 rounded-lg border border-foreground/10 bg-foreground/5 px-3 text-sm text-foreground placeholder:text-foreground/35 focus:border-accent"
                />
              </label>
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
            <p className="text-center text-sm text-foreground/70">{signinMessage}</p>
          ) : null}
          {authError ? (
            <p className="text-center text-sm text-destructive">{authError.message}</p>
          ) : null}
        </form>

        {isSigninVerification ? (
          <div className="mt-2 flex flex-col items-center gap-2">
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
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
            </Button>
            <Button
              type="button"
              variant="link"
              className="h-auto p-0 text-sm text-muted-foreground hover:text-foreground"
              onClick={() => {
                setSigninStep('account');
                setSigninMessage(null);
              }}
            >
              Alterar email
            </Button>
          </div>
        ) : (
          <Button asChild variant="link" className="mt-2 h-auto p-0 text-sm text-muted-foreground hover:text-foreground">
            <Link href={mode === 'login' ? '/signin' : '/login'}>
              {mode === 'login' ? 'Crie uma conta aqui' : 'Já tenho conta'}
            </Link>
          </Button>
        )}
      </div>
    </main>
  );
}
