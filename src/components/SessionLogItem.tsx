import type { Session } from '../types/index.ts';

const ACCENT_COMBOS = [
  { bg: 'bg-primary/12',    text: 'text-primary' },
  { bg: 'bg-tertiary/12',   text: 'text-tertiary' },
  { bg: 'bg-surface-container-highest', text: 'text-on-surface/50' },
];

interface SessionLogItemProps {
  session: Session;
  index: number;
}

export default function SessionLogItem({ session, index }: SessionLogItemProps) {
  const accent    = ACCENT_COMBOS[index % ACCENT_COMBOS.length];
  const startDate = new Date(session.startTime);
  const endDate   = new Date(session.endTime);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const daysDiff = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeLabel =
    daysDiff === 0
      ? `${formatTime(startDate)} – ${formatTime(endDate)}`
      : daysDiff === 1
      ? 'Yesterday'
      : startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-4 rounded-2xl px-5 py-4 bg-surface-container-low
      hover:bg-surface-container transition-all duration-200 group">
      {/* Avatar */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center
          font-display text-sm font-bold shrink-0 ${accent.bg} ${accent.text}`}
        aria-hidden="true"
      >
        {session.projectTitle.charAt(0).toUpperCase()}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="font-body text-sm font-semibold text-on-surface truncate leading-snug">
          {session.taskName}
        </p>
        <p className="font-body text-xs text-on-surface/40 mt-0.5">{session.projectTitle}</p>
      </div>

      {/* Duration + time */}
      <div className="text-right shrink-0">
        <p className="font-display text-base font-bold text-primary">{session.duration}</p>
        <p className="font-body text-xs text-on-surface/35 mt-0.5">{timeLabel}</p>
      </div>
    </div>
  );
}
