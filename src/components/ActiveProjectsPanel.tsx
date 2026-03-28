import { useNavigate } from 'react-router-dom';
import type { Project } from '../types/index.ts';

interface ActiveProjectsPanelProps {
  projects: Project[];
}

export default function ActiveProjectsPanel({ projects }: ActiveProjectsPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-on-surface rounded-2xl p-5 flex flex-col h-fit">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-display text-base font-bold text-white">Projects</h3>
        {projects.length > 0 && (
          <button
            onClick={() => navigate('/projects')}
            className="font-body text-[0.7rem] text-primary/70 hover:text-primary transition-colors cursor-pointer"
          >
            View all
          </button>
        )}
      </div>

      {/* Project list */}
      <div className="flex flex-col gap-4 flex-1 mb-5">
        {projects.length === 0 ? (
          <div className="py-6 text-center">
            <p className="font-body text-sm text-white/25 leading-relaxed">
              No projects yet.
            </p>
            <button
              onClick={() => navigate('/projects')}
              className="mt-3 font-body text-xs text-primary hover:text-primary/80 transition-colors cursor-pointer"
            >
              Create your first →
            </button>
          </div>
        ) : (
          projects.slice(0, 5).map((project) => (
            <div
              key={project.id}
              onClick={() => navigate(`/projects/${project.id}`)}
              className="cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-body text-xs font-medium text-white/75 truncate mr-2 group-hover:text-white transition-colors">
                  {project.title}
                </span>
                <span className="font-body text-[0.65rem] text-primary shrink-0 font-semibold">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.max(project.progress, 0)}%` }}
                />
              </div>
              <p className="font-body text-[0.6rem] text-white/25 mt-1.5">
                {project.timeSpent} hrs &middot; {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          ))
        )}
      </div>

      {/* CTA */}
      <button
        onClick={() => navigate('/sessions')}
        className="w-full py-2.5 rounded-xl bg-primary text-white font-body text-sm font-semibold
          flex items-center justify-center gap-2 hover:bg-primary-container
          transition-all duration-200 cursor-pointer active:scale-[0.98]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Start Session
      </button>
    </div>
  );
}
