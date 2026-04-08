import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getFullProject } from '../api/queries.ts';
import { createNote, deleteNote } from '../api/notes.ts';
import Button from '../components/Button.tsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';
import DonutChart from '../components/DonutChart.tsx';
import BarChart from '../components/BarChart.tsx';
import type { FullProject, ApiNote } from '../types/index.ts';

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function InsightProjectPage() {
  const { id } = useParams<{ id: string }>();

  const [data,        setData]        = useState<FullProject | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');

  // note form
  const [noteContent, setNoteContent] = useState('');
  const [noteTarget,  setNoteTarget]  = useState<{ type: ApiNote['parentType']; id: string } | null>(null);
  const [noteSaving,  setNoteSaving]  = useState(false);
  const [pendingDeleteNoteId, setPendingDeleteNoteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await getFullProject(id);
    if (res.error || !res.data) { setError(res.error ?? 'Not found'); setLoading(false); return; }
    setData(res.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim() || !noteTarget) return;
    setNoteSaving(true);
    await createNote(noteContent.trim(), noteTarget.type, noteTarget.id);
    setNoteSaving(false);
    setNoteContent('');
    setNoteTarget(null);
    load();
  }

  function handleDeleteNote(noteId: string) {
    setPendingDeleteNoteId(noteId);
  }

  async function handleConfirmDeleteNote() {
    if (!pendingDeleteNoteId) return;
    await deleteNote(pendingDeleteNoteId);
    setData((prev) => prev ? { ...prev, notes: prev.notes.filter((n) => n._id !== pendingDeleteNoteId) } : prev);
    setPendingDeleteNoteId(null);
  }

  function notesFor(type: ApiNote['parentType'], targetId: string): ApiNote[] {
    return (data?.notes ?? []).filter((n) => n.parentType === type && n.parentId === targetId);
  }

  if (loading) {
    return (
      <div className="animate-fade-up">
        <div className="h-5 w-32 rounded-lg bg-surface-container-low animate-pulse mb-4" />
        <div className="h-14 w-72 rounded-xl bg-surface-container-low animate-pulse mb-8" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-surface-container-low animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="animate-fade-up">
        <Link to="/insights" className="font-body text-sm text-on-surface/50 hover:text-primary mb-4 inline-block">
          ← Back to Insights
        </Link>
        <p className="font-body text-on-surface/50">{error || 'Project not found.'}</p>
      </div>
    );
  }

  const { project, tasks, sessions } = data;
  const projectNotes = notesFor('project', project._id);
  const completedSessions = sessions.filter((s) => !s.active && s.totalTime > 0);

  // Task donut slices
  const taskSlices = tasks
    .filter(t => t.totalTime > 0)
    .map(t => ({ label: t.name, value: t.totalTime }));

  // Session bar data (last 12 sessions)
  const sessionBarData = completedSessions.slice(-12).map((s) => ({
    label: `#${completedSessions.indexOf(s) + 1}`,
    value: s.totalTime / 3600,
    highlight: false,
  }));

  const avgSessionSecs =
    completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.totalTime, 0) / completedSessions.length
      : 0;

  return (
    <div className="animate-fade-up">
      <Link to="/insights" className="inline-flex items-center gap-1.5 font-body text-xs text-on-surface/40 hover:text-primary transition-colors mb-6">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Insights
      </Link>

      <div className="mb-7">
        <p className="font-body text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary/70 mb-2">Project Insight</p>
        <h1 className="font-display text-[2.5rem] font-bold text-on-surface leading-tight">{project.title}</h1>
        {project.description && (
          <p className="font-body text-sm text-on-surface/50 mt-2 max-w-xl leading-relaxed">{project.description}</p>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">Total Time</p>
          <p className="font-display text-2xl font-bold text-primary">{formatSeconds(project.totalTime)}</p>
          <p className="font-body text-xs text-on-surface/35 mt-0.5">tracked</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">Sessions</p>
          <p className="font-display text-2xl font-bold text-on-surface">{completedSessions.length}</p>
          <p className="font-body text-xs text-on-surface/35 mt-0.5">completed</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">Avg Session</p>
          <p className="font-display text-2xl font-bold text-on-surface">
            {avgSessionSecs > 0 ? formatSeconds(avgSessionSecs) : '—'}
          </p>
          <p className="font-body text-xs text-on-surface/35 mt-0.5">per session</p>
        </div>
      </div>

      {/* Charts section */}
      {(taskSlices.length > 0 || completedSessions.length > 0) && (
        <div className="grid grid-cols-[5fr_7fr] gap-6 mb-8">
          {/* Task time donut */}
          <div className="bg-surface-container-low rounded-2xl px-6 py-5">
            <h2 className="font-display text-lg font-bold text-on-surface leading-none">Task Time</h2>
            <p className="font-body text-xs text-on-surface/40 mt-1 mb-5">Distribution by task</p>
            <div className="flex justify-center">
              <DonutChart
                slices={taskSlices}
                centerLabel={taskSlices.length > 0 ? formatSeconds(tasks.reduce((s, t) => s + t.totalTime, 0)) : undefined}
                centerSub="tracked"
                size={164}
                thickness={22}
                emptyMessage="No task time yet"
              />
            </div>
          </div>

          {/* Session duration bars */}
          <div className="bg-surface-container-low rounded-2xl px-6 py-5">
            <h2 className="font-display text-lg font-bold text-on-surface leading-none">Session Durations</h2>
            <p className="font-body text-xs text-on-surface/40 mt-1 mb-5">
              Hours per session{completedSessions.length > 12 ? ' (last 12)' : ''}
            </p>
            <BarChart
              data={sessionBarData}
              height={120}
              emptyMessage="No completed sessions"
            />
          </div>
        </div>
      )}

      {/* Tasks breakdown */}
      {tasks.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold text-on-surface mb-4">Tasks</h2>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => {
              const taskNotes = notesFor('task', task._id);
              const maxTaskTime = Math.max(...tasks.map(t => t.totalTime), 1);
              const barPct = (task.totalTime / maxTaskTime) * 100;
              return (
                <div key={task._id} className="bg-surface-container-low rounded-2xl px-5 py-4">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-body text-sm font-semibold text-on-surface">{task.name}</p>
                    <span className="font-display text-sm font-bold text-primary">{formatSeconds(task.totalTime)}</span>
                  </div>
                  {task.description && (
                    <p className="font-body text-xs text-on-surface/50 leading-relaxed mb-2">{task.description}</p>
                  )}
                  {task.totalTime > 0 && (
                    <div className="h-1 bg-surface-container-highest rounded-full overflow-hidden mt-2 mb-1">
                      <div
                        className="h-full rounded-full bg-primary/40 animate-grow-x"
                        style={{ width: `${barPct}%`, animationDelay: '0.2s' }}
                      />
                    </div>
                  )}
                  {taskNotes.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-surface-container-highest flex flex-col gap-1.5">
                      <p className="font-body text-[0.6rem] font-semibold uppercase tracking-[0.1em] text-on-surface/30 mb-1">Notes</p>
                      {taskNotes.map((note) => (
                        <NoteItem key={note._id} note={note} onDelete={handleDeleteNote} compact />
                      ))}
                    </div>
                  )}
                  <button
                    onClick={() => setNoteTarget({ type: 'task', id: task._id })}
                    className="mt-2 font-body text-xs text-primary/50 hover:text-primary transition-colors cursor-pointer"
                  >
                    + Add note
                  </button>
                  {noteTarget?.type === 'task' && noteTarget.id === task._id && (
                    <NoteForm
                      value={noteContent}
                      saving={noteSaving}
                      onChange={setNoteContent}
                      onSubmit={handleAddNote}
                      onCancel={() => setNoteTarget(null)}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Project Notes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-on-surface">Project Notes</h2>
          <Button size="sm" variant="ghost" onClick={() => setNoteTarget({ type: 'project', id: project._id })}>
            + Add Note
          </Button>
        </div>

        {noteTarget?.type === 'project' && noteTarget.id === project._id && (
          <NoteForm
            value={noteContent}
            saving={noteSaving}
            onChange={setNoteContent}
            onSubmit={handleAddNote}
            onCancel={() => setNoteTarget(null)}
          />
        )}

        {projectNotes.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-8 text-center">
            <p className="font-body text-sm text-on-surface/35">No notes yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {projectNotes.map((note) => (
              <NoteItem key={note._id} note={note} onDelete={handleDeleteNote} />
            ))}
          </div>
        )}
      </div>

      <ConfirmDeleteModal
        isOpen={!!pendingDeleteNoteId}
        title="Delete Note"
        message="This will permanently delete this note. This action cannot be undone."
        onConfirm={handleConfirmDeleteNote}
        onCancel={() => setPendingDeleteNoteId(null)}
      />
    </div>
  );
}

// ── Shared sub-components ─────────────────────────────────────────────────────

interface NoteFormProps {
  value: string;
  saving: boolean;
  onChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
}

function NoteForm({ value, saving, onChange, onSubmit, onCancel }: NoteFormProps) {
  return (
    <form onSubmit={onSubmit} className="mt-3 bg-surface-container rounded-xl p-4 flex flex-col gap-3">
      <textarea
        autoFocus
        placeholder="Write a note…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={3}
        className="bg-white rounded-xl px-4 py-3 font-body text-sm text-on-surface
          outline-none ring-2 ring-transparent focus:ring-primary/30
          transition-all duration-200 placeholder:text-on-surface/30 resize-none w-full"
      />
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={!value.trim() || saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}

interface NoteItemProps {
  note: ApiNote;
  onDelete: (id: string) => void;
  compact?: boolean;
}

function NoteItem({ note, onDelete, compact }: NoteItemProps) {
  const date = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  return (
    <div className={`bg-surface-container rounded-xl px-4 ${compact ? 'py-2.5' : 'py-3'} flex items-start justify-between gap-3`}>
      <div className="min-w-0 flex-1">
        <p className={`font-body text-on-surface leading-relaxed whitespace-pre-wrap ${compact ? 'text-xs' : 'text-sm'}`}>
          {note.content}
        </p>
        <p className="font-body text-[0.6rem] text-on-surface/30 mt-1">{date}</p>
      </div>
      <button
        onClick={() => onDelete(note._id)}
        className="shrink-0 text-on-surface/25 hover:text-red-500 transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface-container-highest mt-0.5"
        aria-label="Delete note"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
          <path d="M9 6V4h6v2" />
        </svg>
      </button>
    </div>
  );
}
