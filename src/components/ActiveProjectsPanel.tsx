import { useNavigate } from 'react-router-dom';
import type { ApiProject } from '../types/index.ts';

interface ActiveProjectsPanelProps {
  projects: ApiProject[];
  loading?: boolean;
}

function formatHours(secs: number): string {
  const h = secs / 3600;
  return h < 0.1 ? '0h' : `${h.toFixed(1)}h`;
}

export default function ActiveProjectsPanel({ projects, loading }: ActiveProjectsPanelProps) {
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
        {loading ? (
          [1, 2].map((i) => (
            <div key={i} className="h-10 rounded-lg bg-white/8 animate-pulse" />
          ))
        ) : projects.length === 0 ? (
          <div className="py-6 text-center">
            <p className="font-body text-sm text-white/25 leading-relaxed">No projects yet.</p>
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
              key={project._id}
              onClick={() => navigate(`/projects/${project._id}`)}
              className="cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-body text-xs font-medium text-white/75 truncate mr-2 group-hover:text-white transition-colors">
                  {project.title}
                </span>
                <span className="font-body text-[0.65rem] text-primary shrink-0 font-semibold">
                  {formatHours(project.totalTime)}
                </span>
              </div>
              {project.startDate && (
                <p className="font-body text-[0.6rem] text-white/25">
                  Started {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              )}
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
