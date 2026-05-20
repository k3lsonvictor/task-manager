'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { InputField } from '@/components/ui/input-field';

type Props = { mode: 'login' | 'signin' };

export function AuthForm({ mode }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      router.push('/tasks');
    }, 500);
  }

  return (
    <main className="flex min-h-dvh w-full items-center justify-center bg-auth-bg">
      <div className="flex w-full max-w-md flex-col gap-2 px-6 text-white">
        <div className="mb-6 flex w-full flex-col items-center gap-6">
          <h1 className="text-2xl font-semibold tracking-wide">TASK MANAGER</h1>
          <p className="text-white/80">
            {mode === 'login' ? 'Faça login aqui.' : 'Crie sua conta aqui.'}
          </p>
        </div>

        <form onSubmit={onSubmit} className="flex w-full flex-col gap-2">
          {mode === 'signin' && (
            <InputField label="Nome" name="name" placeholder="Digite seu nome" required minLength={3} />
          )}
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
          <div className="mt-2.5">
            <Button type="submit" disabled={loading}>
              {loading ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}
            </Button>
          </div>
        </form>

        <Link
          href={mode === 'login' ? '/signin' : '/login'}
          className="mt-2 cursor-pointer border-none bg-transparent text-center text-sm text-white/70 hover:text-white"
        >
          {mode === 'login' ? 'Crie uma conta aqui' : 'Já tenho conta'}
        </Link>
      </div>
    </main>
  );
}
