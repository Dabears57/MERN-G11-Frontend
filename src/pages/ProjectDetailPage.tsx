import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';
import { updateProject } from '../api/projects.ts';
import { getFullProject } from '../api/queries.ts';
import { createTask, updateTask, deleteTask } from '../api/tasks.ts';
import { createNote, updateNote, deleteNote } from '../api/notes.ts';
import { formatDuration } from '../data/mock.ts';
import type { ApiTask, ApiNote, FullProject } from '../types/index.ts';

function formatSeconds(s: number): string {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [data,         setData]         = useState<FullProject | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState('');

  // edit project
  const [showEditProject, setShowEditProject] = useState(false);
  const [editTitle,       setEditTitle]       = useState('');
  const [editDesc,        setEditDesc]        = useState('');
  const [editSaving,      setEditSaving]      = useState(false);

  // delete confirmations
  const [pendingDelete, setPendingDelete] = useState<{ type: 'task' | 'note'; id: string } | null>(null);

  // task modal
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskName,      setTaskName]      = useState('');
  const [taskDesc,      setTaskDesc]      = useState('');
  const [taskSaving,    setTaskSaving]    = useState(false);

  // project-level notes
  const [noteContent,  setNoteContent]  = useState('');
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteSaving,   setNoteSaving]   = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const res = await getFullProject(id);
    if (res.error || !res.data) { setError(res.error ?? 'Project not found'); setLoading(false); return; }
    setData(res.data);
    setLoading(false);
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName.trim() || !id) return;
    setTaskSaving(true);
    const res = await createTask(id, taskName.trim(), taskDesc.trim());
    setTaskSaving(false);
    if (res.error) return;
    setTaskName('');
    setTaskDesc('');
    setShowTaskModal(false);
    load();
  }

  async function handleEditTask(taskId: string, name: string, description: string) {
    const { error } = await updateTask(taskId, { name, description });
    if (!error) {
      setData((prev) => prev
        ? { ...prev, tasks: prev.tasks.map((t) => t._id === taskId ? { ...t, name, description } : t) }
        : prev
      );
    }
  }

  function handleDeleteTask(taskId: string) {
    setPendingDelete({ type: 'task', id: taskId });
  }

  async function handleAddProjectNote(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim() || !id) return;
    setNoteSaving(true);
    const res = await createNote(noteContent.trim(), 'project', id);
    setNoteSaving(false);
    if (res.error || !res.data) return;
    setNoteContent('');
    setShowNoteForm(false);
    load();
  }

  async function handleAddTaskNote(taskId: string, content: string): Promise<boolean> {
    const res = await createNote(content, 'task', taskId);
    if (res.error) return false;
    load();
    return true;
  }

  function handleDeleteNote(noteId: string) {
    setPendingDelete({ type: 'note', id: noteId });
  }

  function openEditProject() {
    setEditTitle(data!.project.title);
    setEditDesc(data!.project.description ?? '');
    setShowEditProject(true);
  }

  async function handleEditProjectSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!editTitle.trim() || !id) return;
    setEditSaving(true);
    const { error } = await updateProject(id, { title: editTitle.trim(), description: editDesc.trim() });
    setEditSaving(false);
    if (error) return;
    setData((prev) => prev
      ? { ...prev, project: { ...prev.project, title: editTitle.trim(), description: editDesc.trim() } }
      : prev
    );
    setShowEditProject(false);
  }

  async function handleEditNote(noteId: string, content: string) {
    const { error } = await updateNote(noteId, content);
    if (!error) {
      setData((prev) => prev
        ? { ...prev, notes: prev.notes.map((n) => n._id === noteId ? { ...n, content } : n) }
        : prev
      );
    }
  }

  async function handleConfirmDelete() {
    if (!pendingDelete) return;
    if (pendingDelete.type === 'task') {
      await deleteTask(pendingDelete.id);
      setData((prev) => prev ? { ...prev, tasks: prev.tasks.filter((t) => t._id !== pendingDelete.id) } : prev);
    } else {
      await deleteNote(pendingDelete.id);
      setData((prev) => prev ? { ...prev, notes: prev.notes.filter((n) => n._id !== pendingDelete.id) } : prev);
    }
    setPendingDelete(null);
  }

  function notesFor(type: ApiNote['parentType'], targetId: string): ApiNote[] {
    return (data?.notes ?? []).filter((n) => n.parentType === type && n.parentId === targetId);
  }

  if (loading) {
    return (
      <div className="animate-fade-up">
        <div className="h-8 w-48 rounded-xl bg-surface-container-low animate-pulse mb-6" />
        <div className="h-12 w-72 rounded-xl bg-surface-container-low animate-pulse mb-8" />
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 rounded-2xl bg-surface-container-low animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="animate-fade-up">
        <h1 className="font-display text-xl font-bold text-on-surface mb-4">{error || 'Project not found'}</h1>
        <Link to="/projects" className="font-body text-sm text-primary hover:underline">← Back to Projects</Link>
      </div>
    );
  }

  const { project, tasks, sessions } = data;
  const projectNotes = notesFor('project', project._id);
  const totalSessionTime = sessions.reduce((acc, s) => acc + (s.totalTime ?? 0), 0);

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 font-body text-xs text-on-surface/65
          hover:text-primary transition-colors mb-6"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Projects
      </Link>

      {/* Title + Start Session */}
      <div className="flex items-start justify-between gap-4 mb-7">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[2.5rem] font-bold text-on-surface leading-tight break-words">{project.title}</h1>
            <button
              onClick={openEditProject}
              className="shrink-0 text-on-surface/65 hover:text-primary transition-colors cursor-pointer p-1.5 rounded-lg hover:bg-surface-container mt-1"
              aria-label="Edit project"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
              </svg>
            </button>
          </div>
          {project.description && (
            <p className="font-body text-sm text-on-surface/65 mt-2 leading-relaxed max-w-xl">{project.description}</p>
          )}
        </div>
        <div className="shrink-0 pt-2">
          <Button
            onClick={() => navigate('/sessions', { state: { projectId: project._id } })}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            Start Session
          </Button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/65 mb-2">Tasks</p>
          <p className="font-display text-2xl font-bold text-on-surface">{tasks.length}</p>
          <p className="font-body text-xs text-on-surface/65 mt-0.5">total</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/65 mb-2">Time Tracked</p>
          <p className="font-display text-2xl font-bold text-on-surface">{formatSeconds(project.totalTime)}</p>
          <p className="font-body text-xs text-on-surface/65 mt-0.5">across all sessions</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/65 mb-2">Sessions</p>
          <p className="font-display text-2xl font-bold text-on-surface">{sessions.length}</p>
          <p className="font-body text-xs text-on-surface/65 mt-0.5">{formatSeconds(totalSessionTime)} total</p>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-on-surface">Tasks</h2>
        <Button size="sm" onClick={() => setShowTaskModal(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Task
        </Button>
      </div>

      {tasks.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-10 text-center mb-8">
          <div className="w-10 h-10 rounded-xl bg-surface-container mx-auto mb-3 flex items-center justify-center">
            <svg className="text-on-surface/40" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="font-body text-sm text-on-surface/65 mb-4">No tasks yet.</p>
          <Button size="sm" onClick={() => setShowTaskModal(true)}>Add your first task</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mb-8">
          {tasks.map((task) => {
            const taskNotes = notesFor('task', task._id);
            return (
              <TaskItem
                key={task._id}
                task={task}
                notes={taskNotes}
                onDelete={handleDeleteTask}
                onEdit={handleEditTask}
                onSubmitNote={handleAddTaskNote}
                onDeleteNote={handleDeleteNote}
                onEditNote={handleEditNote}
              />
            );
          })}
        </div>
      )}

      {/* Project Notes */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-xl font-bold text-on-surface">Notes</h2>
          <Button size="sm" variant="ghost" onClick={() => setShowNoteForm((v) => !v)}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Note
          </Button>
        </div>

        {showNoteForm && (
          <form onSubmit={handleAddProjectNote} className="mb-4 bg-surface-container-low rounded-2xl p-4 flex flex-col gap-3">
            <textarea
              autoFocus
              placeholder="Write a note…"
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              rows={3}
              className="bg-white rounded-xl px-4 py-3 font-body text-sm text-on-surface
                outline-none ring-2 ring-transparent focus:ring-primary/30
                transition-all duration-200 placeholder:text-on-surface/65 resize-none"
            />
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={!noteContent.trim() || noteSaving}>
                {noteSaving ? 'Saving…' : 'Save'}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => { setShowNoteForm(false); setNoteContent(''); }}>Cancel</Button>
            </div>
          </form>
        )}

        {projectNotes.length === 0 && !showNoteForm ? (
          <div className="bg-surface-container-low rounded-2xl p-8 text-center">
            <p className="font-body text-sm text-on-surface/65">No notes yet. Add a note above.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {[...projectNotes].reverse().map((note) => (
              <NoteItem key={note._id} note={note} onDelete={handleDeleteNote} onEdit={handleEditNote} />
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={!!pendingDelete}
        title={pendingDelete?.type === 'task' ? 'Delete Task' : 'Delete Note'}
        message={
          pendingDelete?.type === 'task'
            ? 'This will permanently delete the task and all its notes. This action cannot be undone.'
            : 'This will permanently delete this note. This action cannot be undone.'
        }
        confirmLabel="Delete"
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDelete(null)}
      />

      {/* Edit Project Modal */}
      {showEditProject && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="edit-project-title"
        >
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" onClick={() => setShowEditProject(false)} />
          <div className="relative bg-surface/92 backdrop-blur-[24px] rounded-2xl p-7 w-full max-w-md
            shadow-[0_24px_60px_rgba(26,28,28,0.14)] animate-scale-in">
            <h2 id="edit-project-title" className="font-display text-xl font-bold text-on-surface mb-5">Edit Project</h2>
            <form onSubmit={handleEditProjectSubmit} className="flex flex-col gap-4">
              <Input
                label="Title"
                placeholder="Project title"
                value={editTitle}
                onChange={setEditTitle}
                autoFocus
              />
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-on-surface/65">
                  Description
                </label>
                <textarea
                  placeholder="What is this project about?"
                  value={editDesc}
                  onChange={(e) => setEditDesc(e.target.value)}
                  rows={3}
                  className="bg-surface-container-low rounded-xl px-4 py-3 font-body text-sm text-on-surface
                    outline-none ring-2 ring-transparent focus:ring-primary/30 focus:bg-white
                    transition-all duration-200 placeholder:text-on-surface/65 resize-none"
                />
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Button type="submit" disabled={!editTitle.trim() || editSaving}>
                  {editSaving ? 'Saving…' : 'Save Changes'}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setShowEditProject(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="task-modal-title"
        >
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" onClick={() => setShowTaskModal(false)} />
          <div className="relative bg-surface/92 backdrop-blur-[24px] rounded-2xl p-7 w-full max-w-md
            shadow-[0_24px_60px_rgba(26,28,28,0.14)] animate-scale-in">
            <h2 id="task-modal-title" className="font-display text-xl font-bold text-on-surface mb-5">Add Task</h2>
            <form onSubmit={handleAddTask} className="flex flex-col gap-4">
              <Input
                label="Task Name"
                placeholder="What needs to be done?"
                value={taskName}
                onChange={setTaskName}
                autoFocus
              />
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-on-surface/65">
                  Description
                </label>
                <textarea
                  placeholder="Optional description"
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  rows={3}
                  className="bg-surface-container-low rounded-xl px-4 py-3 font-body text-sm text-on-surface
                    outline-none ring-2 ring-transparent focus:ring-primary/30 focus:bg-white
                    transition-all duration-200 placeholder:text-on-surface/65 resize-none"
                />
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Button type="submit" disabled={!taskName.trim() || taskSaving}>
                  {taskSaving ? 'Adding…' : 'Add Task'}
                </Button>
                <Button variant="ghost" type="button" onClick={() => setShowTaskModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface TaskItemProps {
  task: ApiTask;
  notes: ApiNote[];
  onDelete: (id: string) => void;
  onEdit: (id: string, name: string, description: string) => Promise<void>;
  onSubmitNote: (taskId: string, content: string) => Promise<boolean>;
  onDeleteNote: (id: string) => void;
  onEditNote: (id: string, content: string) => Promise<void>;
}

function TaskItem({ task, notes, onDelete, onEdit, onSubmitNote, onDeleteNote, onEditNote }: TaskItemProps) {
  const [expanded,    setExpanded]    = useState(false);
  const [editing,     setEditing]     = useState(false);
  const [editName,    setEditName]    = useState('');
  const [editDesc,    setEditDesc]    = useState('');
  const [editSaving,  setEditSaving]  = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  const [noteContent,  setNoteContent]  = useState('');
  const [noteSaving,   setNoteSaving]   = useState(false);

  function handleStartEdit() {
    setEditName(task.name);
    setEditDesc(task.description ?? '');
    setEditing(true);
  }

  async function handleSaveEdit() {
    if (!editName.trim()) return;
    setEditSaving(true);
    await onEdit(task._id, editName.trim(), editDesc.trim());
    setEditSaving(false);
    setEditing(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!noteContent.trim()) return;
    setNoteSaving(true);
    const ok = await onSubmitNote(task._id, noteContent.trim());
    setNoteSaving(false);
    if (ok) {
      setNoteContent('');
      setShowNoteForm(false);
    }
  }

  return (
    <div className="bg-surface-container-low rounded-2xl">
      <div className="px-5 py-4">
        {editing ? (
          <div className="flex flex-col gap-2.5">
            <input
              autoFocus
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              placeholder="Task name"
              className="bg-white rounded-xl px-4 py-2.5 font-body text-sm font-semibold text-on-surface
                outline-none ring-2 ring-transparent focus:ring-primary/30
                transition-all duration-200 placeholder:text-on-surface/65 w-full"
            />
            <input
              value={editDesc}
              onChange={(e) => setEditDesc(e.target.value)}
              placeholder="Description (optional)"
              className="bg-surface-container rounded-xl px-4 py-2.5 font-body text-xs text-on-surface
                outline-none ring-2 ring-transparent focus:ring-primary/30 focus:bg-white
                transition-all duration-200 placeholder:text-on-surface/65 w-full"
            />
            <div className="flex gap-2">
              <button
                onClick={handleSaveEdit}
                disabled={!editName.trim() || editSaving}
                className="rounded-lg px-3 py-1.5 font-body text-xs font-semibold cursor-pointer
                  bg-primary text-white hover:bg-primary-container transition-all
                  disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {editSaving ? 'Saving…' : 'Save'}
              </button>
              <button
                onClick={() => setEditing(false)}
                className="font-body text-xs text-on-surface/65 hover:text-on-surface/70 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-4 h-4 rounded shrink-0 bg-surface-container-highest" />
              <div className="min-w-0">
                <h3 className="font-body text-sm font-semibold text-on-surface truncate">{task.name}</h3>
                {task.description && (
                  <p className="font-body text-xs text-on-surface/65 mt-0.5 leading-relaxed">{task.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <span className="font-body text-xs text-on-surface/65">
                {formatDuration(task.totalTime)}
              </span>
              <button
                onClick={() => setExpanded((v) => !v)}
                className="font-body text-xs text-primary hover:text-primary transition-colors cursor-pointer"
              >
                Notes
              </button>
              <button
                onClick={handleStartEdit}
                className="font-body text-xs text-on-surface/65 hover:text-primary transition-colors cursor-pointer"
                aria-label="Edit task"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(task._id)}
                className="font-body text-xs text-red-700 hover:text-red-600 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {expanded && (
        <div className="px-5 pb-4 border-t border-surface-container-highest">
          <div className="flex items-center justify-between mt-3 mb-2">
            <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/65">
              Task Notes
            </p>
            <button
              onClick={() => { setShowNoteForm((v) => !v); setNoteContent(''); }}
              className="font-body text-xs text-primary hover:text-primary transition-colors cursor-pointer"
            >
              + Add
            </button>
          </div>

          {showNoteForm && (
            <form onSubmit={handleSubmit} className="mb-3 bg-surface-container rounded-xl p-3 flex flex-col gap-2">
              <textarea
                autoFocus
                placeholder="Write a note for this task…"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={2}
                className="bg-white rounded-lg px-3 py-2 font-body text-xs text-on-surface
                  outline-none ring-2 ring-transparent focus:ring-primary/30
                  transition-all duration-200 placeholder:text-on-surface/65 resize-none w-full"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!noteContent.trim() || noteSaving}
                  className="rounded-lg px-3 py-1.5 font-body text-xs font-semibold cursor-pointer
                    bg-primary text-white hover:bg-primary-container transition-all
                    disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {noteSaving ? 'Saving…' : 'Save'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowNoteForm(false); setNoteContent(''); }}
                  className="font-body text-xs text-on-surface/65 hover:text-on-surface/70 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {notes.length === 0 && !showNoteForm ? (
            <p className="font-body text-xs text-on-surface/65">No notes for this task.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {[...notes].reverse().map((note) => (
                <NoteItem key={note._id} note={note} onDelete={onDeleteNote} onEdit={onEditNote} compact />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface NoteItemProps {
  note: ApiNote;
  onDelete: (id: string) => void;
  onEdit: (id: string, content: string) => Promise<void>;
  compact?: boolean;
}

function NoteItem({ note, onDelete, onEdit, compact }: NoteItemProps) {
  const [editing, setEditing] = useState(false);
  const [draft,   setDraft]   = useState('');
  const [saving,  setSaving]  = useState(false);

  const date = new Date(note.createdAt).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  });

  function handleStartEdit() {
    setDraft(note.content);
    setEditing(true);
  }

  async function handleSave() {
    if (!draft.trim()) return;
    setSaving(true);
    await onEdit(note._id, draft.trim());
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className={`bg-surface-container rounded-xl px-4 ${compact ? 'py-2.5' : 'py-3'} flex flex-col gap-2`}>
        <textarea
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={compact ? 2 : 3}
          className="bg-white rounded-lg px-3 py-2 font-body text-sm text-on-surface
            outline-none ring-2 ring-transparent focus:ring-primary/30
            transition-all duration-200 resize-none w-full"
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            disabled={!draft.trim() || saving}
            className="rounded-lg px-3 py-1.5 font-body text-xs font-semibold cursor-pointer
              bg-primary text-white hover:bg-primary-container transition-all
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
          <button
            onClick={() => setEditing(false)}
            className="font-body text-xs text-on-surface/65 hover:text-on-surface/70 transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-surface-container rounded-xl px-4 ${compact ? 'py-2.5' : 'py-3'} flex items-start justify-between gap-3`}>
      <div className="min-w-0 flex-1">
        <p className={`font-body text-on-surface leading-relaxed whitespace-pre-wrap break-words ${compact ? 'text-xs' : 'text-sm'}`}>
          {note.content}
        </p>
        <p className="font-body text-[0.6rem] text-on-surface/65 mt-1">{date}</p>
      </div>
      <div className="flex items-center gap-1 shrink-0 mt-0.5">
        <button
          onClick={handleStartEdit}
          className="text-on-surface/65 hover:text-primary transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface-container-highest"
          aria-label="Edit note"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
          </svg>
        </button>
        <button
          onClick={() => onDelete(note._id)}
          className="text-on-surface/65 hover:text-red-500 transition-colors cursor-pointer p-1 rounded-lg hover:bg-surface-container-highest"
          aria-label="Delete note"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
            <path d="M9 6V4h6v2" />
          </svg>
        </button>
      </div>
    </div>
  );
}
