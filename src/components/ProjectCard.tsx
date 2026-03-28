import { useNavigate } from 'react-router-dom';
import type { Project } from '../types/index.ts';

// Cycle through a set of top-accent colors based on project index
const ACCENT_COLORS = [
  '#004d44', // primary
  '#0e4675', // tertiary
  '#5a6e52', // muted forest
  '#7a5a3e', // warm earth
];

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const navigate     = useNavigate();
  const accentColor  = ACCENT_COLORS[index % ACCENT_COLORS.length];
  const completedTasks = project.tasks.filter((t) => !!t.finishedDate).length;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => navigate(`/projects/${project.id}`)}
      onKeyDown={(e) => e.key === 'Enter' && navigate(`/projects/${project.id}`)}
      className="group relative bg-surface-container-low rounded-2xl overflow-hidden
        hover:bg-surface-container transition-all duration-200 cursor-pointer
        hover:shadow-[0_6px_24px_rgba(26,28,28,0.07)] focus-visible:outline-2
        focus-visible:outline-primary focus-visible:outline-offset-2"
      aria-label={`Project: ${project.title}`}
    >
      {/* Top accent strip */}
      <div className="h-1 w-full" style={{ backgroundColor: accentColor }} />

      <div className="p-5">
        {/* Title + progress % */}
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-display text-base font-bold text-on-surface group-hover:text-primary
            transition-colors duration-200 leading-snug pr-2">
            {project.title}
          </h3>
          <span
            className="font-body text-xs font-semibold shrink-0 mt-0.5"
            style={{ color: accentColor }}
          >
            {project.progress}%
          </span>
        </div>

        <p className="font-body text-xs text-on-surface/50 mb-4 line-clamp-2 leading-relaxed">
          {project.description || 'No description.'}
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 rounded-full bg-surface-container-highest mb-4 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.max(project.progress, 0)}%`,
              backgroundColor: accentColor,
            }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-on-surface/35">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="font-body text-[0.7rem]">{project.timeSpent} hrs</span>
          </div>
          <div className="flex items-center gap-1.5 text-on-surface/35">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
            <span className="font-body text-[0.7rem]">
              {completedTasks}/{project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}
