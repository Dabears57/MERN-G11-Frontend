import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import { useProjects } from '../hooks/useProjects.ts';

export default function ProjectDetailPage() {
  const { id }                = useParams<{ id: string }>();
  const { getProject, addTask } = useProjects();
  const project               = getProject(id ?? '');

  const [showTaskModal,  setShowTaskModal]  = useState(false);
  const [taskName,       setTaskName]       = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName.trim() || !id) return;
    addTask(id, taskName.trim(), taskDescription.trim());
    setTaskName('');
    setTaskDescription('');
    setShowTaskModal(false);
  }

  function handleClose() {
    setTaskName('');
    setTaskDescription('');
    setShowTaskModal(false);
  }

  if (!project) {
    return (
      <div className="animate-fade-up">
        <h1 className="font-display text-xl font-bold text-on-surface mb-4">Project not found</h1>
        <Link to="/projects" className="font-body text-sm text-primary hover:underline">← Back to Projects</Link>
      </div>
    );
  }

  const completedTasks = project.tasks.filter((t) => !!t.finishedDate).length;

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <Link
        to="/projects"
        className="inline-flex items-center gap-1.5 font-body text-xs text-on-surface/40
          hover:text-primary transition-colors mb-6"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Projects
      </Link>

      {/* Title */}
      <div className="mb-7">
        <h1 className="font-display text-[2.5rem] font-bold text-on-surface leading-tight">
          {project.title}
        </h1>
        {project.description && (
          <p className="font-body text-sm text-on-surface/50 mt-2 leading-relaxed max-w-xl">
            {project.description}
          </p>
        )}
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">
            Progress
          </p>
          <p className="font-display text-2xl font-bold text-primary">{project.progress}%</p>
          <div className="mt-2 w-full h-1 rounded-full bg-surface-container-highest overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${project.progress}%` }}
            />
          </div>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">
            Time Spent
          </p>
          <p className="font-display text-2xl font-bold text-on-surface">{project.timeSpent}</p>
          <p className="font-body text-xs text-on-surface/35 mt-0.5">hours tracked</p>
        </div>
        <div className="bg-surface-container-low rounded-2xl px-5 py-4">
          <p className="font-body text-[0.65rem] font-semibold tracking-[0.1em] uppercase text-on-surface/40 mb-2">
            Tasks
          </p>
          <p className="font-display text-2xl font-bold text-on-surface">{completedTasks}/{project.tasks.length}</p>
          <p className="font-body text-xs text-on-surface/35 mt-0.5">completed</p>
        </div>
      </div>

      {/* Tasks header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-on-surface">Tasks</h2>
        <Button size="sm" onClick={() => setShowTaskModal(true)}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Task
        </Button>
      </div>

      {/* Tasks list */}
      {project.tasks.length === 0 ? (
        <div className="bg-surface-container-low rounded-2xl p-10 text-center">
          <div className="w-10 h-10 rounded-xl bg-surface-container mx-auto mb-3 flex items-center justify-center">
            <svg className="text-on-surface/20" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <polyline points="9 11 12 14 22 4" />
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
            </svg>
          </div>
          <p className="font-body text-sm text-on-surface/40 mb-4">No tasks yet.</p>
          <Button size="sm" onClick={() => setShowTaskModal(true)}>Add your first task</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {project.tasks.map((task) => {
            const isDone = !!task.finishedDate;
            return (
              <div
                key={task.id}
                className={`bg-surface-container-low rounded-2xl px-5 py-4 transition-all duration-200 ${
                  isDone ? 'opacity-60' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 text-xs ${
                      isDone ? 'bg-primary text-white' : 'bg-surface-container-highest'
                    }`}>
                      {isDone && (
                        <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </div>
                    <h3 className={`font-body text-sm font-semibold ${isDone ? 'line-through text-on-surface/40' : 'text-on-surface'}`}>
                      {task.name}
                    </h3>
                  </div>
                  <span className="font-body text-xs text-on-surface/35 shrink-0 mt-0.5">
                    {Math.round(task.timeSpent / 60)} hrs
                  </span>
                </div>

                {task.description && (
                  <p className="font-body text-xs text-on-surface/50 mb-3 ml-6.5 leading-relaxed">
                    {task.description}
                  </p>
                )}

                {task.todos.length > 0 && (
                  <div className="flex flex-col gap-1.5 ml-6.5 mt-2">
                    {task.todos.map((todo) => (
                      <label key={todo.id} className="flex items-center gap-2 font-body text-xs text-on-surface/60 cursor-default">
                        <span className={`w-3.5 h-3.5 rounded flex items-center justify-center shrink-0 ${
                          todo.completed ? 'bg-primary/80 text-white' : 'bg-surface-container'
                        }`}>
                          {todo.completed && (
                            <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" aria-hidden="true">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </span>
                        <span className={todo.completed ? 'line-through text-on-surface/30' : ''}>{todo.text}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
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
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" onClick={handleClose} />
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
                <label className="font-body text-[0.7rem] font-semibold tracking-[0.08em] uppercase text-on-surface/50">
                  Description
                </label>
                <textarea
                  placeholder="Optional description"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="bg-surface-container-low rounded-xl px-4 py-3 font-body text-sm text-on-surface
                    outline-none ring-2 ring-transparent focus:ring-primary/30 focus:bg-white
                    transition-all duration-200 placeholder:text-on-surface/30 resize-none"
                />
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <Button type="submit" disabled={!taskName.trim()}>Add Task</Button>
                <Button variant="ghost" type="button" onClick={handleClose}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
