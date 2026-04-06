import { useState, useEffect } from 'react';
import ActivityHeatmap from '../components/ActivityHeatmap.tsx';
import StatCard from '../components/StatCard.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import { computeStats, computeHeatmap } from '../data/mock.ts';
import { listSessions, listProjects } from '../api/queries.ts';
import type { SessionMetadata, ProjectMetadata } from '../types/index.ts';

export default function InsightsPage() {
  const [sessions,  setSessions]  = useState<SessionMetadata[]>([]);
  const [projects,  setProjects]  = useState<ProjectMetadata[]>([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    async function load() {
      const [sessRes, projRes] = await Promise.all([listSessions(), listProjects()]);
      setSessions(sessRes.data ?? []);
      setProjects(projRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const completedSessions = sessions.filter((s) => !!s.endDate);
  const stats        = computeStats(completedSessions, projects.length);
  const heatmapCells = computeHeatmap(completedSessions);

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
        {loading
          ? [1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-surface-container-low animate-pulse" />)
          : stats.map((stat) => <StatCard key={stat.label} {...stat} />)
        }
      </div>

      {/* Heatmap */}
      <div className="stagger-2 animate-fade-up mb-8">
        <ActivityHeatmap cells={heatmapCells} />
      </div>

      {/* Projects breakdown */}
      {!loading && projects.length > 0 && (
        <div className="stagger-3 animate-fade-up mb-8">
          <h2 className="font-display text-lg font-bold text-on-surface mb-4">Projects</h2>
          <div className="flex flex-col gap-2">
            {projects.map((project) => {
              const hrs = (project.totalTime / 3600).toFixed(1);
              return (
                <div key={project._id} className="bg-surface-container-low rounded-2xl px-5 py-4 flex items-center justify-between">
                  <div>
                    <p className="font-body text-sm font-semibold text-on-surface">{project.title}</p>
                    {project.startDate && (
                      <p className="font-body text-xs text-on-surface/35 mt-0.5">
                        Started {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <span className="font-display text-base font-bold text-primary">{hrs}h</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent sessions list */}
      <div className="stagger-4 animate-fade-up">
        <h2 className="font-display text-lg font-bold text-on-surface mb-4">Session History</h2>
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-surface-container-low animate-pulse" />)}
          </div>
        ) : completedSessions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {completedSessions.slice().reverse().map((session, i) => (
              <SessionLogItem key={session._id} session={session} index={i} linkable />
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-low rounded-2xl p-10 text-center">
            <p className="font-body text-sm text-on-surface/40">No sessions recorded yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
