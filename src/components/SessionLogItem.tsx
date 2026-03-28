import type { Session } from '../types/index.ts';

const ICON_COLORS = [
  'bg-primary/20 text-primary',
  'bg-tertiary/20 text-tertiary',
  'bg-surface-container text-on-surface/60',
];

interface SessionLogItemProps {
  session: Session;
  index: number;
}

export default function SessionLogItem({ session, index }: SessionLogItemProps) {
  const startDate = new Date(session.startTime);
  const endDate = new Date(session.endTime);

  const formatTime = (d: Date) =>
    d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

  const daysDiff = Math.floor((Date.now() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const timeRange =
    daysDiff === 0
      ? `${formatTime(startDate)} – ${formatTime(endDate)}`
      : daysDiff === 1
      ? 'Yesterday'
      : startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="flex items-center gap-4 bg-surface-container-low rounded-xl px-5 py-4 hover:bg-surface-container transition-colors duration-200">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center font-display text-sm font-bold shrink-0 ${ICON_COLORS[index % ICON_COLORS.length]}`}
      >
        {session.projectTitle.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-body text-[1.125rem] font-semibold text-on-surface truncate">
          {session.taskName}
        </p>
        <p className="font-body text-xs text-on-surface/50">{session.projectTitle}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-body text-[1.125rem] font-semibold text-primary">{session.duration}</p>
        <p className="font-body text-xs text-on-surface/50">{timeRange}</p>
      </div>
    </div>
  );
}
