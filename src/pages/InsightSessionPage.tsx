import { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { getFullSession } from '../api/queries.ts';
import { createNote, fetchNotesFor, deleteNote } from '../api/notes.ts';
import Button from '../components/Button.tsx';
import type { FullSession, ApiNote } from '../types/index.ts';

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function InsightSessionPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const backTo: string = (location.state as { from?: string } | null)?.from ?? '/insights';
  const backLabel = backTo === '/sessions' ? 'Sessions' : 'Insights';

  const [data,         setData]         = useState<FullSession | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  const [notes,        setNotes]        = useState<ApiNote[]>([]);
  const [noteContent,  setNoteContent]  = useState('');
  const [noteSaving,   setNoteSaving]   = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await getFullSession(id);
    if (res.error || !res.data) { setError(res.error ?? 'Not found'); setLoading(false); return; }
    setData(res.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  // Fetch session notes separately — getFullSession doesn't include them
  const loadNotes = useCallback(async () => {
    if (!id) return;
    const res = await fetchNotesFor('session', id);
    setNotes(res.data ?? []);
  }, [id]);

  useEffect(() => { loadNotes(); }, [loadNotes]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim() || !id) return;
    setNoteSaving(true);
    const res = await createNote(noteContent.trim(), 'session', id);
    // createNote backend returns insertOne result, not the note document.
    // Re-fetch so we display the actual persisted note with correct _id/createdAt.
    if (!res.error) {
      await loadNotes();
      setNoteContent('');
      setShowNoteForm(false);
    }
    setNoteSaving(false);
  }

  async function handleDeleteNote(noteId: string) {
    await deleteNote(noteId);
    setNotes((prev) => prev.filter((n) => n._id !== noteId));
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
        <Link to={backTo} className="font-body text-sm text-on-surface/50 hover:text-primary mb-4 inline-block">
          ← Back to {backLabel}
        </Link>
        <p className="font-body text-on-surface/50">{error || 'Session not found.'}</p>
      </div>
    );
  }

  const { session, project, tasks } = data;

  const startDate = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
    : '—';

  const startTime = session.createdAt
    ? new Date(session.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : '—';

  const endTime = session.endTime
    ? new Date(session.endTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : 'In progress';

  return (
    <div className="animate-fade-up">
      <Link to={backTo} className="inline-flex items-center gap-1.5 font-body text-xs text-on-surface/40 hover:text-primary transition-colors mb-6">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {backLabel}
      </Link>

      <div className="mb-7">
        <p className="font-body text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-primary/70 mb-2">Session Insight</p>
        <h1 className="font-display text-[2.5rem] font-bold text-on-surface leading-tight">{project.title}</h1>
        <p className="font-body text-sm text-on-surface/45 mt-1">{startDate}</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">Duration</p>
          <p className="font-display text-2xl font-bold text-primary">{formatSeconds(session.totalTime)}</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">Start</p>
          <p className="font-display text-2xl font-bold text-on-surface">{startTime}</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">End</p>
          <p className="font-display text-2xl font-bold text-on-surface">{endTime}</p>
        </div>
      </div>

      {/* Tasks worked on */}
      {tasks.length > 0 && (
        <div className="mb-8">
          <h2 className="font-display text-lg font-bold text-on-surface mb-4">Tasks</h2>
          <div className="flex flex-col gap-2">
            {tasks.map((task) => (
              <div key={String(task._id)} className="bg-surface-container-low rounded-2xl px-5 py-3 flex items-center justify-between">
                <p className="font-body text-sm text-on-surface">{task.name}</p>
                <span className="font-display text-sm font-bold text-primary">{formatSeconds(task.timeSpent)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-bold text-on-surface">Notes</h2>
          <Button size="sm" variant="ghost" onClick={() => setShowNoteForm((v) => !v)}>
            + Add Note
          </Button>
        </div>

        {showNoteForm && (
          <form onSubmit={handleAddNote} className="mb-4 bg-surface-container-low rounded-2xl p-4 flex flex-col gap-3">
            <textarea
              autoFocus
              placeholder="Write a note about this session…"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
              className="bg-white rounded-xl px-4 py-3 font-body text-sm text-on-surface
                outline-none ring-2 ring-transparent focus:ring-primary/30
                transition-all duration-200 placeholder:text-on-surface/30 resize-none"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!noteContent.trim() || noteSaving}>
                {noteSaving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowNoteForm(false)}>Cancel</Button>
            </div>
          </form>
        )}

        {notes.length === 0 ? (
          <div className="bg-surface-container-low rounded-2xl p-8 text-center">
            <p className="font-body text-sm text-on-surface/35">No notes for this session yet.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {notes.map((note) => {
              const date = new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
              return (
                <div key={note._id} className="bg-surface-container-low rounded-2xl px-5 py-4 flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="font-body text-sm text-on-surface leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    <p className="font-body text-[0.6rem] text-on-surface/30 mt-1">{date}</p>
                  </div>
                  <button
                    onClick={() => handleDeleteNote(note._id)}
                    className="shrink-0 text-on-surface/25 hover:text-red-500 transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface-container mt-0.5"
                    aria-label="Delete note"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                      <path d="M9 6V4h6v2" />
                    </svg>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
