import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import Button from '../components/Button.tsx';
import { useProjects } from '../hooks/useProjects.ts';
import { useTimer } from '../hooks/useTimer.ts';
import { MOCK_SESSIONS, computeSessionStats } from '../data/mock.ts';
import type { TaskTimeEntry } from '../types/index.ts';

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
}

type SessionMode = 'list' | 'focus';
type TaskTimeState = Record<string, { accumulated: number; startedAt: number | null }>;

export default function SessionsPage() {
  const { projects, getProject, addTask } = useProjects();
  const { elapsed, isRunning, formattedTime, start, pause, reset } = useTimer();

  const [mode, setMode] = useState<SessionMode>('list');
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [pickerProjectId, setPickerProjectId] = useState(projects[0]?.id ?? '');
  const [activeProjectId, setActiveProjectId] = useState('');
  const [taskTimes, setTaskTimes] = useState<TaskTimeState>({});
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryElapsed, setSummaryElapsed] = useState(0);
  const [summaryData, setSummaryData] = useState<TaskTimeEntry[]>([]);

  // Inline task creation in focus mode
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');

  const activeProject = getProject(activeProjectId);
  const sessionStats = computeSessionStats(MOCK_SESSIONS);

  function getTaskElapsed(taskId: string): number {
    const entry = taskTimes[taskId];
    if (!entry) return 0;
    if (entry.startedAt !== null) {
      return entry.accumulated + Math.floor((Date.now() - entry.startedAt) / 1000);
    }
    return entry.accumulated;
  }

  function handleStartTask(taskId: string) {
    const now = Date.now();
    setTaskTimes((prev) => {
      const next = { ...prev };
      if (activeTaskId !== null && next[activeTaskId]?.startedAt !== null) {
        next[activeTaskId] = {
          accumulated: next[activeTaskId].accumulated + Math.floor((now - next[activeTaskId].startedAt!) / 1000),
          startedAt: null,
        };
      }
      next[taskId] = { accumulated: next[taskId]?.accumulated ?? 0, startedAt: now };
      return next;
    });
    setActiveTaskId(taskId);
    if (!isRunning) start();
  }

  function handleStopTask() {
    if (activeTaskId === null) return;
    const now = Date.now();
    setTaskTimes((prev) => ({
      ...prev,
      [activeTaskId]: {
        accumulated: prev[activeTaskId].accumulated + Math.floor((now - prev[activeTaskId].startedAt!) / 1000),
        startedAt: null,
      },
    }));
    setActiveTaskId(null);
  }

  function handlePauseSession() {
    pause();
    handleStopTask();
  }

  function handleBeginSession() {
    if (!pickerProjectId) return;
    const project = getProject(pickerProjectId);
    const init: TaskTimeState = {};
    project?.tasks.forEach((t) => { init[t.id] = { accumulated: 0, startedAt: null }; });
    setActiveProjectId(pickerProjectId);
    setTaskTimes(init);
    setActiveTaskId(null);
    setShowProjectPicker(false);
    setMode('focus');
    start();
  }

  function handleEndSession() {
    pause();
    const now = Date.now();
    const finalTaskTimes = { ...taskTimes };
    if (activeTaskId && finalTaskTimes[activeTaskId]?.startedAt !== null) {
      finalTaskTimes[activeTaskId] = {
        accumulated: finalTaskTimes[activeTaskId].accumulated + Math.floor((now - finalTaskTimes[activeTaskId].startedAt!) / 1000),
        startedAt: null,
      };
    }
    const project = getProject(activeProjectId);
    const summary: TaskTimeEntry[] = project?.tasks.map((t) => ({
      taskId: t.id,
      taskName: t.name,
      accumulated: finalTaskTimes[t.id]?.accumulated ?? 0,
    })) ?? [];
    setSummaryElapsed(elapsed);
    setSummaryData(summary);
    setActiveTaskId(null);
    setShowSummary(true);
  }

  function handleDone() {
    setShowSummary(false);
    setMode('list');
    reset();
    setActiveProjectId('');
    setTaskTimes({});
    setActiveTaskId(null);
  }

  function handleAddTaskInFocus(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskName.trim()) return;
    addTask(activeProjectId, newTaskName.trim(), newTaskDesc.trim());
    // Also init timer entry for the new task (it will be added via re-render via useProjects)
    setNewTaskName('');
    setNewTaskDesc('');
    setShowAddTask(false);
  }

  // When a new task is added to the active project during focus mode,
  // initialize its timer entry so it appears in the summary correctly.
  useEffect(() => {
    if (mode !== 'focus' || !activeProject) return;
    const hasNew = activeProject.tasks.some((t) => !(t.id in taskTimes));
    if (!hasNew) return;
    setTaskTimes((prev) => {
      const next = { ...prev };
      for (const task of activeProject.tasks) {
        if (!(task.id in next)) {
          next[task.id] = { accumulated: 0, startedAt: null };
        }
      }
      return next;
    });
  }, [activeProject?.tasks.length, mode, activeProjectId]); // eslint-disable-line react-hooks/exhaustive-deps

  function openProjectPicker() {
    setPickerProjectId(projects[0]?.id ?? '');
    setShowProjectPicker(true);
  }

  return (
    <>
      {/* Sessions List */}
      <div className={mode === 'focus' ? 'invisible pointer-events-none' : ''}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-[3.5rem] font-bold text-on-surface leading-tight">Sessions</h1>
            <p className="font-body text-base text-on-surface/50 mt-1">
              Track your focus time, one session at a time.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Button onClick={openProjectPicker} disabled={projects.length === 0}>
              ▶ Start New Session
            </Button>
            {projects.length === 0 && (
              <p className="font-body text-xs text-on-surface/40">Create a project first</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-10">
          {sessionStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-[1.75rem] font-bold text-on-surface">Recent Sessions</h2>
            <span className="font-body text-xs text-on-surface/40 uppercase tracking-wide">Last 30 days</span>
          </div>
          {MOCK_SESSIONS.length > 0 ? (
            <div className="flex flex-col gap-3">
              {MOCK_SESSIONS.map((session, i) => (
                <SessionLogItem key={session.id} session={session} index={i} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center">
              <p className="font-body text-on-surface/50">No sessions yet. Start your first session above.</p>
            </div>
          )}
        </div>
      </div>

      {/* ─── FOCUS MODE OVERLAY ─── */}
      {mode === 'focus' && (
        <div className="fixed inset-0 z-[60] bg-on-surface flex flex-col">

          {/* Slim top bar — project name only */}
          <div className="px-8 pt-5 pb-3 flex items-center justify-between border-b border-on-primary/5">
            <p className="font-display text-base font-bold text-primary">{activeProject?.title ?? 'Session'}</p>
            <span className="font-body text-[0.65rem] text-on-primary/30 uppercase tracking-widest">
              Focus Mode
            </span>
          </div>

          {/* CENTER — timer + controls */}
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-8">
            {/* Live/Paused badge */}
            <div className="flex items-center gap-1.5">
              {isRunning ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="font-body text-xs tracking-widest text-primary uppercase">Live</span>
                </>
              ) : (
                <span className="font-body text-xs tracking-widest text-on-primary/30 uppercase">Paused</span>
              )}
            </div>

            {/* Big timer */}
            <p className="font-display font-bold text-on-primary leading-none tabular-nums"
              style={{ fontSize: 'clamp(3.5rem, 10vw, 7rem)' }}>
              {formattedTime}
            </p>

            {/* Controls — centered below timer */}
            <div className="flex items-center gap-3 mt-2">
              <button
                onClick={isRunning ? handlePauseSession : start}
                className="flex items-center gap-2 rounded-xl px-6 py-3 font-body text-sm font-medium
                  bg-on-primary/8 text-on-primary/80 hover:bg-on-primary/15 hover:text-on-primary
                  transition-all duration-150 cursor-pointer border border-on-primary/15"
              >
                {isRunning ? (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Resume
                  </>
                )}
              </button>
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 rounded-xl px-6 py-3 font-body text-sm font-medium
                  bg-red-500/10 text-red-400 hover:bg-red-500/20 hover:text-red-300
                  transition-all duration-150 cursor-pointer border border-red-500/20"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                End Session
              </button>
            </div>
          </div>

          {/* TASKS section */}
          <div className="px-8 pb-8 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-xs uppercase tracking-widest text-on-primary/40">Tasks</p>
              <button
                onClick={() => setShowAddTask((v) => !v)}
                className="font-body text-xs text-primary/70 hover:text-primary transition-colors cursor-pointer
                  flex items-center gap-1"
              >
                + Add Task
              </button>
            </div>

            {/* Inline add-task form */}
            {showAddTask && (
              <form onSubmit={handleAddTaskInFocus} className="mb-3 bg-on-primary/5 rounded-xl px-5 py-4 flex flex-col gap-3">
                <input
                  autoFocus
                  placeholder="Task name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="bg-on-primary/10 rounded-lg px-4 py-2.5 font-body text-sm text-on-primary
                    placeholder:text-on-primary/30 outline-none border-b-2 border-transparent
                    focus:border-primary transition-colors w-full"
                />
                <input
                  placeholder="Description (optional)"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="bg-on-primary/10 rounded-lg px-4 py-2.5 font-body text-sm text-on-primary
                    placeholder:text-on-primary/30 outline-none border-b-2 border-transparent
                    focus:border-primary transition-colors w-full"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!newTaskName.trim()}
                    className="rounded-lg px-4 py-2 font-body text-xs font-medium cursor-pointer
                      bg-primary text-on-primary hover:brightness-110 transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Add Task
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddTask(false); setNewTaskName(''); setNewTaskDesc(''); }}
                    className="rounded-lg px-4 py-2 font-body text-xs text-on-primary/50
                      hover:text-on-primary/80 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activeProject && activeProject.tasks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {activeProject.tasks.map((task) => {
                  const isActive = activeTaskId === task.id;
                  const taskElapsed = getTaskElapsed(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between rounded-xl px-5 py-4 transition-all duration-200 ${
                        isActive ? 'bg-primary/15 ring-1 ring-primary/30' : 'bg-on-primary/5'
                      }`}
                    >
                      <div>
                        <p className="font-body text-sm font-medium text-on-primary">{task.name}</p>
                        {task.description && (
                          <p className="font-body text-xs text-on-primary/40 mt-0.5">{task.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <span className="font-body text-sm text-primary/70 tabular-nums min-w-[4.5rem] text-right">
                          {formatSeconds(taskElapsed)}
                        </span>
                        {isActive ? (
                          <button
                            onClick={handleStopTask}
                            className="rounded-lg px-3 py-1.5 font-body text-xs cursor-pointer
                              bg-on-primary/10 text-on-primary/60 hover:bg-on-primary/20 transition-colors"
                          >
                            Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartTask(task.id)}
                            className="rounded-lg px-3 py-1.5 font-body text-xs cursor-pointer
                              bg-primary/20 text-primary hover:bg-primary/30 transition-colors"
                          >
                            Start
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : !showAddTask ? (
              <div className="bg-on-primary/5 rounded-xl px-5 py-5 text-center">
                <p className="font-body text-sm text-on-primary/30">
                  No tasks yet — add one above to start tracking.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* Project Picker Modal */}
      {showProjectPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
            onClick={() => setShowProjectPicker(false)}
          />
          <div className="relative bg-surface/90 backdrop-blur-[20px] rounded-2xl p-8 w-full max-w-sm
            shadow-[0px_24px_48px_rgba(26,28,28,0.12)]">
            <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-1">Choose a Project</h2>
            <p className="font-body text-sm text-on-surface/50 mb-6">Select the project for this session</p>

            <label className="font-body text-xs font-medium tracking-wide uppercase text-on-surface/70 mb-2 block">
              Project
            </label>
            <select
              value={pickerProjectId}
              onChange={(e) => setPickerProjectId(e.target.value)}
              className="bg-surface-container-lowest rounded-lg px-4 py-3 font-body text-base text-on-surface
                outline-none border-b-2 border-transparent focus:border-primary transition-colors w-full
                cursor-pointer mb-6"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>

            <div className="flex items-center gap-3">
              <Button onClick={handleBeginSession} disabled={!pickerProjectId}>
                Begin Session
              </Button>
              <Button variant="ghost" onClick={() => setShowProjectPicker(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Session Summary Modal */}
      {showSummary && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-on-surface/70 backdrop-blur-sm">
          <div className="bg-surface rounded-2xl p-8 w-full max-w-md
            shadow-[0px_24px_60px_rgba(26,28,28,0.24)]">
            <p className="font-body text-xs uppercase tracking-widest text-primary mb-1">Complete</p>
            <h2 className="font-display text-2xl font-bold text-on-surface mb-1">Session Complete</h2>
            <p className="font-display text-[3rem] font-bold text-on-surface leading-none mb-6">
              {formatSeconds(summaryElapsed)}
            </p>

            <div className="bg-surface-container-highest h-px mb-5" />

            <p className="font-body text-xs uppercase tracking-widest text-on-surface/50 mb-3">Time per task</p>
            <div className="flex flex-col gap-2.5 mb-6">
              {summaryData.length > 0 ? (
                summaryData.map((entry) => (
                  <div key={entry.taskId} className="flex items-center justify-between">
                    <span className="font-body text-sm font-medium text-on-surface">{entry.taskName}</span>
                    <span className="font-body text-sm text-primary tabular-nums">
                      {formatSeconds(entry.accumulated)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="font-body text-sm text-on-surface/40">No tasks were tracked.</p>
              )}
            </div>

            <Button variant="primary" fullWidth onClick={handleDone}>Done</Button>
          </div>
        </div>
      )}
    </>
  );
}
