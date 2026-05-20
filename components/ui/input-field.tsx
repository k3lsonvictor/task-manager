import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
};

export function InputField({ label, className = '', id, ...props }: Props) {
  const inputId = id ?? label.toLowerCase().replace(/\s/g, '-');

  return (
    <label
      htmlFor={inputId}
      className={`flex w-full flex-col gap-1 rounded-xl border-2 border-transparent bg-surface px-2.5 py-2.5 transition-shadow focus-within:border-[#007bff] focus-within:shadow-[0_0_5px_rgba(0,123,255,0.5)] ${className}`}
    >
      <span className="text-xs font-semibold text-white">{label}</span>
      <input
        id={inputId}
        className="w-full border-none bg-transparent text-sm font-semibold text-white/70 outline-none placeholder:font-normal placeholder:text-white/50 autofill:shadow-[inset_0_0_0_1000px_#333645] autofill:[-webkit-text-fill-color:white]"
        {...props}
      />
    </label>
  );
}
