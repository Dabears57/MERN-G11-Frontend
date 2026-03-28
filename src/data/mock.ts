import type { Project, Session, HeatmapCell, StatCardData } from '../types/index.ts';

// TODO: Connect to backend endpoint -> Expected Payload: { projects: Project[] }
export const MOCK_PROJECTS: Project[] = [];

// TODO: Connect to backend endpoint -> Expected Payload: { sessions: Session[] }
export const MOCK_SESSIONS: Session[] = [];

// Compute a real activity heatmap from an array of sessions.
// week 0 = oldest, week 3 = most recent; day 0 = MON, day 6 = SUN.
export function computeHeatmap(sessions: Session[]): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 7; day++) {
      cells.push({ week, day, intensity: 0 });
    }
  }

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  for (const session of sessions) {
    const d = new Date(session.startTime);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays >= 28) continue;

    // weekFromNewest: 0 = this week, 3 = 4 weeks ago
    const weekFromNewest = Math.floor(diffDays / 7);
    const week = 3 - weekFromNewest;

    // JS getDay(): 0=Sun → heatmap 6; 1=Mon → heatmap 0; etc.
    const jsDay = d.getDay();
    const day = jsDay === 0 ? 6 : jsDay - 1;

    const cell = cells[week * 7 + day];
    if (cell) cell.intensity = Math.min(4, cell.intensity + 1);
  }

  return cells;
}

// Compute dashboard/insights stat cards from real session + project data.
export function computeStats(sessions: Session[], projectCount: number): StatCardData[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlySessions = sessions.filter((s) => new Date(s.startTime) >= monthStart);

  let monthlyMins = 0;
  for (const s of monthlySessions) {
    const m = s.duration.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/);
    monthlyMins += (parseInt(m?.[1] ?? '0') || 0) * 60 + (parseInt(m?.[2] ?? '0') || 0);
  }
  const monthlyHours = monthlyMins / 60;

  return [
    {
      label: 'Total Sessions',
      value: String(sessions.length),
      trend: sessions.length > 0 ? 'up' : undefined,
    },
    {
      label: 'Monthly Duration',
      value: monthlyHours > 0 ? monthlyHours.toFixed(1) : '0',
      subtitle: 'hours',
      variant: 'primary',
    },
    {
      label: 'Active Projects',
      value: String(projectCount),
    },
  ];
}

// Compute session-page stat cards.
export function computeSessionStats(sessions: Session[]): StatCardData[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySessions = sessions.filter((s) => new Date(s.startTime) >= monthStart);

  let totalMins = 0;
  for (const s of monthlySessions) {
    const m = s.duration.match(/(?:(\d+)h\s*)?(?:(\d+)m)?/);
    totalMins += (parseInt(m?.[1] ?? '0') || 0) * 60 + (parseInt(m?.[2] ?? '0') || 0);
  }
  const totalHours = totalMins / 60;
  const avgMins = monthlySessions.length > 0 ? totalMins / monthlySessions.length : 0;
  const avgLabel =
    avgMins > 0
      ? avgMins >= 60
        ? `${Math.floor(avgMins / 60)}h ${Math.round(avgMins % 60)}m`
        : `${Math.round(avgMins)}m`
      : '—';

  return [
    {
      label: 'Total Sessions',
      value: String(sessions.length),
      trend: sessions.length > 0 ? 'up' : undefined,
    },
    {
      label: 'Time This Month',
      value: totalHours > 0 ? totalHours.toFixed(1) : '0',
      subtitle: 'hrs',
      variant: 'primary',
    },
    {
      label: 'Avg Duration',
      value: avgLabel,
    },
  ];
}
