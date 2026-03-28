interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

export default function Input({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
}: InputProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="font-body text-xs font-medium tracking-wide uppercase text-on-surface/70">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-surface-container-lowest rounded-lg px-4 py-3 font-body text-base text-on-surface
          outline-none border-b-2 border-transparent focus:border-primary transition-colors duration-200
          placeholder:text-on-surface/40"
      />
      {error && (
        <span className="font-body text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
