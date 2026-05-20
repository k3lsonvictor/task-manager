import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  fullWidth?: boolean;
  variant?: 'primary' | 'ghost';
};

export function Button({
  children,
  fullWidth = true,
  variant = 'primary',
  className = '',
  type = 'button',
  ...props
}: Props) {
  const base =
    variant === 'primary'
      ? 'rounded-xl border-none bg-btn px-2.5 py-2.5 text-base text-white transition-colors duration-300 hover:bg-btn-hover cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'
      : 'rounded-xl border-none bg-transparent text-white/80 transition-colors hover:text-white cursor-pointer';

  return (
    <button
      type={type}
      className={`${base} ${fullWidth ? 'w-full' : 'w-auto'} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
