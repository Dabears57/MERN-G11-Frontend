import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard.tsx';
import ActivityHeatmap from '../components/ActivityHeatmap.tsx';
import ActiveProjectsPanel from '../components/ActiveProjectsPanel.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import { computeStats, computeHeatmap } from '../data/mock.ts';
import { listSessions } from '../api/queries.ts';
import { fetchProjects } from '../api/projects.ts';
import { getUserName } from '../hooks/useAuth.ts';
import type { SessionMetadata, ApiProject } from '../types/index.ts';

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function DashboardPage() {
  const [sessions,  setSessions]  = useState<SessionMetadata[]>([]);
  const [projects,  setProjects]  = useState<ApiProject[]>([]);
  const [loading,   setLoading]   = useState(true);
  const userName  = getUserName();
  const todayLabel = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  useEffect(() => {
    async function load() {
      const [sessRes, projRes] = await Promise.all([listSessions(), fetchProjects()]);
      setSessions(sessRes.data ?? []);
      setProjects(projRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const completedSessions = sessions.filter((s) => !!s.endDate);
  const stats        = computeStats(completedSessions, projects.length);
  const heatmapCells = computeHeatmap(completedSessions);
  const recentSessions = completedSessions.slice().reverse().slice(0, 10);

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
        {loading
          ? [1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-surface-container-low animate-pulse" />)
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)
        }
      </div>

      {/* Main grid */}
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

            {loading ? (
              <div className="flex flex-col gap-2">
                {[1, 2].map((i) => <div key={i} className="h-16 rounded-2xl bg-surface-container-low animate-pulse" />)}
              </div>
            ) : recentSessions.length > 0 ? (
              <div className="flex flex-col gap-2">
                {recentSessions.map((session, i) => (
                  <SessionLogItem key={session._id} session={session} index={i} />
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
          <ActiveProjectsPanel projects={projects} loading={loading} />
        </div>
      </div>
    </div>
  );
}
