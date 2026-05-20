'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
    <form onSubmit={onSubmit} className="card" style={{ maxWidth: 420, margin: '3rem auto', display: 'grid', gap: 12 }}>
      <h1>{mode === 'login' ? 'Login' : 'Criar conta'}</h1>
      {mode === 'signin' && <input name="name" placeholder="Nome" required minLength={3} />}
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Senha" required minLength={6} />
      <button type="submit" disabled={loading}>{loading ? 'Enviando...' : mode === 'login' ? 'Entrar' : 'Cadastrar'}</button>
      <button type="button" onClick={() => router.push(mode === 'login' ? '/signin' : '/login')}>
        {mode === 'login' ? 'Criar conta' : 'Já tenho conta'}
      </button>
    </form>
  );
}
