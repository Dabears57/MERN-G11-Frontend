import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import StatCard from '../components/StatCard.tsx';
import SessionLogItem from '../components/SessionLogItem.tsx';
import Button from '../components/Button.tsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';
import { useTimer } from '../hooks/useTimer.ts';
import { saveSessionMeta, clearSessionMeta, formatElapsed } from '../hooks/useActiveSession.ts';
import { useActiveSessionContext } from '../contexts/ActiveSessionContext.tsx';
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
  const { refresh: refreshActiveSession } = useActiveSessionContext();
  const { elapsed, isRunning, formattedTime, start, pause, reset, syncElapsed } = useTimer();
  const location = useLocation();
  const autoStartProjectId = (location.state as { projectId?: string } | null)?.projectId ?? null;
  const autoStartHandled = useRef(false);

  // ── list-view state ───────────────────────────────────────────────────────
  const [mode,             setMode]             = useState<SessionMode>('list');
  const [sessions,         setSessions]         = useState<SessionMetadata[]>([]);
  const [projects,         setProjects]         = useState<ApiProject[]>([]);
  const [loadingSessions,  setLoadingSessions]  = useState(true);

  // project picker
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [pickerProjectId,   setPickerProjectId]   = useState('');

  // ── focus-mode state ──────────────────────────────────────────────────────
  const [activeProjectId,  setActiveProjectId]  = useState('');
  const [activeProject,    setActiveProject]    = useState<ApiProject | null>(null);
  const [activeSessionId,  setActiveSessionId]  = useState(''); // for notes attachment
  const [tasks,            setTasks]            = useState<ApiTask[]>([]);
  const [activeTaskId,     setActiveTaskId]     = useState<string | null>(null);

  // local per-task display timers (UX only — backend is authoritative)
  const [taskTimers, setTaskTimers] = useState<Record<string, { accumulated: number; startedAt: number | null }>>({});

  // add-task form
  const [showAddTask,  setShowAddTask]  = useState(false);
  const [newTaskName,  setNewTaskName]  = useState('');
  const [newTaskDesc,  setNewTaskDesc]  = useState('');

  // ── session notes state ───────────────────────────────────────────────────
  const [sessionNotes,   setSessionNotes]   = useState<ApiNote[]>([]);
  const [showNoteForm,   setShowNoteForm]   = useState(false);
  const [newNoteContent, setNewNoteContent] = useState('');
  const [noteSaving,     setNoteSaving]     = useState(false);

  // ── task notes state (focus mode) ────────────────────────────────────────
  const [taskNotes,         setTaskNotes]         = useState<Record<string, ApiNote[]>>({});
  const [expandedTaskId,    setExpandedTaskId]    = useState<string | null>(null);
  const [taskNoteFormOpen,  setTaskNoteFormOpen]  = useState(false);
  const [taskNoteContent,   setTaskNoteContent]   = useState('');
  const [taskNoteSaving,    setTaskNoteSaving]    = useState(false);

  // ── delete confirmations ─────────────────────────────────────────────────
  const [pendingNoteDelete, setPendingNoteDelete] = useState<
    | { type: 'session'; noteId: string }
    | { type: 'task'; noteId: string; taskId: string }
    | null
  >(null);

  // ── summary ───────────────────────────────────────────────────────────────
  const [showSummary,    setShowSummary]    = useState(false);
  const [summaryElapsed, setSummaryElapsed] = useState(0);

  // ── data loaders ──────────────────────────────────────────────────────────
  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    const res = await listSessions();
    setSessions(res.data ?? []);
    setLoadingSessions(false);
  }, []);

  const loadProjects = useCallback(async (): Promise<ApiProject[]> => {
    const res = await fetchProjects();
    const list = res.data ?? [];
    setProjects(list);
    if (list.length > 0 && !pickerProjectId) setPickerProjectId(list[0]._id);
    return list;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadSessions();
    loadProjects().then((loadedProjects) => {
      if (autoStartProjectId && !autoStartHandled.current) {
        autoStartHandled.current = true;
        // Navigate intent: always start fresh for the requested project
        beginSessionFor(autoStartProjectId, loadedProjects);
      } else {
        checkActiveSession();
      }
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function checkActiveSession(): Promise<boolean> {
    const res = await getSessionStatus();
    if (!res.data) return false;
    const status = res.data;

    if (status.status === 'in-progress' || status.status === 'paused') {
      const session = status.all;
      if (!session) return false;

      const projRes = await fetchProjects();
      const proj = (projRes.data ?? []).find((p) => p._id === session.projectId.toString());
      if (!proj) return false;

      setActiveProjectId(session.projectId.toString());
      setActiveProject(proj);
      setActiveSessionId(session._id);
      saveSessionMeta(session.projectId.toString(), proj.title);

      const taskRes = await fetchTasksForProject(session.projectId.toString());
      setTasks(taskRes.data ?? []);

      const timers: Record<string, { accumulated: number; startedAt: number | null }> = {};
      for (const t of session.tasks ?? []) {
        timers[t.taskId.toString()] = { accumulated: t.totalTime, startedAt: null };
      }
      setTaskTimers(timers);

      const notesRes = await fetchNotesFor('session', session._id);
      setSessionNotes(notesRes.data ?? []);

      syncElapsed(status.timeElapsedSecs);
      // Do NOT auto-open focus mode — user navigated to the Sessions tab and
      // should land on the list view. They can click "Focus Mode" to enter it.

      if (status.status === 'in-progress') {
        start();
        const runningTask = (session.tasks ?? []).find((t) => !t.paused);
        if (runningTask) setActiveTaskId(runningTask.taskId.toString());
      }
      return true;
    }
    return false;
  }

  async function beginSessionFor(projectId: string, projectsList: ApiProject[]) {
    // Stop any existing active/paused session before starting a new one
    const statusCheck = await getSessionStatus();
    if (statusCheck.data?.status === 'in-progress' || statusCheck.data?.status === 'paused') {
      await stopSession();
    }

    const createRes = await createSession(projectId);
    if (createRes.error) return;

    const startRes = await startSession();
    if (startRes.error) return;

    const statusRes = await getSessionStatus();
    setActiveSessionId(statusRes.data?.all?._id ?? '');

    const proj = projectsList.find((p) => p._id === projectId) ?? null;
    setActiveProjectId(projectId);
    setActiveProject(proj);

    // Persist project name for the floating widget on other pages
    if (proj) saveSessionMeta(projectId, proj.title);

    const taskRes = await fetchTasksForProject(projectId);
    setTasks(taskRes.data ?? []);
    setTaskTimers({});
    setActiveTaskId(null);
    setSessionNotes([]);
    setMode('focus');
    reset(0);
    start();
  }

  // ── session lifecycle ─────────────────────────────────────────────────────
  async function handleBeginSession() {
    if (!pickerProjectId) return;
    setShowProjectPicker(false);
    await beginSessionFor(pickerProjectId, projects);
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
    setTaskNotes({});
    setExpandedTaskId(null);
    setTaskNoteFormOpen(false);
    setTaskNoteContent('');
    clearSessionMeta();
    refreshActiveSession();
    loadSessions();
  }

  // ── task operations ───────────────────────────────────────────────────────
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
    if (activeTaskId && activeTaskId !== taskId) {
      stopTaskTimerLocally(activeTaskId);
      await removeTaskFromSession(activeTaskId);
    }
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
    // Reload tasks — safest regardless of backend response shape
    const taskRes = await fetchTasksForProject(activeProjectId);
    if (!taskRes.error && taskRes.data) {
      setTasks(taskRes.data);
      setTaskTimers((prev) => {
        const next = { ...prev };
        for (const t of taskRes.data!) {
          if (!next[t._id]) next[t._id] = { accumulated: 0, startedAt: null };
        }
        return next;
      });
    }
  }

  // ── session notes ─────────────────────────────────────────────────────────
  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!newNoteContent.trim() || !activeSessionId) return;
    setNoteSaving(true);
    const res = await createNote(newNoteContent.trim(), 'session', activeSessionId);
    // createNote backend returns insertOne result, not the note document.
    // Re-fetch so we display the actual persisted note with correct _id/createdAt.
    if (!res.error) {
      const notesRes = await fetchNotesFor('session', activeSessionId);
      setSessionNotes(notesRes.data ?? []);
      setNewNoteContent('');
      setShowNoteForm(false);
    }
    setNoteSaving(false);
  }

  function handleDeleteNote(noteId: string) {
    setPendingNoteDelete({ type: 'session', noteId });
  }

  // ── task notes (focus mode) ───────────────────────────────────────────────
  async function loadTaskNotes(taskId: string) {
    const res = await fetchNotesFor('task', taskId);
    if (!res.error && res.data) {
      setTaskNotes((prev) => ({ ...prev, [taskId]: res.data! }));
    }
  }

  function toggleTaskNotes(taskId: string) {
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
      setTaskNoteFormOpen(false);
      setTaskNoteContent('');
    } else {
      setExpandedTaskId(taskId);
      setTaskNoteFormOpen(false);
      setTaskNoteContent('');
      loadTaskNotes(taskId);
    }
  }

  async function handleAddTaskNote(e: React.FormEvent, taskId: string) {
    e.preventDefault();
    if (!taskNoteContent.trim()) return;
    setTaskNoteSaving(true);
    const res = await createNote(taskNoteContent.trim(), 'task', taskId);
    if (!res.error) {
      await loadTaskNotes(taskId);
      setTaskNoteContent('');
      setTaskNoteFormOpen(false);
    }
    setTaskNoteSaving(false);
  }

  function handleDeleteTaskNote(noteId: string, taskId: string) {
    setPendingNoteDelete({ type: 'task', noteId, taskId });
  }

  async function handleConfirmNoteDelete() {
    if (!pendingNoteDelete) return;
    if (pendingNoteDelete.type === 'session') {
      await deleteNote(pendingNoteDelete.noteId);
      setSessionNotes((prev) => prev.filter((n) => n._id !== pendingNoteDelete.noteId));
    } else {
      const { noteId, taskId } = pendingNoteDelete;
      await deleteNote(noteId);
      setTaskNotes((prev) => ({ ...prev, [taskId]: (prev[taskId] ?? []).filter((n) => n._id !== noteId) }));
    }
    setPendingNoteDelete(null);
  }

  // ── misc ──────────────────────────────────────────────────────────────────
  function openProjectPicker() {
    if (projects.length > 0) setPickerProjectId(projects[0]._id);
    setShowProjectPicker(true);
  }

  const sessionStats = computeSessionStats(sessions);
  const completedSessions = sessions.filter((s) => !!s.endDate);

  return (
    <>
      {/* ── Sessions list view ── */}
      <div className={mode === 'focus' ? 'invisible pointer-events-none' : 'animate-fade-up'}>

        {/* ── Current session card (shown when a session is active but focus mode is minimized) ── */}
        {activeProjectId && (
          <div className="mb-8 rounded-2xl overflow-hidden border border-primary/25"
            style={{ background: 'linear-gradient(135deg, rgba(0,77,68,0.13) 0%, rgba(0,77,68,0.06) 100%)' }}
          >
            <div className="px-6 py-5 flex items-center justify-between gap-4">
              {/* Left: indicator + info */}
              <div className="flex items-center gap-4 min-w-0">
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`w-2 h-2 rounded-full ${isRunning ? 'bg-primary animate-pulse-dot' : 'bg-on-surface/20'}`} />
                  <span className="font-body text-[0.6rem] font-semibold uppercase tracking-[0.12em] text-primary/60">
                    {isRunning ? 'Live' : 'Paused'}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-body text-xs text-on-surface/40 leading-none mb-0.5 truncate">
                    {activeProject?.title ?? 'Session'}
                  </p>
                  <p className="font-display text-2xl font-bold text-on-surface tabular-nums leading-none">
                    {formatElapsed(elapsed)}
                  </p>
                </div>
              </div>

              {/* Right: controls */}
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={isRunning ? handlePauseSession : handleResumeSession}
                  className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-body text-xs font-medium
                    bg-surface-container text-on-surface/60 hover:bg-surface-container-highest hover:text-on-surface
                    transition-all duration-150 cursor-pointer border border-on-surface/8"
                >
                  {isRunning ? (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                      </svg>
                      Pause
                    </>
                  ) : (
                    <>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                        <polygon points="5 3 19 12 5 21 5 3" />
                      </svg>
                      Resume
                    </>
                  )}
                </button>
                <button
                  onClick={() => setMode('focus')}
                  className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-body text-xs font-semibold
                    bg-primary text-white hover:bg-primary-container transition-all duration-150 cursor-pointer"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                  Focus Mode
                </button>
                <button
                  onClick={handleEndSession}
                  className="flex items-center gap-1.5 rounded-xl px-3.5 py-2 font-body text-xs font-medium
                    text-red-400/70 hover:text-red-500 hover:bg-red-500/8
                    transition-all duration-150 cursor-pointer"
                >
                  End
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-[2.75rem] font-bold text-on-surface leading-tight">Sessions</h1>
            <p className="font-body text-sm text-on-surface/40 mt-1.5">
              Track your focus time, one session at a time.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            {!activeProjectId && (
              <>
                <Button onClick={openProjectPicker} disabled={projects.length === 0}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <polygon points="5 3 19 12 5 21 5 3" />
                  </svg>
                  Start Session
                </Button>
                {projects.length === 0 && (
                  <p className="font-body text-xs text-on-surface/35">Create a project first</p>
                )}
              </>
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
                <SessionLogItem key={session._id} session={session} index={i} linkable from="/sessions" />
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
          <div className="px-8 pt-5 pb-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              <p className="font-display text-sm font-bold text-white/80">{activeProject?.title ?? 'Session'}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-body text-[0.6rem] text-white/25 uppercase tracking-[0.12em]">Focus Mode</span>
              <button
                onClick={() => setMode('list')}
                className="flex items-center gap-1.5 rounded-xl px-3 py-1.5
                  font-body text-xs text-white/40 hover:text-white/70
                  bg-white/5 hover:bg-white/10 transition-all duration-150 cursor-pointer"
                aria-label="Minimize focus mode"
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <polyline points="4 14 10 14 10 20" />
                  <polyline points="20 10 14 10 14 4" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                  <line x1="3" y1="21" x2="14" y2="10" />
                </svg>
                Minimize
              </button>
            </div>
          </div>
          <div className="mx-8 h-px bg-white/6 shrink-0" />

          {/* Timer strip */}
          <div className="flex flex-col items-center gap-4 px-8 py-8 shrink-0">
            <div className="h-4 flex items-center">
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
              style={{ fontSize: 'clamp(3rem, 9vw, 6.5rem)' }}
            >
              {formattedTime}
            </p>

            <div className="flex items-center gap-3">
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

          <div className="mx-8 h-px bg-white/6 shrink-0" />

          {/* Two-column panel: Tasks | Notes */}
          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-2 gap-0 h-full divide-x divide-white/6">

              {/* ── Left column: Tasks ─────────────────────────────────── */}
              <div className="flex flex-col min-h-0 px-6 py-5">
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <p className="font-body text-[0.6rem] uppercase tracking-[0.12em] text-white/30 font-semibold">Tasks</p>
                  <button
                    onClick={() => setShowAddTask((v) => !v)}
                    className="flex items-center gap-1 font-body text-xs text-primary/60 hover:text-primary transition-colors cursor-pointer"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Task
                  </button>
                </div>

                {/* Add task form */}
                {showAddTask && (
                  <form onSubmit={handleAddTaskInFocus} className="mb-3 bg-white/5 rounded-xl px-4 py-3 flex flex-col gap-2.5 shrink-0">
                    <input
                      autoFocus
                      placeholder="Task name"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="bg-white/8 rounded-lg px-3 py-2 font-body text-sm text-white
                        placeholder:text-white/25 outline-none ring-2 ring-transparent
                        focus:ring-primary/40 transition-all w-full"
                    />
                    <input
                      placeholder="Description (optional)"
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      className="bg-white/8 rounded-lg px-3 py-2 font-body text-sm text-white
                        placeholder:text-white/25 outline-none ring-2 ring-transparent
                        focus:ring-primary/40 transition-all w-full"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!newTaskName.trim()}
                        className="rounded-lg px-3 py-1.5 font-body text-xs font-semibold cursor-pointer
                          bg-primary text-white hover:bg-primary-container transition-all
                          disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowAddTask(false); setNewTaskName(''); setNewTaskDesc(''); }}
                        className="font-body text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Task list */}
                {tasks.length > 0 ? (
                  <div className="flex flex-col gap-2 overflow-y-auto">
                    {tasks.map((task) => {
                      const isActive      = activeTaskId === task._id;
                      const taskElapsed   = getTaskElapsed(task._id);
                      const isExpanded    = expandedTaskId === task._id;
                      const notes         = taskNotes[task._id] ?? [];
                      return (
                        <div
                          key={task._id}
                          className={`rounded-xl transition-colors duration-200 ${
                            isActive ? 'bg-primary/18 ring-1 ring-primary/30' : 'bg-white/5'
                          }`}
                        >
                          {/* Task row */}
                          <div className="flex items-center justify-between px-3.5 py-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot shrink-0" />}
                              <div className="min-w-0">
                                <p className={`font-body text-sm font-medium truncate ${isActive ? 'text-white' : 'text-white/60'}`}>
                                  {task.name}
                                </p>
                                {task.description && (
                                  <p className="font-body text-xs text-white/25 truncate">{task.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-3">
                              <span className="font-body text-xs text-primary/70 tabular-nums">{formatSeconds(taskElapsed)}</span>
                              <button
                                onClick={() => toggleTaskNotes(task._id)}
                                className={`font-body text-xs transition-colors cursor-pointer ${
                                  isExpanded ? 'text-white/60' : 'text-white/25 hover:text-white/50'
                                }`}
                              >
                                {notes.length > 0 ? `${notes.length}n` : 'Notes'}
                              </button>
                              {isActive ? (
                                <button
                                  onClick={handleStopTask}
                                  className="rounded-lg px-2.5 py-1 font-body text-xs cursor-pointer
                                    bg-white/8 text-white/50 hover:bg-white/14 hover:text-white/80 transition-all"
                                >
                                  Stop
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleStartTask(task._id)}
                                  className="rounded-lg px-2.5 py-1 font-body text-xs cursor-pointer
                                    bg-primary/20 text-primary hover:bg-primary/30 transition-all"
                                >
                                  Start
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Task notes expansion */}
                          {isExpanded && (
                            <div className="px-3.5 pb-3 border-t border-white/6 pt-2.5">
                              <div className="flex items-center justify-between mb-2">
                                <p className="font-body text-[0.6rem] uppercase tracking-[0.1em] text-white/25 font-semibold">Task Notes</p>
                                <button
                                  onClick={() => { setTaskNoteFormOpen((v) => !v); setTaskNoteContent(''); }}
                                  className="font-body text-xs text-primary/50 hover:text-primary transition-colors cursor-pointer"
                                >
                                  + Add
                                </button>
                              </div>

                              {taskNoteFormOpen && (
                                <form
                                  onSubmit={(e) => handleAddTaskNote(e, task._id)}
                                  className="mb-2 bg-white/5 rounded-lg px-3 py-2.5 flex flex-col gap-2"
                                >
                                  <textarea
                                    autoFocus
                                    placeholder="Write a note for this task…"
                                    value={taskNoteContent}
                                    onChange={(e) => setTaskNoteContent(e.target.value)}
                                    rows={2}
                                    className="bg-white/8 rounded-md px-2.5 py-1.5 font-body text-xs text-white
                                      placeholder:text-white/25 outline-none ring-2 ring-transparent
                                      focus:ring-primary/40 transition-all w-full resize-none"
                                  />
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="submit"
                                      disabled={!taskNoteContent.trim() || taskNoteSaving}
                                      className="rounded-md px-2.5 py-1 font-body text-xs font-semibold cursor-pointer
                                        bg-primary text-white hover:bg-primary-container transition-all
                                        disabled:opacity-40 disabled:cursor-not-allowed"
                                    >
                                      {taskNoteSaving ? 'Saving…' : 'Save'}
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => { setTaskNoteFormOpen(false); setTaskNoteContent(''); }}
                                      className="font-body text-xs text-white/35 hover:text-white/60 transition-colors cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </form>
                              )}

                              {notes.length === 0 && !taskNoteFormOpen ? (
                                <p className="font-body text-xs text-white/25">No notes for this task.</p>
                              ) : (
                                <div className="flex flex-col gap-1.5">
                                  {notes.map((note) => (
                                    <div key={note._id} className="bg-white/5 rounded-lg px-2.5 py-2 flex items-start justify-between gap-2">
                                      <p className="font-body text-xs text-white/60 leading-relaxed whitespace-pre-wrap break-words flex-1 min-w-0">
                                        {note.content}
                                      </p>
                                      <button
                                        onClick={() => handleDeleteTaskNote(note._id, task._id)}
                                        className="text-white/20 hover:text-red-400 transition-colors cursor-pointer p-0.5 rounded shrink-0 mt-0.5"
                                        aria-label="Delete note"
                                      >
                                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                                          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                                          <path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
                                        </svg>
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : !showAddTask ? (
                  <div className="bg-white/4 rounded-xl px-4 py-6 text-center">
                    <p className="font-body text-sm text-white/25">No tasks yet — add one above.</p>
                  </div>
                ) : null}
              </div>

              {/* ── Right column: Notes ─────────────────────────────────── */}
              <div className="flex flex-col min-h-0 px-6 py-5">
                {/* Column header */}
                <div className="flex items-center justify-between mb-4 shrink-0">
                  <p className="font-body text-[0.6rem] uppercase tracking-[0.12em] text-white/30 font-semibold">Notes</p>
                  <button
                    onClick={() => setShowNoteForm((v) => !v)}
                    className="flex items-center gap-1 font-body text-xs text-primary/60 hover:text-primary transition-colors cursor-pointer"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    Add Note
                  </button>
                </div>

                {/* Add note form */}
                {showNoteForm && (
                  <form onSubmit={handleAddNote} className="mb-3 bg-white/5 rounded-xl px-4 py-3 flex flex-col gap-2.5 shrink-0">
                    <textarea
                      autoFocus
                      placeholder="Write a note about this session…"
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={3}
                      className="bg-white/8 rounded-lg px-3 py-2 font-body text-sm text-white
                        placeholder:text-white/25 outline-none ring-2 ring-transparent
                        focus:ring-primary/40 transition-all w-full resize-none"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={!newNoteContent.trim() || noteSaving}
                        className="rounded-lg px-3 py-1.5 font-body text-xs font-semibold cursor-pointer
                          bg-primary text-white hover:bg-primary-container transition-all
                          disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {noteSaving ? 'Saving…' : 'Save'}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setShowNoteForm(false); setNewNoteContent(''); }}
                        className="font-body text-xs text-white/40 hover:text-white/70 transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Note list */}
                {sessionNotes.length > 0 ? (
                  <div className="flex flex-col gap-2 overflow-y-auto">
                    {sessionNotes.map((note) => (
                      <div key={note._id} className="bg-white/5 rounded-xl px-3.5 py-3 flex items-start justify-between gap-2">
                        <p className="font-body text-sm text-white/70 leading-relaxed whitespace-pre-wrap break-words flex-1 min-w-0">
                          {note.content}
                        </p>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          className="text-white/20 hover:text-red-400 transition-colors cursor-pointer p-1 rounded shrink-0 mt-0.5"
                          aria-label="Delete note"
                        >
                          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                            <path d="M9 6V4h6v2" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : !showNoteForm ? (
                  <div className="bg-white/4 rounded-xl px-4 py-6 text-center">
                    <p className="font-body text-sm text-white/25">No notes yet — jot something down.</p>
                  </div>
                ) : null}
              </div>

            </div>
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

      <ConfirmDeleteModal
        isOpen={!!pendingNoteDelete}
        title="Delete Note"
        message="This will permanently delete this note. This action cannot be undone."
        onConfirm={handleConfirmNoteDelete}
        onCancel={() => setPendingNoteDelete(null)}
      />
    </>
  );
}
