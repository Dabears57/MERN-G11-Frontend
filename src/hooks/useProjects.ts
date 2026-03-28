import { useState, useCallback } from 'react';
import type { Project, Task } from '../types/index.ts';
import { MOCK_PROJECTS } from '../data/mock.ts';

let globalProjects: Project[] = [...MOCK_PROJECTS];
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((fn) => fn());
}

export function useProjects() {
  const [, setTick] = useState(0);

  const rerender = useCallback(() => setTick((t) => t + 1), []);

  useState(() => {
    listeners.add(rerender);
    return () => listeners.delete(rerender);
  });

  const addProject = useCallback((title: string, description: string) => {
    const newProject: Project = {
      id: `proj-${Date.now()}`,
      title,
      description,
      startDate: new Date().toISOString().split('T')[0],
      timeSpent: 0,
      progress: 0,
      tasks: [],
    };
    globalProjects = [newProject, ...globalProjects];
    notify();
  }, []);

  const addTask = useCallback((projectId: string, name: string, description: string) => {
    const newTask: Task = {
      id: `task-${Date.now()}`,
      name,
      description,
      startedDate: new Date().toISOString().split('T')[0],
      timeSpent: 0,
      todos: [],
    };
    globalProjects = globalProjects.map((p) =>
      p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
    );
    notify();
  }, []);

  const getProject = useCallback((id: string) => {
    return globalProjects.find((p) => p.id === id);
  }, []);

  return {
    projects: globalProjects,
    addProject,
    addTask,
    getProject,
  };
}
