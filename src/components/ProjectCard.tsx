import { useNavigate } from 'react-router-dom';
import type { ApiProject } from '../types/index.ts';

const ACCENT_COLORS = [
  '#004d44',
  '#0e4675',
  '#5a6e52',
  '#7a5a3e',
];

interface ProjectCardProps {
  project: ApiProject;
  index?: number;
  onDelete?: (id: string) => void;
}

function formatHours(secs: number): string {
  const h = secs / 3600;
  return h < 0.1 ? '0h' : `${h.toFixed(1)}h`;
}

export default function ProjectCard({ project, index = 0, onDelete }: ProjectCardProps) {
  const navigate     = useNavigate();
  const accentColor  = ACCENT_COLORS[index % ACCENT_COLORS.length];

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/projects/${project._id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/projects/${project._id}`)}
      className="group relative bg-surface-container-low rounded-2xl overflow-hidden
        hover:bg-surface-container transition-all duration-200 cursor-pointer
        hover:shadow-[0_6px_24px_rgba(26,28,28,0.07)] focus-visible:outline-2
        focus-visible:outline-primary focus-visible:outline-offset-2"
      aria-label={`Project: ${project.title}`}
    >
      {/* Top accent strip */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-5">
        {/* Title */}
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-display text-base font-bold text-on-surface group-hover:text-primary
            transition-colors duration-200 leading-snug pr-2">
            {project.title}
          </h3>
          <span className="font-body text-xs font-semibold shrink-0 mt-0.5" style={{ color: accentColor }}>
            {formatHours(project.totalTime)}
          </span>
        </div>

        <p className="font-body text-xs text-on-surface/50 mb-4 line-clamp-2 leading-relaxed">
          {project.description || 'No description.'}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-on-surface/35">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-body text-[0.7rem]">{formatHours(project.totalTime)} tracked</span>
          </div>
          {project.startDate && (
            <span className="font-body text-[0.7rem] text-on-surface/35">
              {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(project._id); }}
              className="font-body text-[0.7rem] text-red-400/50 hover:text-red-500 transition-colors cursor-pointer"
            >
              Delete
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
