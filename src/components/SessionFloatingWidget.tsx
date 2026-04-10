import { useNavigate } from 'react-router-dom';
import { formatElapsed, type ActiveSessionInfo } from '../hooks/useActiveSession.ts';

interface Props {
  info: ActiveSessionInfo;
}

export default function SessionFloatingWidget({ info }: Props) {
  const navigate = useNavigate();

  if (info.status === 'no active session') return null;

  const isPaused = info.status === 'paused';

  return (
    <div
      className="fixed bottom-6 right-6 z-[55] animate-fade-up"
      style={{ animationDuration: '0.25s' }}
    >
      <div
        className="flex items-center gap-3 rounded-2xl px-4 py-3
          shadow-[0_8px_32px_rgba(0,0,0,0.35)]
          border border-white/8"
        style={{ background: '#1e2020' }}
      >
        {/* Live/paused indicator */}
        <div className="flex items-center gap-1.5 shrink-0">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isPaused ? 'bg-white/25' : 'bg-primary animate-pulse-dot'
            }`}
          />
        </div>

        {/* Info */}
        <div className="flex flex-col min-w-0">
          {info.projectName && (
            <p className="font-body text-[0.65rem] text-white/60 leading-none mb-0.5 truncate max-w-[140px]">
              {info.projectName}
            </p>
          )}
          <p className="font-display text-sm font-bold text-white tabular-nums leading-none">
            {formatElapsed(info.elapsed)}
          </p>
        </div>

        {/* Separator */}
        <div className="w-px h-6 bg-white/8 shrink-0" />

        {/* Focus mode button */}
        <button
          onClick={() => navigate('/sessions')}
          className="flex items-center gap-1.5 rounded-xl px-3 py-1.5
            font-body text-xs font-semibold text-primary-light
            bg-primary/12 hover:bg-primary/20 transition-all duration-150 cursor-pointer shrink-0"
          aria-label="Return to focus mode"
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Focus
        </button>
      </div>
    </div>
  );
}
