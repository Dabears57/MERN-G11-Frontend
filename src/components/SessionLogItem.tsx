import { useNavigate } from 'react-router-dom';
import type { SessionMetadata } from '../types/index.ts';

const ACCENT_COMBOS = [
  { bg: 'bg-primary/12',    text: 'text-primary' },
  { bg: 'bg-tertiary/12',   text: 'text-tertiary' },
  { bg: 'bg-surface-container-highest', text: 'text-on-surface/50' },
];

interface SessionLogItemProps {
  session: SessionMetadata;
  index: number;
  linkable?: boolean;
}

function durationLabel(startStr: string | null, endStr: string | null): string {
  if (!startStr || !endStr) return '—';
  const secs = Math.max(0, Math.floor(
    (new Date(endStr).getTime() - new Date(startStr).getTime()) / 1000
  ));
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function timeLabel(startStr: string | null, endStr: string | null): string {
  if (!startStr) return '—';
  const startDate = new Date(startStr);
  const daysDiff = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff === 0) {
    const fmt = (d: Date) => d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    const end = endStr ? fmt(new Date(endStr)) : 'ongoing';
    return `${fmt(startDate)} – ${end}`;
  }
  if (daysDiff === 1) return 'Yesterday';
  return startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export default function SessionLogItem({ session, index, linkable }: SessionLogItemProps) {
  const navigate = useNavigate();
  const accent   = ACCENT_COMBOS[index % ACCENT_COMBOS.length];
  const initial  = (session.projectName || session.name || '?').charAt(0).toUpperCase();
  const duration = durationLabel(session.startDate, session.endDate);
  const time     = timeLabel(session.startDate, session.endDate);

  function handleClick() {
    if (linkable) navigate(`/insights/session/${session._id}`);
  }

  return (
    <div
      onClick={handleClick}
      className={`flex items-center gap-4 rounded-2xl px-5 py-4 bg-surface-container-low
        hover:bg-surface-container transition-all duration-200 group
        ${linkable ? 'cursor-pointer' : ''}`}
    >
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center
          font-display text-sm font-bold shrink-0 ${accent.bg} ${accent.text}`}
        aria-hidden="true"
      >
        {initial}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold text-on-surface truncate leading-snug">
          {session.name}
        </p>
        <p className="font-body text-xs text-on-surface/40 mt-0.5">{session.projectName}</p>
      </div>

      {/* Duration + time */}
      <div className="text-right shrink-0">
        <p className="font-display text-base font-bold text-primary">{duration}</p>
        <p className="font-body text-xs text-on-surface/35 mt-0.5">{time}</p>
      </div>
    </div>
  );
}
