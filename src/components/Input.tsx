interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
  autoFocus?: boolean;
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
  const inputId = label ? `input-${label.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}` : undefined;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="font-body text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-on-surface/65">
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        placeholder={placeholder}
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        className={`bg-surface-container-low rounded-xl px-4 py-3 font-body text-sm text-on-surface
          outline-none ring-2 ring-transparent focus:ring-primary/30 focus:bg-white
          transition-all duration-200 placeholder:text-on-surface/55 ${
            error ? 'ring-red-400/40 bg-red-50/40' : ''
          }`}
      />
      {error && (
        <span className="font-body text-xs text-red-600 font-medium">{error}</span>
      )}
    </div>
  );
}
