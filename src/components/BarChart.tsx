import { useEffect, useState } from 'react';

export interface BarDatum {
  label: string;
  value: number; // hours
  highlight?: boolean;
}

interface BarChartProps {
  data: BarDatum[];
  height?: number;
  emptyMessage?: string;
}

export default function BarChart({
  data,
  height = 130,
  emptyMessage = 'No data yet',
}: BarChartProps) {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const id = window.setTimeout(() => setAnimated(true), 60);
    return () => clearTimeout(id);
  }, []);

  const maxValue = Math.max(...data.map(d => d.value), 0.01);
  const hasData = data.some(d => d.value > 0);

  if (!hasData) {
    return (
      <div
        className="flex items-center justify-center font-body text-xs text-on-surface/30"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  return (
    <div>
      {/* Grid lines */}
      <div className="relative" style={{ height }}>
        <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
          {[1, 0.75, 0.5, 0.25].map((_, i) => (
            <div key={i} className="w-full border-t border-surface-container-highest" />
          ))}
        </div>

        {/* Bars */}
        <div className="relative flex items-end gap-1 h-full px-0.5">
          {data.map((d, i) => {
            const pct = (d.value / maxValue) * 100;
            const isHighlight = d.highlight ?? false;
            return (
              <div key={i} className="flex-1 flex flex-col items-center justify-end h-full min-w-0 gap-0.5">
                {d.value > 0 && animated && (
                  <span
                    className="font-display font-bold text-on-surface/35"
                    style={{ fontSize: 8 }}
                  >
                    {d.value.toFixed(2)}
                  </span>
                )}
                <div
                  className={`w-full rounded-t-md ${
                    isHighlight ? 'bg-primary' : 'bg-[#4db6ac]'
                  }`}
                  style={{
                    height: animated && d.value > 0 ? `${pct}%` : '0%',
                    minHeight: animated && d.value > 0 ? '3px' : '0',
                    transition: `height 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.045}s`,
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex gap-1 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-center min-w-0">
            <span
              className="font-body text-on-surface/30 whitespace-nowrap"
              style={{ fontSize: 8 }}
            >
              {d.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
