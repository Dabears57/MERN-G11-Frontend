import { useState, useEffect, useCallback } from 'react';
import StatCard from '../components/StatCard.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import Button from '../components/Button.tsx';
import { useTimer } from '../hooks/useTimer.ts';
import { listSessions } from '../api/queries.ts';
import { fetchProjects } from '../api/projects.ts';
import { fetchTasksForProject, createTask } from '../api/tasks.ts';
import { fetchNotesFor, createNote, deleteNote } from '../api/notes.ts';
import {
  createSession,
  startSession,
  pauseSession,
  stopSession,
  getSessionStatus,
  addTaskToSession,
  removeTaskFromSession,
} from '../api/sessions.ts';
import { computeSessionStats } from '../data/mock.ts';
import type { ApiProject, ApiTask, ApiNote, SessionMetadata } from '../types/index.ts';

function formatSeconds(s: number): string {
  const h   = Math.floor(s / 3600);
  const m   = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}m`;
  return `${m}m ${sec.toString().padStart(2, '0')}s`;
}

type SessionMode = 'list' | 'focus';

export default function SessionsPage() {
  const { elapsed, isRunning, formattedTime, start, pause, reset, syncElapsed } = useTimer();

  // list-view state
  const [mode,           setMode]           = useState<SessionMode>('list');
  const [sessions,       setSessions]       = useState<SessionMetadata[]>([]);
  const [projects,       setProjects]       = useState<ApiProject[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  // project picker
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [pickerProjectId,   setPickerProjectId]   = useState('');

  // focus-mode state
  const [activeProjectId,  setActiveProjectId]  = useState('');
  const [activeProject,    setActiveProject]    = useState<ApiProject | null>(null);
  const [activeSessionId,  setActiveSessionId]  = useState(''); // track session _id for notes
  const [tasks,            setTasks]            = useState<ApiTask[]>([]);
  const [activeTaskId,     setActiveTaskId]     = useState<string | null>(null);

  // local per-task display timers (for UX only — backend is authoritative)
  const [taskTimers, setTaskTimers] = useState<Record<string, { accumulated: number; startedAt: number | null }>>({});

  // add-task in focus
  const [showAddTask,  setShowAddTask]  = useState(false);
  const [newTaskName,  setNewTaskName]  = useState('');
  const [newTaskDesc,  setNewTaskDesc]  = useState('');

  // session notes in focus mode
  const [sessionNotes,     setSessionNotes]     = useState<ApiNote[]>([]);
  const [showNoteForm,     setShowNoteForm]     = useState(false);
  const [newNoteContent,   setNewNoteContent]   = useState('');
  const [noteSaving,       setNoteSaving]       = useState(false);

  // summary
  const [showSummary,    setShowSummary]    = useState(false);
  const [summaryElapsed, setSummaryElapsed] = useState(0);

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    const res = await listSessions();
    setSessions(res.data ?? []);
    setLoadingSessions(false);
  }, []);

  const loadProjects = useCallback(async () => {
    const res = await fetchProjects();
    const list = res.data ?? [];
    setProjects(list);
    if (list.length > 0 && !pickerProjectId) setPickerProjectId(list[0]._id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // On mount: load data + check for existing active session
  useEffect(() => {
    loadSessions();
    loadProjects();
    checkActiveSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkActiveSession() {
    const res = await getSessionStatus();
    if (!res.data) return;
    const status = res.data;

    if (status.status === 'in-progress' || status.status === 'paused') {
      const session = status.all;
      if (!session) return;

      // Restore focus mode
      const projRes = await fetchProjects();
      const proj = (projRes.data ?? []).find((p) => p._id === session.projectId.toString());
      if (!proj) return;

      setActiveProjectId(session.projectId.toString());
      setActiveProject(proj);
      setActiveSessionId(session._id); // restore session id so notes work

      const taskRes = await fetchTasksForProject(session.projectId.toString());
      setTasks(taskRes.data ?? []);

      // Seed local task timers from backend task times
      const timers: Record<string, { accumulated: number; startedAt: number | null }> = {};
      for (const t of session.tasks ?? []) {
        timers[t.taskId.toString()] = { accumulated: t.totalTime, startedAt: null };
      }
      setTaskTimers(timers);

      // Load existing session notes
      const notesRes = await fetchNotesFor('session', session._id);
      setSessionNotes(notesRes.data ?? []);

      syncElapsed(status.timeElapsedSecs);
      setMode('focus');

      if (status.status === 'in-progress') {
        start();
        // Restart active tasks display timer
        const runningTask = (session.tasks ?? []).find((t) => !t.paused);
        if (runningTask) setActiveTaskId(runningTask.taskId.toString());
      }
    }
  }

  async function handleBeginSession() {
    if (!pickerProjectId) return;
    const createRes = await createSession(pickerProjectId);
    if (createRes.error) return;

    const startRes = await startSession();
    if (startRes.error) return;

    // capture the new session's _id from the status response so we can attach notes
    const statusRes = await getSessionStatus();
    setActiveSessionId(statusRes.data?.all?._id ?? '');

    const proj = projects.find((p) => p._id === pickerProjectId) ?? null;
    setActiveProjectId(pickerProjectId);
    setActiveProject(proj);

    const taskRes = await fetchTasksForProject(pickerProjectId);
    setTasks(taskRes.data ?? []);
    setTaskTimers({});
    setActiveTaskId(null);
    setSessionNotes([]);
    setShowProjectPicker(false);
    setMode('focus');
    reset(0);
    start();
  }

  async function handlePauseSession() {
    pause();
    if (activeTaskId) stopTaskTimerLocally(activeTaskId);
    setActiveTaskId(null);
    await pauseSession();
  }

  async function handleResumeSession() {
    await startSession();
    start();
  }

  async function handleEndSession() {
    pause();
    if (activeTaskId) stopTaskTimerLocally(activeTaskId);
    const finalElapsed = elapsed;
    await stopSession();
    setSummaryElapsed(finalElapsed);
    setShowSummary(true);
  }

  async function handleDone() {
    setShowSummary(false);
    setMode('list');
    reset(0);
    setActiveProjectId('');
    setActiveProject(null);
    setActiveSessionId('');
    setTasks([]);
    setTaskTimers({});
    setActiveTaskId(null);
    setSessionNotes([]);
    loadSessions();
  }

  // ── Task operations ──────────────────────────────────────────────────────────

  function stopTaskTimerLocally(taskId: string) {
    const now = Date.now();
    setTaskTimers((prev) => {
      const entry = prev[taskId];
      if (!entry || entry.startedAt === null) return prev;
      return {
        ...prev,
        [taskId]: {
          accumulated: entry.accumulated + Math.floor((now - entry.startedAt) / 1000),
          startedAt: null,
        },
      };
    });
  }

  async function handleStartTask(taskId: string) {
    // Stop current task locally
    if (activeTaskId && activeTaskId !== taskId) {
      stopTaskTimerLocally(activeTaskId);
      await removeTaskFromSession(activeTaskId);
    }
    // Start new task
    setTaskTimers((prev) => ({
      ...prev,
      [taskId]: { accumulated: prev[taskId]?.accumulated ?? 0, startedAt: Date.now() },
    }));
    setActiveTaskId(taskId);
    await addTaskToSession(taskId);
    if (!isRunning) {
      await startSession();
      start();
    }
  }

  async function handleStopTask() {
    if (!activeTaskId) return;
    stopTaskTimerLocally(activeTaskId);
    await removeTaskFromSession(activeTaskId);
    setActiveTaskId(null);
  }

  function getTaskElapsed(taskId: string): number {
    const entry = taskTimers[taskId];
    if (!entry) return 0;
    if (entry.startedAt !== null) {
      return entry.accumulated + Math.floor((Date.now() - entry.startedAt) / 1000);
    }
    return entry.accumulated;
  }

  async function handleAddTaskInFocus(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskName.trim() || !activeProjectId) return;
    const res = await createTask(activeProjectId, newTaskName.trim(), newTaskDesc.trim());
    if (res.error) return;
    setNewTaskName('');
    setNewTaskDesc('');
    setShowAddTask(false);

    // Reload tasks from the server — the createTask endpoint returns the task document
    // after a backend fix, but we reload anyway as the safest approach.
    const taskRes = await fetchTasksForProject(activeProjectId);
    if (!taskRes.error && taskRes.data) {
      setTasks(taskRes.data);
      // Seed timer entry for any tasks not yet tracked
      setTaskTimers((prev) => {
        const next = { ...prev };
        for (const t of taskRes.data!) {
          if (!next[t._id]) next[t._id] = { accumulated: 0, startedAt: null };
        }
        return next;
      });
    }
  }

  // ── Session notes ────────────────────────────────────────────────────────────

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteContent.trim() || !activeSessionId) return;
    setNoteSaving(true);
    const res = await createNote(newNoteContent.trim(), 'session', activeSessionId);
    setNoteSaving(false);
    if (res.error || !res.data) return;
    setSessionNotes((prev) => [...prev, res.data!]);
    setNewNoteContent('');
    setShowNoteForm(false);
  }

  async function handleDeleteNote(noteId: string) {
    await deleteNote(noteId);
    setSessionNotes((prev) => prev.filter((n) => n._id !== noteId));
  }

  // ── Misc ─────────────────────────────────────────────────────────────────────

  function openProjectPicker() {
    if (projects.length > 0) setPickerProjectId(projects[0]._id);
    setShowProjectPicker(true);
  }

  const sessionStats = computeSessionStats(sessions);
  // Filter out active sessions from the log (they have no endDate)
  const completedSessions = sessions.filter((s) => !!s.endDate);

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

          {loadingSessions ? (
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-16 rounded-2xl bg-surface-container-low animate-pulse" />)}
            </div>
          ) : completedSessions.length > 0 ? (
            <div className="flex flex-col gap-2">
              {completedSessions.slice().reverse().map((session, i) => (
                // linkable so users can click through to the session detail / notes page
                <SessionLogItem key={session._id} session={session} index={i} linkable />
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
        <div className="fixed inset-0 z-[60] bg-on-surface flex flex-col animate-fade-in overflow-y-auto">
          {/* Top bar */}
          <div className="px-8 pt-5 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              <p className="font-display text-sm font-bold text-white/80">{activeProject?.title ?? 'Session'}</p>
            </div>
            <span className="font-body text-[0.6rem] text-white/25 uppercase tracking-[0.12em]">Focus Mode</span>
          </div>
          <div className="mx-8 h-px bg-white/6 shrink-0" />

          {/* Timer */}
          <div className="flex flex-col items-center justify-center gap-5 px-8 py-12">
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

            <p
              className="font-display font-bold text-white leading-none tabular-nums"
              style={{ fontSize: 'clamp(3.5rem, 11vw, 7.5rem)' }}
            >
              {formattedTime}
            </p>

            <div className="flex items-center gap-3 mt-1">
              <button
                onClick={isRunning ? handlePauseSession : handleResumeSession}
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
          <div className="px-8 pb-6 w-full max-w-2xl mx-auto shrink-0">
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

            {tasks.length > 0 ? (
              <div className="flex flex-col gap-2">
                {tasks.map((task) => {
                  const isActive    = activeTaskId === task._id;
                  const taskElapsed = getTaskElapsed(task._id);
                  return (
                    <div
                      key={task._id}
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
                            onClick={() => handleStartTask(task._id)}
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

          {/* Session notes panel */}
          <div className="px-8 pb-10 w-full max-w-2xl mx-auto shrink-0">
            <div className="h-px bg-white/6 mb-5" />
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-[0.6rem] uppercase tracking-[0.12em] text-white/25">Session Notes</p>
              <button
                onClick={() => setShowNoteForm((v) => !v)}
                className="font-body text-xs text-primary/60 hover:text-primary
                  transition-colors cursor-pointer flex items-center gap-1"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add Note
              </button>
            </div>

            {showNoteForm && (
              <form onSubmit={handleAddNote} className="mb-3 bg-white/5 rounded-xl px-4 py-4 flex flex-col gap-3">
                <textarea
                  autoFocus
                  placeholder="Write a note about this session…"
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  rows={3}
                  className="bg-white/8 rounded-lg px-4 py-2.5 font-body text-sm text-white
                    placeholder:text-white/25 outline-none ring-2 ring-transparent
                    focus:ring-primary/40 transition-all w-full resize-none"
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    disabled={!newNoteContent.trim() || noteSaving}
                    className="rounded-lg px-4 py-2 font-body text-xs font-semibold cursor-pointer
                      bg-primary text-white hover:bg-primary-container transition-all
                      disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
                  >
                    {noteSaving ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowNoteForm(false); setNewNoteContent(''); }}
                    className="rounded-lg px-4 py-2 font-body text-xs text-white/40
                      hover:text-white/70 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {sessionNotes.length > 0 ? (
              <div className="flex flex-col gap-2">
                {sessionNotes.map((note) => (
                  <div key={note._id} className="bg-white/5 rounded-xl px-4 py-3 flex items-start justify-between gap-3">
                    <p className="font-body text-sm text-white/70 leading-relaxed whitespace-pre-wrap flex-1 min-w-0">
                      {note.content}
                    </p>
                    <button
                      onClick={() => handleDeleteNote(note._id)}
                      className="shrink-0 text-white/20 hover:text-red-400 transition-colors cursor-pointer mt-0.5"
                      aria-label="Delete note"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                        <path d="M9 6V4h6v2" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : !showNoteForm ? (
              <div className="bg-white/4 rounded-xl px-4 py-5 text-center">
                <p className="font-body text-sm text-white/25">
                  No notes yet — jot something down above.
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
                  key={p._id}
                  onClick={() => setPickerProjectId(p._id)}
                  className={`w-full text-left px-4 py-3 rounded-xl font-body text-sm font-medium
                    transition-all duration-150 cursor-pointer ${
                      pickerProjectId === p._id
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
              {tasks.length > 0 ? (
                tasks.map((task) => {
                  const secs = getTaskElapsed(task._id);
                  return secs > 0 ? (
                    <div key={task._id} className="flex items-center justify-between">
                      <span className="font-body text-sm text-on-surface">{task.name}</span>
                      <span className="font-body text-sm text-primary font-semibold tabular-nums">
                        {formatSeconds(secs)}
                      </span>
                    </div>
                  ) : null;
                })
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
