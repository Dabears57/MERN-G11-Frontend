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
    'rounded-lg font-body font-medium transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';

  const sizes = {
    md: 'px-6 py-3 text-base',
    sm: 'px-4 py-2 text-sm',
  };

  const variants = {
    primary:
      'bg-gradient-to-br from-primary to-primary-container text-on-primary hover:brightness-110',
    secondary:
      'bg-secondary-container text-on-secondary-container hover:bg-surface-container-highest',
    ghost:
      'bg-transparent text-primary hover:bg-surface-container-low',
    danger:
      'bg-red-600/10 text-red-600 hover:bg-red-600/20',
  };

  const width = fullWidth ? 'w-full' : '';

  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${width} ${className}`} {...props}>
      {children}
    </button>
  );
}
