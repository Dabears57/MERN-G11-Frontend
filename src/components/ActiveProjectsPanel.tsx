import { useNavigate } from 'react-router-dom';
import type { Project } from '../types/index.ts';

interface ActiveProjectsPanelProps {
  projects: Project[];
}

export default function ActiveProjectsPanel({ projects }: ActiveProjectsPanelProps) {
  const navigate = useNavigate();

  return (
    <div className="bg-on-surface rounded-xl p-6 text-on-primary flex flex-col h-fit">
      <div className="flex items-center gap-2 mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-primary" />
        <h3 className="font-display text-[1.125rem] font-bold text-on-primary">Active Projects</h3>
      </div>

      <div className="flex flex-col gap-5 flex-1 mb-6">
        {projects.length === 0 ? (
          <p className="font-body text-sm text-on-primary/30 text-center py-6">
            No projects yet.
          </p>
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="cursor-pointer"
              onClick={() => navigate(`/projects/${project.id}`)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-body text-sm font-medium text-on-primary/90 truncate mr-2">
                  {project.title}
                </span>
                <span className="font-body text-xs text-primary shrink-0 font-semibold">
                  {project.progress}%
                </span>
              </div>
              <div className="w-full h-1 rounded-full bg-on-primary/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${Math.max(project.progress, 0)}%` }}
                />
              </div>
              <p className="font-body text-[0.65rem] text-on-primary/30 mt-1.5">
                {project.timeSpent} hrs &middot; {project.tasks.length} task{project.tasks.length !== 1 ? 's' : ''}
              </p>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => navigate('/sessions')}
        className="w-full py-3 rounded-xl bg-gradient-to-br from-primary to-primary-container
          text-on-primary font-body text-sm font-semibold flex items-center justify-center gap-2
          hover:brightness-110 transition-all cursor-pointer"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3" />
        </svg>
        Start New Session
      </button>
    </div>
  );
}
