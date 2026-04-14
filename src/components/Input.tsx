import { useState } from 'react';

interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  autoFocus?: boolean;
}

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-10-8-10-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  autoFocus,
}: InputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const resolvedType = isPassword ? (showPassword ? 'text' : 'password') : type;
  const inputId = label ? `input-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="font-body text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-on-surface/65">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          type={resolvedType}
          placeholder={placeholder}
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full bg-surface-container-low rounded-xl px-4 py-3 font-body text-sm text-on-surface
            outline-none ring-2 ring-transparent focus:ring-primary/30 focus:bg-white
            transition-all duration-200 placeholder:text-on-surface/55 ${
              isPassword ? 'pr-10' : ''
            } ${
              error ? 'ring-red-400/40 bg-red-50/40' : ''
            }`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface/40 hover:text-on-surface/70 transition-colors duration-150"
          >
            <EyeIcon open={showPassword} />
          </button>
        )}
      </div>
      {error && (
        <span className="font-body text-xs text-red-600 font-medium">{error}</span>
      )}
    </div>
  );
}
