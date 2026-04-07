import { useState, useEffect } from 'react';
import ActivityHeatmap from '../components/ActivityHeatmap.tsx';
import StatCard from '../components/StatCard.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import DonutChart from '../components/DonutChart.tsx';
import BarChart from '../components/BarChart.tsx';
import {
  computeHeatmap,
  computeWeeklyHours,
  computeTotalHours,
  computeStreak,
  formatDuration,
  sessionDurationSecs,
} from '../data/mock.ts';
import { listSessions, listProjects } from '../api/queries.ts';
import type { SessionMetadata, ProjectMetadata } from '../types/index.ts';
import type { DonutSlice } from '../components/DonutChart.tsx';

const RANKED_COLORS = ['#004d44', '#00897b', '#4db6ac', '#80cbc4', '#b2dfdb'];

export default function InsightsPage() {
  const [sessions, setSessions] = useState<SessionMetadata[]>([]);
  const [projects, setProjects] = useState<ProjectMetadata[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sessRes, projRes] = await Promise.all([listSessions(), listProjects()]);
      setSessions(sessRes.data ?? []);
      setProjects(projRes.data ?? []);
      setLoading(false);
    }
    load();
  }, []);

  const completedSessions = sessions.filter(s => !!s.endDate);
  const heatmapCells = computeHeatmap(completedSessions);
  const weeklyHours = computeWeeklyHours(completedSessions, 8);

  const totalHours = computeTotalHours(completedSessions);
  const streak = computeStreak(completedSessions);
  const avgSecs =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + sessionDurationSecs(s), 0) /
        completedSessions.length
      : 0;

  // Insights-specific stat cards (different from dashboard)
  const insightStats = [
    {
      label: 'Total Hours',
      value: totalHours > 0 ? totalHours.toFixed(1) : '0',
      subtitle: 'hrs',
      variant: 'primary' as const,
    },
    {
      label: 'Day Streak',
      value: String(streak),
      subtitle: streak === 1 ? 'day' : 'days',
    },
    {
      label: 'Avg Session',
      value: avgSecs > 0 ? formatDuration(avgSecs) : '—',
    },
  ];

  // Project donut — top 6 by time
  const sortedProjects = [...projects]
    .filter(p => p.totalTime > 0)
    .sort((a, b) => b.totalTime - a.totalTime);

  const projectSlices: DonutSlice[] = sortedProjects
    .slice(0, 6)
    .map(p => ({ label: p.title, value: p.totalTime }));

  const totalProjectTime = projects.reduce((sum, p) => sum + p.totalTime, 0);
  const totalProjectHours = totalProjectTime / 3600;

  const hasProjects = !loading && projects.some(p => p.totalTime > 0);

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="mb-8">
        <p className="font-body text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary/60 mb-2">
          Analytics
        </p>
        <h1 className="font-display text-[2.75rem] font-bold text-on-surface leading-tight">
          Insights
        </h1>
        <p className="font-body text-sm text-on-surface/40 mt-1.5">
          Patterns and trends across all your tracked work.
        </p>
      </div>

      {/* Stats — different from dashboard */}
      <div className="grid grid-cols-3 gap-4 mb-8 stagger-1 animate-fade-up">
        {loading
          ? [1, 2, 3].map(i => (
              <div key={i} className="h-24 rounded-2xl bg-surface-container-low animate-pulse" />
            ))
          : insightStats.map(stat => <StatCard key={stat.label} {...stat} />)}
      </div>

      {/* Weekly Activity bar chart */}
      <div className="stagger-2 animate-fade-up mb-8">
        <div className="bg-surface-container-low rounded-2xl px-6 py-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-display text-lg font-bold text-on-surface leading-none">
                Weekly Activity
              </h2>
              <p className="font-body text-xs text-on-surface/40 mt-1">Hours tracked per week</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-[#4db6ac]" />
                <span className="font-body text-[0.65rem] text-on-surface/40">Previous</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm bg-primary" />
                <span className="font-body text-[0.65rem] text-on-surface/40">Current</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className="h-36 animate-pulse bg-surface-container rounded-xl" />
          ) : (
            <BarChart
              data={weeklyHours.map((w, i) => ({
                label: w.label,
                value: w.hours,
                highlight: i === weeklyHours.length - 1,
              }))}
              height={140}
            />
          )}
        </div>
      </div>

      {/* Project Distribution + Top Projects ranked */}
      {hasProjects && (
        <div className="stagger-3 animate-fade-up mb-8">
          <div className="grid grid-cols-[5fr_7fr] gap-6">
            {/* Donut */}
            <div className="bg-surface-container-low rounded-2xl px-6 py-5">
              <h2 className="font-display text-lg font-bold text-on-surface leading-none">
                Time Split
              </h2>
              <p className="font-body text-xs text-on-surface/40 mt-1 mb-5">By project</p>
              <div className="flex justify-center">
                <DonutChart
                  slices={projectSlices}
                  centerLabel={
                    totalProjectHours > 0 ? `${Math.round(totalProjectHours)}h` : undefined
                  }
                  centerSub="total"
                  size={180}
                  thickness={26}
                />
              </div>
            </div>

            {/* Ranked list with progress bars */}
            <div className="bg-surface-container-low rounded-2xl px-6 py-5">
              <h2 className="font-display text-lg font-bold text-on-surface leading-none">
                Top Projects
              </h2>
              <p className="font-body text-xs text-on-surface/40 mt-1 mb-5">Ranked by time</p>
              <div className="flex flex-col gap-4">
                {sortedProjects.slice(0, 5).map((project, i) => {
                  const pct =
                    totalProjectTime > 0
                      ? (project.totalTime / totalProjectTime) * 100
                      : 0;
                  const hrs = (project.totalTime / 3600).toFixed(1);
                  return (
                    <div key={project._id}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-body text-[0.6rem] text-on-surface/30 shrink-0 w-4 text-right">
                            {i + 1}
                          </span>
                          <span className="font-body text-sm text-on-surface/80 truncate">
                            {project.title}
                          </span>
                        </div>
                        <span className="font-display text-sm font-bold text-primary shrink-0 ml-2">
                          {hrs}h
                        </span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden ml-6">
                        <div
                          className="h-full rounded-full animate-grow-x"
                          style={{
                            width: `${pct}%`,
                            background: RANKED_COLORS[i % RANKED_COLORS.length],
                            animationDelay: `${0.3 + i * 0.08}s`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Activity heatmap */}
      <div className="stagger-4 animate-fade-up mb-8">
        <ActivityHeatmap cells={heatmapCells} />
      </div>

      {/* Session History */}
      <div className="stagger-5 animate-fade-up">
        <h2 className="font-display text-lg font-bold text-on-surface mb-4">Session History</h2>
        {loading ? (
          <div className="flex flex-col gap-2">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 rounded-2xl bg-surface-container-low animate-pulse" />
            ))}
          </div>
        ) : completedSessions.length > 0 ? (
          <div className="flex flex-col gap-2">
            {completedSessions
              .slice()
              .reverse()
              .map((session, i) => (
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
