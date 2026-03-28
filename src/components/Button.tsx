import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md';
  fullWidth?: boolean;
  children: ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl font-body font-medium ' +
    'transition-all duration-200 cursor-pointer ' +
    'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none';

  const sizes: Record<string, string> = {
    md: 'px-5 py-2.5 text-sm',
    sm: 'px-3.5 py-2 text-xs',
  };

  const variants: Record<string, string> = {
    primary:
      'bg-primary text-white hover:bg-primary-container active:scale-[0.98] shadow-[0_1px_3px_rgba(0,77,68,0.25)]',
    secondary:
      'bg-surface-container text-on-surface hover:bg-surface-container-highest active:scale-[0.98]',
    ghost:
      'bg-transparent text-primary hover:bg-primary/8 active:scale-[0.98]',
    danger:
      'bg-red-500/10 text-red-600 hover:bg-red-500/18 active:scale-[0.98]',
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
