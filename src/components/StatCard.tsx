import type { StatCardData } from '../types/index.ts';

export default function StatCard({ label, value, subtitle, trend, variant = 'default' }: StatCardData) {
  const isPrimary = variant === 'primary';

  return (
    <div
      className={`rounded-xl px-6 py-5 transition-all duration-200 ${
        isPrimary
          ? 'bg-gradient-to-br from-primary to-primary-container text-on-primary'
          : 'bg-surface-container-low text-on-surface'
      }`}
    >
      <p
        className={`font-body text-xs font-medium tracking-widest uppercase mb-4 ${
          isPrimary ? 'text-on-primary/70' : 'text-on-surface/40'
        }`}
      >
        {label}
      </p>
      <div className="flex items-end gap-2">
        <span className={`font-display font-bold leading-none ${
          value === '0' || value === '—'
            ? 'text-3xl opacity-40'
            : 'text-[2.5rem]'
        }`}>
          {value}
        </span>
        {subtitle && (
          <span className={`font-body text-sm mb-0.5 ${isPrimary ? 'text-on-primary/70' : 'text-on-surface/40'}`}>
            {subtitle}
          </span>
        )}
        {trend && value !== '0' && (
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`mb-1 ${trend === 'up' ? '' : 'rotate-180'} ${isPrimary ? 'text-on-primary/50' : 'text-primary'}`}
          >
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
          </svg>
        )}
      </div>
    </div>
  );
}
