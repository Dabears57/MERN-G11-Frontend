import { useState, useEffect } from 'react';
import StatCard from '../components/StatCard.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import Button from '../components/Button.tsx';
import { useProjects } from '../hooks/useProjects.ts';
import { useTimer } from '../hooks/useTimer.ts';
import { MOCK_SESSIONS, computeSessionStats } from '../data/mock.ts';
import type { TaskTimeEntry } from '../types/index.ts';

function formatSeconds(s: number): string {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
}

type SessionMode  = 'list' | 'focus';
type TaskTimeState = Record<string, { accumulated: number; startedAt: number | null }>;

export default function SessionsPage() {
  const { projects, getProject, addTask } = useProjects();
  const { elapsed, isRunning, formattedTime, start, pause, reset } = useTimer();

  const [mode,               setMode]               = useState<SessionMode>('list');
  const [showProjectPicker,  setShowProjectPicker]  = useState(false);
  const [pickerProjectId,    setPickerProjectId]    = useState(projects[0]?.id ?? '');
  const [activeProjectId,    setActiveProjectId]    = useState('');
  const [taskTimes,          setTaskTimes]          = useState<TaskTimeState>({});
  const [activeTaskId,       setActiveTaskId]       = useState<string | null>(null);
  const [showSummary,        setShowSummary]        = useState(false);
  const [summaryElapsed,     setSummaryElapsed]     = useState(0);
  const [summaryData,        setSummaryData]        = useState<TaskTimeEntry[]>([]);
  const [showAddTask,        setShowAddTask]        = useState(false);
  const [newTaskName,        setNewTaskName]        = useState('');
  const [newTaskDesc,        setNewTaskDesc]        = useState('');

  const activeProject  = getProject(activeProjectId);
  const sessionStats   = computeSessionStats(MOCK_SESSIONS);

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
    const project  = getProject(activeProjectId);
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
    setNewTaskName('');
    setNewTaskDesc('');
    setShowAddTask(false);
  }

  // Initialize timer state for any newly added tasks in focus mode
  useEffect(() => {
    if (mode !== 'focus' || !activeProject) return;
    const hasNew = activeProject.tasks.some((t) => !(t.id in taskTimes));
    if (!hasNew) return;
    setTaskTimes((prev) => {
      const next = { ...prev };
      for (const task of activeProject.tasks) {
        if (!(task.id in next)) next[task.id] = { accumulated: 0, startedAt: null };
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
      {/* ── Sessions list view ── */}
      <div className={mode === 'focus' ? 'invisible pointer-events-none' : 'animate-fade-up'}>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-[2.75rem] font-bold text-on-surface leading-tight">Sessions</h1>
            <p className="font-body text-sm text-on-surface/40 mt-1.5">
              Track your focus time, one session at a time.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <Button onClick={openProjectPicker} disabled={projects.length === 0}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              Start Session
            </Button>
            {projects.length === 0 && (
              <p className="font-body text-xs text-on-surface/35">Create a project first</p>
            )}
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-8 stagger-1 animate-fade-up">
          {sessionStats.map((stat) => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>

        {/* Session log */}
        <div className="stagger-2 animate-fade-up">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold text-on-surface">Recent Sessions</h2>
            <span className="font-body text-xs text-on-surface/35 uppercase tracking-wide">Last 30 days</span>
          </div>

          {MOCK_SESSIONS.length > 0 ? (
            <div className="flex flex-col gap-2">
              {MOCK_SESSIONS.map((session, i) => (
                <SessionLogItem key={session.id} session={session} index={i} />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-low rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-surface-container mx-auto mb-4 flex items-center justify-center">
                <svg className="text-on-surface/20" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                  <circle cx="12" cy="13" r="8" />
                  <polyline points="12 9 12 13 15 15" />
                  <path d="M9 3h6" /><line x1="12" y1="3" x2="12" y2="5" />
                </svg>
              </div>
              <p className="font-body text-sm text-on-surface/40 leading-relaxed">
                No sessions recorded yet.<br />Start your first session above.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Focus mode overlay ── */}
      {mode === 'focus' && (
        <div className="fixed inset-0 z-[60] bg-on-surface flex flex-col animate-fade-in">
          {/* Top bar */}
          <div className="px-8 pt-5 pb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              <p className="font-display text-sm font-bold text-white/80">{activeProject?.title ?? 'Session'}</p>
            </div>
            <span className="font-body text-[0.6rem] text-white/25 uppercase tracking-[0.12em]">
              Focus Mode
            </span>
          </div>
          <div className="mx-8 h-px bg-white/6" />

          {/* Timer */}
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-8">
            {/* Status */}
            <div className="h-5 flex items-center">
              {isRunning ? (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
                  <span className="font-body text-xs tracking-[0.12em] text-primary uppercase">Live</span>
                </div>
              ) : (
                <span className="font-body text-xs tracking-[0.12em] text-white/25 uppercase">Paused</span>
              )}
            </div>

            {/* Big clock */}
            <p
              className="font-display font-bold text-white leading-none tabular-nums"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 7.5rem)' }}
            >
              {formattedTime}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={isRunning ? handlePauseSession : start}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-body text-sm font-medium
                  bg-white/8 text-white/70 hover:bg-white/14 hover:text-white
                  transition-all duration-150 cursor-pointer border border-white/10"
              >
                {isRunning ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                    </svg>
                    Pause
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                    Resume
                  </>
                )}
              </button>
              <button
                onClick={handleEndSession}
                className="flex items-center gap-2 rounded-xl px-5 py-2.5 font-body text-sm font-medium
                  bg-red-500/12 text-red-400 hover:bg-red-500/20 hover:text-red-300
                  transition-all duration-150 cursor-pointer border border-red-500/15"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
                End Session
              </button>
            </div>
          </div>

          {/* Tasks panel */}
          <div className="px-8 pb-8 w-full max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-[0.6rem] uppercase tracking-[0.12em] text-white/25">Tasks</p>
              <button
                onClick={() => setShowAddTask((v) => !v)}
                className="font-body text-xs text-primary/60 hover:text-primary
                  transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Task
              </button>
            </div>

            {showAddTask && (
              <form onSubmit={handleAddTaskInFocus} className="mb-3 bg-white/5 rounded-xl px-4 py-4 flex flex-col gap-3">
                <input
                  autoFocus
                  placeholder="Task name"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="bg-white/8 rounded-lg px-4 py-2.5 font-body text-sm text-white
                    placeholder:text-white/25 outline-none ring-2 ring-transparent
                    focus:ring-primary/40 transition-all w-full"
                />
                <input
                  placeholder="Description (optional)"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  className="bg-white/8 rounded-lg px-4 py-2.5 font-body text-sm text-white
                    placeholder:text-white/25 outline-none ring-2 ring-transparent
                    focus:ring-primary/40 transition-all w-full"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!newTaskName.trim()}
                    className="rounded-lg px-4 py-2 font-body text-xs font-semibold cursor-pointer
                      bg-primary text-white hover:bg-primary-container transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowAddTask(false); setNewTaskName(''); setNewTaskDesc(''); }}
                    className="rounded-lg px-4 py-2 font-body text-xs text-white/40
                      hover:text-white/70 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {activeProject && activeProject.tasks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {activeProject.tasks.map((task) => {
                  const isActive    = activeTaskId === task.id;
                  const taskElapsed = getTaskElapsed(task.id);
                  return (
                    <div
                      key={task.id}
                      className={`flex items-center justify-between rounded-xl px-4 py-3.5 transition-all duration-200 ${
                        isActive ? 'bg-primary/18 ring-1 ring-primary/30' : 'bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot shrink-0" />}
                        <div className="min-w-0">
                          <p className={`font-body text-sm font-medium truncate ${isActive ? 'text-white' : 'text-white/60'}`}>
                            {task.name}
                          </p>
                          {task.description && (
                            <p className="font-body text-xs text-white/25 mt-0.5 truncate">{task.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="font-body text-sm text-primary/70 tabular-nums min-w-[4.5rem] text-right">
                          {formatSeconds(taskElapsed)}
                        </span>
                        {isActive ? (
                          <button
                            onClick={handleStopTask}
                            className="rounded-lg px-3 py-1.5 font-body text-xs cursor-pointer
                              bg-white/8 text-white/50 hover:bg-white/14 hover:text-white/80 transition-all"
                          >
                            Stop
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStartTask(task.id)}
                            className="rounded-lg px-3 py-1.5 font-body text-xs cursor-pointer
                              bg-primary/20 text-primary hover:bg-primary/30 transition-all"
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
              <div className="bg-white/4 rounded-xl px-4 py-5 text-center">
                <p className="font-body text-sm text-white/25">
                  No tasks yet — add one above to track time per task.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* ── Project picker modal ── */}
      {showProjectPicker && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="picker-title">
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" onClick={() => setShowProjectPicker(false)} />
          <div className="relative bg-surface/92 backdrop-blur-[24px] rounded-2xl p-7 w-full max-w-sm
            shadow-[0_24px_48px_rgba(26,28,28,0.14)] animate-scale-in">
            <h2 id="picker-title" className="font-display text-xl font-bold text-on-surface mb-1">Choose Project</h2>
            <p className="font-body text-sm text-on-surface/45 mb-5">Select the project for this session</p>

            <div className="flex flex-col gap-1.5 mb-6 max-h-60 overflow-y-auto">
              {projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPickerProjectId(p.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-body text-sm font-medium
                    transition-all duration-150 cursor-pointer ${
                      pickerProjectId === p.id
                        ? 'bg-primary/12 text-primary ring-1 ring-primary/25'
                        : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                    }`}
                >
                  {p.title}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              <Button onClick={handleBeginSession} disabled={!pickerProjectId}>Begin Session</Button>
              <Button variant="ghost" onClick={() => setShowProjectPicker(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* ── Session summary modal ── */}
      {showSummary && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-on-surface/70 backdrop-blur-sm animate-fade-in" role="dialog" aria-modal="true" aria-labelledby="summary-title">
          <div className="bg-surface rounded-2xl p-7 w-full max-w-md shadow-[0_24px_60px_rgba(26,28,28,0.24)] animate-scale-in">
            <p className="font-body text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-primary mb-1">Complete</p>
            <h2 id="summary-title" className="font-display text-xl font-bold text-on-surface mb-1">Session Complete</h2>
            <p className="font-display text-[3rem] font-bold text-on-surface leading-none mb-6 tabular-nums">
              {formatSeconds(summaryElapsed)}
            </p>

            <div className="h-px bg-surface-container-highest mb-5" />

            <p className="font-body text-[0.65rem] font-semibold uppercase tracking-[0.1em] text-on-surface/40 mb-3">
              Time per task
            </p>
            <div className="flex flex-col gap-2.5 mb-6">
              {summaryData.length > 0 ? (
                summaryData.map((entry) => (
                  <div key={entry.taskId} className="flex items-center justify-between">
                    <span className="font-body text-sm text-on-surface">{entry.taskName}</span>
                    <span className="font-body text-sm text-primary font-semibold tabular-nums">
                      {formatSeconds(entry.accumulated)}
                    </span>
                  </div>
                ))
              ) : (
                <p className="font-body text-sm text-on-surface/35">No tasks were tracked.</p>
              )}
            </div>

            <Button fullWidth onClick={handleDone}>Done</Button>
          </div>
        </div>
      )}
    </>
  );
}
