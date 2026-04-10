import { useEffect, useState } from 'react';

export const CHART_COLORS = [
  '#004d44',
  '#00897b',
  '#4db6ac',
  '#80cbc4',
  '#b2dfdb',
  '#26a69a',
  '#00675b',
  '#38b2ac',
];

export interface DonutSlice {
  label: string;
  value: number;
  color?: string;
}

interface DonutChartProps {
  slices: DonutSlice[];
  centerLabel?: string;
  centerSub?: string;
  size?: number;
  thickness?: number;
  showLegend?: boolean;
  emptyMessage?: string;
}

export default function DonutChart({
  slices,
  centerLabel,
  centerSub,
  size = 160,
  thickness = 24,
  showLegend = true,
  emptyMessage = 'No data yet',
}: DonutChartProps) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const r1 = requestAnimationFrame(() => {
      const r2 = requestAnimationFrame(() => setRevealed(true));
      return () => cancelAnimationFrame(r2);
    });
    return () => cancelAnimationFrame(r1);
  }, []);

  const total = slices.reduce((sum, s) => sum + s.value, 0);

  if (total === 0) {
    return (
      <div className="flex flex-col items-center gap-3">
        <div
          className="rounded-full flex items-center justify-center"
          style={{
            width: size,
            height: size,
            border: `${thickness}px solid`,
            borderColor: 'var(--color-surface-container-highest)',
          }}
        >
          <span className="font-body text-xs text-on-surface/65 text-center px-2 leading-snug">
            {emptyMessage}
          </span>
        </div>
      </div>
    );
  }

  const cx = size / 2;
  const cy = size / 2;
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  // 3px gap between segments
  const gapLen = slices.length > 1 ? 3 : 0;

  let cumAngle = -90;

  const segments = slices.map((slice, i) => {
    const fraction = slice.value / total;
    const totalLen = fraction * circumference;
    const visibleLen = Math.max(0, totalLen - gapLen);
    const rotation = cumAngle;
    cumAngle += fraction * 360;
    return {
      label: slice.label,
      value: slice.value,
      fraction,
      color: slice.color ?? CHART_COLORS[i % CHART_COLORS.length],
      rotation,
      visibleLen,
    };
  });

  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="animate-fade-in overflow-visible">
          {segments.map((seg, i) => (
            <circle
              key={i}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={thickness}
              strokeDasharray={`${revealed ? seg.visibleLen : 0} ${circumference}`}
              strokeDashoffset={0}
              strokeLinecap="butt"
              transform={`rotate(${seg.rotation} ${cx} ${cy})`}
              style={{
                transition: `stroke-dasharray 0.55s cubic-bezier(0.4, 0, 0.2, 1) ${i * 0.07}s`,
              }}
            />
          ))}
        </svg>

        {(centerLabel || centerSub) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            {centerLabel && (
              <span
                className="font-display font-bold text-on-surface leading-none"
                style={{ fontSize: Math.round(size * 0.14) }}
              >
                {centerLabel}
              </span>
            )}
            {centerSub && (
              <span
                className="font-body text-on-surface/65 mt-1"
                style={{ fontSize: Math.round(size * 0.08) }}
              >
                {centerSub}
              </span>
            )}
          </div>
        )}
      </div>

      {showLegend && (
        <div className="flex flex-col gap-1.5 w-full mt-3">
          {segments.map((seg, i) => {
            const pct = Math.round(seg.fraction * 100);
            return (
              <div key={i} className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: seg.color }}
                />
                <span className="font-body text-xs text-on-surface/75 truncate flex-1 min-w-0">
                  {seg.label}
                </span>
                <span className="font-display text-xs font-bold text-on-surface/65 shrink-0">
                  {pct}%
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
