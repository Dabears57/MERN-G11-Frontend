import ActivityHeatmap from '../components/ActivityHeatmap.tsx';
import StatCard from '../components/StatCard.tsx';
import { MOCK_SESSIONS, computeStats, computeHeatmap } from '../data/mock.ts';
import { useProjects } from '../hooks/useProjects.ts';

function ComingSoonCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-surface-container-low rounded-2xl p-6 flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="font-body text-[0.6rem] font-semibold tracking-[0.1em] uppercase
          text-on-surface/30 bg-surface-container px-2 py-1 rounded-md">
          Coming soon
        </span>
      </div>
      <h3 className="font-display text-base font-bold text-on-surface/50">{title}</h3>
      <p className="font-body text-sm text-on-surface/35 leading-relaxed">{description}</p>
      {/* Placeholder chart skeleton */}
      <div className="mt-2 h-24 rounded-xl bg-surface-container flex items-end gap-1.5 px-3 pb-3 overflow-hidden">
        {[40, 60, 35, 75, 50, 85, 45, 65, 30, 70].map((h, i) => (
          <div
            key={i}
            className="flex-1 rounded-sm bg-surface-container-highest opacity-60"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <p className="font-body text-[0.65rem] text-on-surface/25 text-center">
        {/* TODO: Connect to backend endpoint -> Expected Payload: { sessions: Session[], projects: Project[] } */}
        Data visualization available after connecting to backend
      </p>
    </div>
  );
}

export default function InsightsPage() {
  const { projects } = useProjects();
  const stats        = computeStats(MOCK_SESSIONS, projects.length);
  const heatmapCells = computeHeatmap(MOCK_SESSIONS);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-[2.75rem] font-bold text-on-surface leading-tight">Insights</h1>
        <p className="font-body text-sm text-on-surface/40 mt-1.5">
          Your productivity at a glance — updated as you track.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8 stagger-1 animate-fade-up">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Heatmap */}
      <div className="stagger-2 animate-fade-up mb-8">
        <ActivityHeatmap cells={heatmapCells} />
      </div>

      {/* Coming soon charts */}
      <div className="stagger-3 animate-fade-up">
        <h2 className="font-display text-lg font-bold text-on-surface mb-4">Analytics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ComingSoonCard
            title="Project Breakdown"
            description="Per-project time allocation and trend analysis."
          />
          <ComingSoonCard
            title="Session Patterns"
            description="Your peak focus hours and optimal work windows."
          />
        </div>
      </div>
    </div>
  );
}
