import type { HeatmapCell } from '../types/index.ts';

const INTENSITY_COLORS = [
  'bg-surface-container-low',
  'bg-[#b2dfdb]',
  'bg-[#4db6ac]',
  'bg-[#00897b]',
  'bg-primary',
];

const DAY_LABELS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

interface ActivityHeatmapProps {
  cells: HeatmapCell[];
}

export default function ActivityHeatmap({ cells }: ActivityHeatmapProps) {
  const grid: number[][] = Array.from({ length: 4 }, () => Array(7).fill(0));
  for (const cell of cells) {
    grid[cell.week][cell.day] = cell.intensity;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[1.75rem] font-bold text-on-surface">Activity Density</h2>
        <span className="font-body text-xs text-on-surface/50 tracking-wide">Last 30 Days</span>
      </div>
      <div className="flex flex-col gap-2">
        {grid.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-2">
            {week.map((intensity, di) => (
              <div
                key={di}
                className={`aspect-square rounded-lg ${INTENSITY_COLORS[intensity]} transition-colors duration-200`}
              />
            ))}
          </div>
        ))}
        <div className="grid grid-cols-7 gap-2 mt-1">
          {DAY_LABELS.map((label) => (
            <span key={label} className="text-center font-body text-[0.65rem] text-on-surface/40 tracking-wide">
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
