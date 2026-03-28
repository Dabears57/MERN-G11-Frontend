import ActivityHeatmap from '../components/ActivityHeatmap.tsx';
import StatCard from '../components/StatCard.tsx';
import { MOCK_SESSIONS, computeStats, computeHeatmap } from '../data/mock.ts';
import { useProjects } from '../hooks/useProjects.ts';

export default function InsightsPage() {
  const { projects } = useProjects();
  const stats = computeStats(MOCK_SESSIONS, projects.length);
  const heatmapCells = computeHeatmap(MOCK_SESSIONS);

  return (
    <div>
      <h1 className="font-display text-[3.5rem] font-bold text-on-surface mb-2">Insights</h1>
      <p className="font-body text-base text-on-surface/50 mb-10">
        Last 30 days — updated in real time as you track.
      </p>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <ActivityHeatmap cells={heatmapCells} />

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-surface-container-low rounded-2xl p-8 opacity-60 select-none">
          <p className="font-body text-xs uppercase tracking-widest text-on-surface/40 mb-2">Coming Soon</p>
          <h3 className="font-display text-xl font-bold text-on-surface mb-2">Project Breakdown</h3>
          <p className="font-body text-sm text-on-surface/50">
            Per-project time allocation and trend analysis.
          </p>
        </div>
        <div className="bg-surface-container-low rounded-2xl p-8 opacity-60 select-none">
          <p className="font-body text-xs uppercase tracking-widest text-on-surface/40 mb-2">Coming Soon</p>
          <h3 className="font-display text-xl font-bold text-on-surface mb-2">Session Patterns</h3>
          <p className="font-body text-sm text-on-surface/50">
            Your peak focus hours and optimal work windows.
          </p>
        </div>
      </div>
    </div>
  );
}
