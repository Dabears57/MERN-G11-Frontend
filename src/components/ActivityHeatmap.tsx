import type { HeatmapCell } from '../types/index.ts';

const INTENSITY_BG = [
  'bg-surface-container-highest',
  'bg-[#b2dfdb]',
  'bg-[#4db6ac]',
  'bg-[#00897b]',
  'bg-primary',
];

const INTENSITY_TITLE = ['No activity', 'Low', 'Moderate', 'High', 'Very high'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

interface ActivityHeatmapProps {
  cells: HeatmapCell[];
}

export default function ActivityHeatmap({ cells }: ActivityHeatmapProps) {
  // grid[week][day] — week 0 = oldest, week 3 = most recent
  const grid: number[][] = Array.from({ length: 4 }, () => Array(7).fill(0));
  for (const cell of cells) {
    grid[cell.week][cell.day] = cell.intensity;
  }

  const totalActive = cells.filter((c) => c.intensity > 0).length;

  return (
    <section aria-label="Activity heatmap — last 30 days">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-on-surface leading-none">Activity</h2>
          <p className="font-body text-xs text-on-surface/40 mt-1">Last 30 days</p>
        </div>
        {totalActive > 0 ? (
          <span className="font-body text-xs text-on-surface/40">
            {totalActive} active day{totalActive !== 1 ? 's' : ''}
          </span>
        ) : (
          <span className="font-body text-xs text-on-surface/30 italic">No sessions recorded</span>
        )}
      </div>

      <div className="bg-surface-container-low rounded-2xl px-5 pt-4 pb-5">
        {/* Day-of-week column headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAY_LABELS.map((d) => (
            <span key={d} className="text-center font-body text-[0.6rem] font-medium text-on-surface/30 uppercase tracking-wide">
              {d.charAt(0)}
            </span>
          ))}
        </div>

        {/* Rows = weeks (newest → oldest top → bottom), Columns = days */}
        <div className="flex flex-col gap-2">
          {grid.slice().reverse().map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-2">
              {week.map((intensity, di) => (
                <div
                  key={di}
                  title={`${INTENSITY_TITLE[intensity]}`}
                  className={`h-7 w-full rounded-md ${INTENSITY_BG[intensity]}
                    transition-all duration-200 hover:brightness-90 hover:scale-[1.06] cursor-default`}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mt-3">
          <span className="font-body text-[0.6rem] text-on-surface/25 mr-1">Less</span>
          {INTENSITY_BG.map((bg, i) => (
            <div key={i} className={`w-3.5 h-3.5 rounded-sm ${bg}`} title={INTENSITY_TITLE[i]} />
          ))}
          <span className="font-body text-[0.6rem] text-on-surface/25 ml-1">More</span>
        </div>
      </div>
    </section>
  );
}
