import { useNavigate } from 'react-router-dom';
import type { Project } from '../types/index.ts';

interface ProjectCardProps {
  project: Project;
}

export default function ProjectCard({ project }: ProjectCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/projects/${project.id}`)}
      className="group bg-surface-container-low rounded-xl p-6 hover:bg-surface-container
        transition-all duration-200 cursor-pointer
        hover:shadow-[0px_8px_24px_rgba(26,28,28,0.06)]"
    >
      {/* Title row */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-display text-[1.125rem] font-bold text-on-surface group-hover:text-primary
          transition-colors duration-200 leading-snug">
          {project.title}
        </h3>
        <span className="font-body text-xs text-primary font-semibold ml-3 shrink-0 mt-0.5">
          {project.progress}%
        </span>
      </div>

      <p className="font-body text-sm text-on-surface/55 mb-5 line-clamp-2 leading-relaxed">
        {project.description || 'No description.'}
      </p>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full bg-surface-container-highest mb-5 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${Math.max(project.progress, 0)}%` }}
        />
      </div>

      {/* Footer meta */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-on-surface/40">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <span className="font-body text-xs">{project.timeSpent} hrs tracked</span>
        </div>
        <div className="flex items-center gap-1.5 text-on-surface/40">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          <span className="font-body text-xs">
            {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>
    </div>
  );
}
