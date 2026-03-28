import StatCard from '../components/StatCard.tsx';
import ActivityHeatmap from '../components/ActivityHeatmap.tsx';
import ActiveProjectsPanel from '../components/ActiveProjectsPanel.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import { MOCK_SESSIONS, computeStats, computeHeatmap } from '../data/mock.ts';
import { useProjects } from '../hooks/useProjects.ts';
import { getUserName } from '../hooks/useAuth.ts';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const { projects } = useProjects();
  const userName = getUserName();
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  const stats = computeStats(MOCK_SESSIONS, projects.length);
  const heatmapCells = computeHeatmap(MOCK_SESSIONS);

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-[3.5rem] font-bold text-on-surface leading-tight">
          {getGreeting()}{userName ? `, ${userName}` : ''}
        </h1>
        <p className="font-body text-base text-on-surface/50 mt-1">{todayLabel}</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-10">
        {stats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-[1fr_340px] gap-8">
        <div className="min-w-0">
          <ActivityHeatmap cells={heatmapCells} />

          <div className="mt-10">
            <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-4">
              Recent Sessions
            </h2>
            {MOCK_SESSIONS.length > 0 ? (
              <div className="flex flex-col gap-3">
                {MOCK_SESSIONS.map((session, i) => (
                  <SessionLogItem key={session.id} session={session} index={i} />
                ))}
              </div>
            ) : (
              <div className="bg-surface-container-low rounded-xl p-8 text-center">
                <p className="font-body text-on-surface/50">
                  Start a session to begin logging your time.
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="min-w-0">
          <ActiveProjectsPanel projects={projects} />
        </div>
      </div>
    </div>
  );
}
