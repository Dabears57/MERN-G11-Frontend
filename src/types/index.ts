export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: string;
}

export interface Task {
  id: string;
  name: string;
  description: string;
  startedDate: string;
  finishedDate?: string;
  timeSpent: number;
  todos: Todo[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate?: string;
  timeSpent: number;
  tasks: Task[];
  progress: number;
}

export interface Break {
  startTime: string;
  endTime: string;
  reason: string;
}

export interface Session {
  id: string;
  startTime: string;
  endTime: string;
  projectId: string;
  projectTitle: string;
  taskName: string;
  tasksWorkedOn: string[];
  breaks: Break[];
  duration: string;
}

export interface HeatmapCell {
  day: number;
  week: number;
  intensity: number;
}

export interface StatCardData {
  label: string;
  value: string;
  subtitle?: string;
  trend?: 'up' | 'down';
  variant?: 'default' | 'primary';
}

export interface TaskTimeEntry {
  taskId: string;
  taskName: string;
  accumulated: number; // seconds
}
