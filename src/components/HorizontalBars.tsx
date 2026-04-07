import { useEffect, useState } from 'react';
import { CHART_COLORS } from './DonutChart.tsx';

function formatSecs(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s}s`;
}

export interface HBarEntry {
  label: string;
  value: number; // seconds
  color?: string;
}

interface HorizontalBarsProps {
  entries: HBarEntry[];
  emptyMessage?: string;
}

export default function HorizontalBars({
  entries,
  emptyMessage = 'No tasks tracked',
}: HorizontalBarsProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(id);
  }, []);

  const total = entries.reduce((sum, e) => sum + e.value, 0);

  if (total === 0) {
    return (
      <p className="font-body text-sm text-on-surface/30 text-center py-4">
        {emptyMessage}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {entries.map((entry, i) => {
        const pct = (entry.value / total) * 100;
        const color = entry.color ?? CHART_COLORS[i % CHART_COLORS.length];

        return (
          <div key={i}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: color }}
                />
                <span className="font-body text-sm text-on-surface/80 truncate">
                  {entry.label}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                <span className="font-body text-xs text-on-surface/35">
                  {Math.round(pct)}%
                </span>
                <span className="font-display text-sm font-bold text-primary">
                  {formatSecs(entry.value)}
                </span>
              </div>
            </div>
            <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
              <div
                className="h-full rounded-full"
                style={{
                  width: animated ? `${pct}%` : '0%',
                  background: color,
                  transition: `width 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
