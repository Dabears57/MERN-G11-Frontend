import { useMemo } from 'react';

interface Props {
  password: string;
}

interface Criterion {
  label: string;
  met: boolean;
}

const LEVELS = [
  { label: 'Weak',   color: '#ef4444' },
  { label: 'Fair',   color: '#f97316' },
  { label: 'Good',   color: '#84cc16' },
  { label: 'Strong', color: '#00675b' },
] as const;

function calcScore(password: string): number {
  if (!password) return 0;
  let score = 0;
  if (password.length >= 8)         score++;
  if (/[A-Z]/.test(password))       score++;
  if (/[0-9]/.test(password))       score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

export function isPasswordStrong(password: string): boolean {
  return calcScore(password) >= 3;
}

export default function PasswordStrengthBar({ password }: Props) {
  const score = useMemo(() => calcScore(password), [password]);
  const visible = password.length > 0;

  const criteria: Criterion[] = [
    { label: 'At least 8 characters',  met: password.length >= 8 },
    { label: 'One uppercase letter',    met: /[A-Z]/.test(password) },
    { label: 'One number',              met: /[0-9]/.test(password) },
    { label: 'One special character',   met: /[^A-Za-z0-9]/.test(password) },
  ];

  const activeLevel = score > 0 ? LEVELS[score - 1] : null;

  if (!visible) return null;

  return (
    <div className="flex flex-col gap-2.5 animate-fade-up">
      {/* Segment bar + label */}
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1">
          {LEVELS.map((level, i) => {
            const filled = score > i;
            return (
              <div
                key={level.label}
                className="flex-1 h-1.5 rounded-full overflow-hidden"
                style={{ backgroundColor: '#ededee' }}
              >
                <div
                  className="h-full w-full rounded-full origin-left"
                  style={{
                    transform: filled ? 'scaleX(1)' : 'scaleX(0)',
                    backgroundColor: filled ? activeLevel!.color : 'transparent',
                    transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), background-color 0.2s ease',
                  }}
                />
              </div>
            );
          })}
        </div>
        {activeLevel && (
          <span
            className="font-body text-[0.7rem] font-semibold w-10 text-right shrink-0"
            style={{ color: activeLevel.color, transition: 'color 0.2s ease' }}
          >
            {activeLevel.label}
          </span>
        )}
      </div>

      {/* Requirements checklist */}
      <div className="flex flex-col gap-1">
        {criteria.map((c, i) => (
          <div
            key={c.label}
            className={`flex items-center gap-2 animate-fade-up stagger-${i + 1}`}
          >
            {/* Circle icon */}
            <svg
              width="13"
              height="13"
              viewBox="0 0 13 13"
              fill="none"
              className="shrink-0"
              style={{ transition: 'opacity 0.2s ease' }}
            >
              <circle
                cx="6.5"
                cy="6.5"
                r="5.5"
                strokeWidth="1.25"
                stroke={c.met ? '#004d44' : 'rgba(26,28,28,0.25)'}
                fill={c.met ? '#004d44' : 'none'}
                style={{ transition: 'stroke 0.2s ease, fill 0.2s ease' }}
              />
              {c.met && (
                <polyline
                  points="4,6.5 6,8.5 9,5"
                  stroke="white"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </svg>

            <span
              className="font-body text-xs"
              style={{
                color: c.met ? '#004d44' : 'rgba(26,28,28,0.45)',
                textDecoration: c.met ? 'line-through' : 'none',
                transition: 'color 0.2s ease, text-decoration 0.2s ease',
              }}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
