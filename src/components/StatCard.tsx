import type { StatCardData } from '../types/index.ts';

export default function StatCard({ label, value, subtitle, trend, variant = 'default' }: StatCardData) {
  const isPrimary = variant === 'primary';
  const isEmpty   = value === '0' || value === '—';

  return (
    <div
      className={`relative rounded-2xl px-6 py-5 overflow-hidden transition-all duration-200 ${
        isPrimary
          ? 'bg-primary text-white'
          : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
      }`}
    >
      {/* Subtle decorative circle */}
      {isPrimary && (
        <div className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-white/6 pointer-events-none" />
      )}

      <p className={`font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase mb-3 ${
        isPrimary ? 'text-white/55' : 'text-on-surface/40'
      }`}>
        {label}
      </p>

      <div className="flex items-end gap-2">
        <span
          className={`font-display font-bold leading-none tabular-nums transition-opacity ${
            isEmpty ? 'opacity-25 text-4xl' : 'text-[2.75rem]'
          }`}
        >
          {value}
        </span>

        {subtitle && !isEmpty && (
          <span className={`font-body text-sm mb-0.5 ${
            isPrimary ? 'text-white/60' : 'text-on-surface/40'
          }`}>
            {subtitle}
          </span>
        )}

        {trend && !isEmpty && (
          <span className={`mb-1 ${isPrimary ? 'text-white/50' : 'text-primary'}`}>
            <svg
              width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              className={trend === 'down' ? 'rotate-180' : ''}
              aria-hidden="true"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          </span>
        )}
      </div>

      {isEmpty && (
        <p className={`font-body text-xs mt-1 ${isPrimary ? 'text-white/30' : 'text-on-surface/30'}`}>
          No data yet
        </p>
      )}
    </div>
  );
}
