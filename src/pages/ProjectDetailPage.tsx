import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Button from '../components/Button.tsx';
import Input from '../components/Input.tsx';
import { useProjects } from '../hooks/useProjects.ts';

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { getProject, addTask } = useProjects();
  const project = getProject(id ?? '');

  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskDescription, setTaskDescription] = useState('');

  function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!taskName.trim() || !id) return;
    addTask(id, taskName.trim(), taskDescription.trim());
    setTaskName('');
    setTaskDescription('');
    setShowTaskModal(false);
  }

  if (!project) {
    return (
      <div>
        <h1 className="font-display text-[1.75rem] font-bold text-on-surface mb-4">Project not found</h1>
        <Link to="/projects" className="font-body text-primary hover:underline">Back to Projects</Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/projects" className="font-body text-sm text-on-surface/50 hover:text-primary mb-4 inline-block">
        &larr; Back to Projects
      </Link>
      <h1 className="font-display text-[3.5rem] font-bold text-on-surface mb-2">{project.title}</h1>
      <p className="font-body text-base text-on-surface/60 mb-8">{project.description}</p>

      {/* Stat strip */}
      <div className="flex mb-10 bg-surface-container-low rounded-xl overflow-hidden">
        <div className="px-8 py-5 border-r border-surface-container">
          <p className="font-body text-xs text-on-surface/50 uppercase tracking-wide mb-1">Progress</p>
          <p className="font-display text-2xl font-bold text-primary">{project.progress}%</p>
        </div>
        <div className="px-8 py-5 border-r border-surface-container">
          <p className="font-body text-xs text-on-surface/50 uppercase tracking-wide mb-1">Time Spent</p>
          <p className="font-display text-2xl font-bold text-on-surface">{project.timeSpent} hrs</p>
        </div>
        <div className="px-8 py-5">
          <p className="font-body text-xs text-on-surface/50 uppercase tracking-wide mb-1">Tasks</p>
          <p className="font-display text-2xl font-bold text-on-surface">{project.tasks.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-[1.75rem] font-bold text-on-surface">Tasks</h2>
        <Button onClick={() => setShowTaskModal(true)}>+ Add Task</Button>
      </div>

      {project.tasks.length === 0 ? (
        <div className="bg-surface-container-low rounded-xl p-8 text-center">
          <p className="font-body text-on-surface/50 mb-4">
            No tasks yet. Add your first task to get started.
          </p>
          <Button onClick={() => setShowTaskModal(true)}>+ Add Your First Task</Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {project.tasks.map((task) => (
            <div key={task.id} className="bg-surface-container-low rounded-xl px-6 py-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-body text-[1.125rem] font-semibold text-on-surface">{task.name}</h3>
                <span className="font-body text-xs text-on-surface/50">
                  {Math.round(task.timeSpent / 60)} hrs
                </span>
              </div>
              <p className="font-body text-sm text-on-surface/60 mb-3">{task.description}</p>
              {task.todos.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  {task.todos.map((todo) => (
                    <label key={todo.id} className="flex items-center gap-2 font-body text-sm text-on-surface/70">
                      <span className={`w-4 h-4 rounded flex items-center justify-center text-xs shrink-0 ${
                        todo.completed ? 'bg-primary text-on-primary' : 'bg-surface-container'
                      }`}>
                        {todo.completed ? '✓' : ''}
                      </span>
                      <span className={todo.completed ? 'line-through text-on-surface/40' : ''}>
                        {todo.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-on-surface/30 backdrop-blur-sm" onClick={() => setShowTaskModal(false)} />
          <div className="relative bg-surface/80 backdrop-blur-[20px] rounded-2xl p-8 w-full max-w-md
            shadow-[0px_32px_64px_rgba(26,28,28,0.12)]">
            <h2 className="font-display text-[1.75rem] font-bold text-on-surface mb-6">Add Task</h2>
            <form onSubmit={handleAddTask} className="flex flex-col gap-4">
              <Input
                label="Task Name"
                placeholder="What needs to be done?"
                value={taskName}
                onChange={(val) => setTaskName(val)}
              />
              <div>
                <label className="font-body text-xs font-medium tracking-wide uppercase text-on-surface/70 mb-2 block">
                  Description
                </label>
                <textarea
                  placeholder="Describe this task"
                  value={taskDescription}
                  onChange={(e) => setTaskDescription(e.target.value)}
                  rows={3}
                  className="bg-surface-container-lowest rounded-lg px-4 py-3 font-body text-base text-on-surface
                    outline-none border-b-2 border-transparent focus:border-primary transition-colors w-full
                    placeholder:text-on-surface/40 resize-none"
                />
              </div>
              <div className="flex items-center gap-3 mt-2">
                <Button type="submit">Add Task</Button>
                <Button variant="ghost" type="button" onClick={() => setShowTaskModal(false)}>Cancel</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
