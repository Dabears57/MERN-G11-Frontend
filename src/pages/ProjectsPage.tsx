import { useState, useEffect, useCallback } from 'react';
import ProjectCard from '../components/ProjectCard.tsx';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal.tsx';
import { createProject, fetchProjects, deleteProject } from '../api/projects.ts';
import type { ApiProject } from '../types/index.ts';

export default function ProjectsPage() {
  const [projects,    setProjects]    = useState<ApiProject[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState('');
  const [showModal,   setShowModal]   = useState(false);
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [saving,      setSaving]      = useState(false);
  const [saveError,   setSaveError]   = useState('');
  const [pendingDeleteId,    setPendingDeleteId]    = useState<string | null>(null);
  const [isDeleting,         setIsDeleting]         = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetchProjects();
    if (res.error) setError(res.error);
    else setProjects(res.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    setSaveError('');
    const res = await createProject(title.trim(), description.trim());
    setSaving(false);
    if (res.error) { setSaveError(res.error); return; }
    setTitle('');
    setDescription('');
    setShowModal(false);
    load();
  }

  function handleDelete(id: string) {
    setPendingDeleteId(id);
  }

  async function handleConfirmDelete() {
    if (!pendingDeleteId) return;
    setIsDeleting(true);
    await deleteProject(pendingDeleteId);
    setProjects((prev) => prev.filter((p) => p._id !== pendingDeleteId));
    setIsDeleting(false);
    setPendingDeleteId(null);
  }

  function handleClose() {
    setTitle('');
    setDescription('');
    setSaveError('');
    setShowModal(false);
  }

  if (loading) {
    return (
      <div className="animate-fade-up">
        <div className="mb-8">
          <h1 className="font-display text-[2.75rem] font-bold text-on-surface leading-tight">Projects</h1>
        </div>
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-surface-container-low rounded-2xl h-32 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-[2.75rem] font-bold text-on-surface leading-tight">Projects</h1>
          <p className="font-body text-sm text-on-surface/65 mt-1">
            {projects.length > 0
              ? `${projects.length} project${projects.length !== 1 ? 's' : ''}`
              : 'Organize your work into projects'}
          </p>
        </div>
        {projects.length > 0 && (
          <Button onClick={() => setShowModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            New Project
          </Button>
        )}
      </div>

      {error ? (
        <div className="bg-surface-container-low rounded-2xl p-10 text-center">
          <p className="font-body text-sm text-on-surface/65 mb-4">Unable to load projects — {error}</p>
          <Button size="sm" onClick={load}>Try again</Button>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-16 text-center animate-fade-up stagger-1">
          <div className="w-14 h-14 rounded-2xl bg-surface-container mx-auto mb-5 flex items-center justify-center">
            <svg className="text-on-surface/20" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
            </svg>
          </div>
          <h2 className="font-display text-xl font-bold text-on-surface mb-2">No projects yet</h2>
          <p className="font-body text-sm text-on-surface/65 mb-7 max-w-xs mx-auto leading-relaxed">
            Create your first project to start tracking your time and tasks.
          </p>
          <Button onClick={() => setShowModal(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Create Project
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {projects.map((project, i) => (
            <ProjectCard key={project._id} project={project} index={i} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={!!pendingDeleteId}
        title="Delete Project"
        message="This will permanently delete the project along with all its tasks and notes. This action cannot be undone."
        confirmLabel="Delete Project"
        isDeleting={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setPendingDeleteId(null)}
      />

      {/* New project modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" onClick={handleClose} />
          <div className="relative bg-surface/92 backdrop-blur-[24px] rounded-2xl p-7 w-full max-w-md
            shadow-[0_24px_60px_rgba(26,28,28,0.14)] animate-scale-in">
            <h2 id="modal-title" className="font-display text-xl font-bold text-on-surface mb-5">New Project</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                label="Title"
                placeholder="e.g. Website Redesign"
                value={title}
                onChange={setTitle}
                autoFocus
              />
              <div className="flex flex-col gap-1.5">
                <label className="font-body text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-on-surface/65">
                  Description
                </label>
                <textarea
                  placeholder="What is this project about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-surface-container-low rounded-xl px-4 py-3 font-body text-sm text-on-surface
                    outline-none ring-2 ring-transparent focus:ring-primary/30 focus:bg-white
                    transition-all duration-200 placeholder:text-on-surface/55 resize-none"
                />
              </div>
              {saveError && (
                <p className="font-body text-sm text-red-600">{saveError}</p>
              )}
              <div className="flex items-center gap-2.5 pt-1">
                <Button type="submit" disabled={!title.trim() || saving}>
                  {saving ? 'Creating…' : 'Create Project'}
                </Button>
                <Button variant="ghost" type="button" onClick={handleClose}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
