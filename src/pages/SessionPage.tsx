import { useState } from 'react';
import Button from '../components/Button.tsx';
import { useProjects } from '../hooks/useProjects.ts';
import { useTimer } from '../hooks/useTimer.ts';

export default function SessionPage() {
  const { projects } = useProjects();
  const [selectedProjectId, setSelectedProjectId] = useState(projects[0]?.id ?? '');
  const { formattedTime, isRunning, start, pause, end } = useTimer();

  const selectedProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div>
      <h1 className="font-display text-[3.5rem] font-bold text-on-surface mb-8">Session</h1>

      <div className="max-w-2xl">
        <div className="mb-8">
          <label className="font-body text-xs font-medium tracking-wide uppercase text-on-surface/70 mb-2 block">
            Project
          </label>
          {projects.length === 0 ? (
            <div className="bg-surface-container-low rounded-lg px-4 py-3 text-center">
              <p className="font-body text-sm text-on-surface/50">
                No projects available. Create a project first.
              </p>
            </div>
          ) : (
            <select
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="bg-surface-container-lowest rounded-lg px-4 py-3 font-body text-base text-on-surface
                outline-none border-b-2 border-transparent focus:border-primary transition-colors w-full
                cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          )}
        </div>

        <div className="bg-surface/70 backdrop-blur-[20px] rounded-lg p-8 mb-8 text-center
          shadow-[0px_20px_40px_rgba(26,28,28,0.06)]">
          <p className="font-body text-xs text-on-surface/50 uppercase tracking-widest mb-2">Elapsed Time</p>
          <p className="font-display text-[3.5rem] font-bold text-on-surface">{formattedTime}</p>
          {selectedProject && (
            <p className="font-body text-sm text-on-surface/50 mt-2">{selectedProject.title}</p>
          )}
        </div>

        <div className="flex items-center gap-4 justify-center">
          {!isRunning ? (
            <Button onClick={start} disabled={projects.length === 0}>Start</Button>
          ) : (
            <Button variant="secondary" onClick={pause}>Pause</Button>
          )}
          <Button variant="ghost" onClick={end}>End Session</Button>
        </div>

        <div className="mt-10">
          <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-4">Tasks</h2>
          {selectedProject && selectedProject.tasks.length > 0 ? (
            <div className="flex flex-col gap-3">
              {selectedProject.tasks.map((task) => (
                <div key={task.id} className="bg-surface-container-low rounded-lg px-5 py-4">
                  <h3 className="font-body text-[1.125rem] font-semibold text-on-surface">{task.name}</h3>
                  <p className="font-body text-sm text-on-surface/60 mt-1">{task.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-lg p-8 text-center">
              <p className="font-body text-on-surface/50">
                {projects.length === 0
                  ? 'Create a project to see tasks here.'
                  : 'No tasks in this project yet.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
