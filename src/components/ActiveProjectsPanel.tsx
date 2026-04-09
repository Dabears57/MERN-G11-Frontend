import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import Button from './Button.tsx';
import type { ApiProject } from '../types/index.ts';

interface ActiveProjectsPanelProps {
  projects: ApiProject[];
  loading?: boolean;
}

function formatHours(secs: number): string {
  const h = secs / 3600;
  return h < 0.1 ? '0h' : `${h.toFixed(2)}h`;
}

export default function ActiveProjectsPanel({ projects, loading }: ActiveProjectsPanelProps) {
  const navigate = useNavigate();
  const [showPicker, setShowPicker] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  function openPicker() {
    if (projects.length > 0) setSelectedProjectId(projects[0]._id);
    setShowPicker(true);
  }

  function handleBeginSession() {
    if (!selectedProjectId) return;
    setShowPicker(false);
    navigate('/sessions', { state: { projectId: selectedProjectId } });
  }

  const modal = showPicker
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="dashboard-picker-title"
        >
          <div
            className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
            onClick={() => setShowPicker(false)}
          />
          <div
            className="relative bg-surface/92 backdrop-blur-[24px] rounded-2xl p-7 w-full max-w-sm
              shadow-[0_24px_48px_rgba(26,28,28,0.14)] animate-scale-in"
          >
            <h2
              id="dashboard-picker-title"
              className="font-display text-xl font-bold text-on-surface mb-1"
            >
              Choose Project
            </h2>
            <p className="font-body text-sm text-on-surface/45 mb-5">
              Select the project for this session
            </p>

            <div className="flex flex-col gap-1.5 mb-6 max-h-60 overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p._id}
                  onClick={() => setSelectedProjectId(p._id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-body text-sm font-medium
                    transition-all duration-150 cursor-pointer ${
                      selectedProjectId === p._id
                        ? 'bg-primary/12 text-primary ring-1 ring-primary/25'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                >
                  {p.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <Button onClick={handleBeginSession} disabled={!selectedProjectId}>
                Begin Session
              </Button>
              <Button variant="ghost" onClick={() => setShowPicker(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>,
        document.body,
      )
    : null;

  return (
    <>
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
                    Started{' '}
                    {new Date(project.startDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                )}
              </div>
            ))
          )}
        </div>

        {/* CTA */}
        <button
          onClick={openPicker}
          disabled={loading || projects.length === 0}
          className="w-full py-2.5 rounded-xl bg-primary text-white font-body text-sm font-semibold
            flex items-center justify-center gap-2 hover:bg-primary-container
            transition-all duration-200 cursor-pointer active:scale-[0.98]
            disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="5 3 19 12 5 21 5 3" />
          </svg>
          Start Session
        </button>
      </div>

      {modal}
    </>
  );
}
