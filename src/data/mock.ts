import type { HeatmapCell, StatCardData, SessionMetadata } from '../types/index.ts';

// Compute a real activity heatmap from session metadata.
// week 0 = oldest, week 3 = most recent; day 0 = MON, day 6 = SUN.
export function computeHeatmap(sessions: SessionMetadata[]): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  for (let week = 0; week < 4; week++) {
    for (let day = 0; day < 7; day++) {
      cells.push({ week, day, intensity: 0 });
    }
  }

  const now = new Date();
  now.setHours(23, 59, 59, 999);

  for (const session of sessions) {
    const dateStr = session.startDate;
    if (!dateStr) continue;
    const d = new Date(dateStr);
    const diffDays = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0 || diffDays >= 28) continue;

    const weekFromNewest = Math.floor(diffDays / 7);
    const week = 3 - weekFromNewest;

    const jsDay = d.getDay();
    const day = jsDay === 0 ? 6 : jsDay - 1;

    const cell = cells[week * 7 + day];
    if (cell) cell.intensity = Math.min(4, cell.intensity + 1);
  }

  return cells;
}

// Compute session duration in seconds from metadata (endDate - startDate).
export function sessionDurationSecs(session: SessionMetadata): number {
  if (!session.startDate || !session.endDate) return 0;
  return Math.max(0, Math.floor(
    (new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / 1000
  ));
}

// Format seconds as a human-readable string.
export function formatDuration(secs: number): string {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

// Compute dashboard/insights stat cards from session metadata + project count.
export function computeStats(sessions: SessionMetadata[], projectCount: number): StatCardData[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const monthlySessions = sessions.filter((s) => {
    if (!s.startDate) return false;
    return new Date(s.startDate) >= monthStart;
  });

  let monthlySeconds = 0;
  for (const s of monthlySessions) {
    monthlySeconds += sessionDurationSecs(s);
  }
  const monthlyHours = monthlySeconds / 3600;

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
export function computeSessionStats(sessions: SessionMetadata[]): StatCardData[] {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthlySessions = sessions.filter((s) => {
    if (!s.startDate) return false;
    return new Date(s.startDate) >= monthStart;
  });

  let totalSecs = 0;
  for (const s of monthlySessions) {
    totalSecs += sessionDurationSecs(s);
  }
  const totalHours = totalSecs / 3600;
  const avgSecs = monthlySessions.length > 0 ? totalSecs / monthlySessions.length : 0;
  const avgLabel = avgSecs > 0 ? formatDuration(avgSecs) : '—';

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
