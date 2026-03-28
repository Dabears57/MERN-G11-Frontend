import StatCard from '../components/StatCard.tsx';
import ActivityHeatmap from '../components/ActivityHeatmap.tsx';
import ActiveProjectsPanel from '../components/ActiveProjectsPanel.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import { MOCK_SESSIONS, computeStats, computeHeatmap } from '../data/mock.ts';
import { useProjects } from '../hooks/useProjects.ts';
import { getUserName } from '../hooks/useAuth.ts';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { projects } = useProjects();
  const userName     = getUserName();
  const todayLabel   = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  const stats        = computeStats(MOCK_SESSIONS, projects.length);
  const heatmapCells = computeHeatmap(MOCK_SESSIONS);

  return (
    <div className="animate-fade-up">
      {/* Greeting */}
      <div className="mb-8">
        <h1 className="font-display text-[2.75rem] font-bold text-on-surface leading-tight">
          {getGreeting()}{userName ? `, ${userName}` : ''}
        </h1>
        <p className="font-body text-sm text-on-surface/40 mt-1.5">{todayLabel}</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4 mb-8 stagger-1 animate-fade-up">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      {/* Main grid: heatmap + sidebar */}
      <div className="grid grid-cols-[1fr_272px] gap-6">
        {/* Left column */}
        <div className="min-w-0 flex flex-col gap-8">
          <div className="stagger-2 animate-fade-up">
            <ActivityHeatmap cells={heatmapCells} />
          </div>

          {/* Recent Sessions */}
          <div className="stagger-3 animate-fade-up">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-bold text-on-surface">Recent Sessions</h2>
              <span className="font-body text-xs text-on-surface/35 uppercase tracking-wide">Last 30 days</span>
            </div>

            {MOCK_SESSIONS.length > 0 ? (
              <div className="flex flex-col gap-2">
                {MOCK_SESSIONS.map((session, i) => (
                  <SessionLogItem key={session.id} session={session} index={i} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-2xl p-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-surface-container mx-auto mb-3 flex items-center justify-center text-on-surface/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" /><polyline points="12 7 12 12 15 14" />
                  </svg>
                </div>
                <p className="font-body text-sm text-on-surface/40">
                  No sessions yet. Start tracking your work time.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="min-w-0 stagger-4 animate-fade-up">
          <ActiveProjectsPanel projects={projects} />
        </div>
      </div>
    </div>
  );
}
