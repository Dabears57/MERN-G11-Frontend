import { useState } from 'react';
import ProjectCard from '../components/ProjectCard.tsx';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import { useProjects } from '../hooks/useProjects.ts';

export default function ProjectsPage() {
  const { projects, addProject } = useProjects();
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    addProject(title.trim(), description.trim());
    setTitle('');
    setDescription('');
    setShowModal(false);
  }

  return (
    <div>
      {/* Header — only show "New Project" button when projects exist */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-[3.5rem] font-bold text-on-surface">Projects</h1>
        {projects.length > 0 && (
          <Button onClick={() => setShowModal(true)}>+ New Project</Button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-16 text-center">
          <svg
            className="w-12 h-12 mx-auto mb-4 text-on-surface/20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" />
          </svg>
          <p className="font-display text-[1.75rem] font-bold text-on-surface mb-2">No projects yet</p>
          <p className="font-body text-base text-on-surface/50 mb-6">
            Create your first project to start tracking time.
          </p>
          <Button onClick={() => setShowModal(true)}>Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm"
            onClick={() => setShowModal(false)}
          />
          <div className="relative bg-surface/90 backdrop-blur-[20px] rounded-2xl p-8 w-full max-w-md
            shadow-[0px_32px_64px_rgba(26,28,28,0.12)]">
            <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-6">New Project</h2>
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <Input
                label="Title"
                placeholder="Project title"
                value={title}
                onChange={(val) => setTitle(val)}
              />
              <div>
                <label className="font-body text-xs font-medium tracking-wide uppercase text-on-surface/70 mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="What is this project about?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="bg-surface-container-lowest rounded-lg px-4 py-3 font-body text-base text-on-surface
                    outline-none border-b-2 border-transparent focus:border-primary transition-colors w-full
                    placeholder:text-on-surface/40 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 pt-1">
                <Button type="submit">Create Project</Button>
                <Button variant="ghost" type="button" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
