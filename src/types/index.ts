// ── Backend API shapes ──────────────────────────────────────────────────────

export interface ApiProject {
  _id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string | null;
  totalTime: number; // seconds
  userId: string;
}

export interface ApiTask {
  _id: string;
  userId: string;
  projectId: string;
  name: string;
  description: string;
  totalTime: number; // seconds
  createdAt: string;
}

export interface ApiNote {
  _id: string;
  userId: string;
  content: string;
  parentType: 'project' | 'task' | 'session';
  parentId: string;
  createdAt: string;
}

export interface SessionTaskEntry {
  taskId: string;
  totalTime: number; // seconds
  currentTime: string;
  paused: boolean;
}

export interface ApiSession {
  _id: string;
  userId: string;
  projectId: string;
  active: boolean;
  paused: boolean;
  createdAt: string;
  currentTime: string;
  endTime: string | null;
  totalTime: number; // seconds
  tasks: SessionTaskEntry[];
}

export interface SessionStatus {
  status: 'no active session' | 'paused' | 'in-progress';
  currentTimeStamp: string | null;
  timeElapsedSecs: number;
  all?: ApiSession;
}

// Session metadata returned by GET /api/queries/sessions
export interface SessionMetadata {
  _id: string;
  name: string; // e.g. "ProjectName: Session #1"
  startDate: string | null;
  endDate: string | null;
  projectName: string;
}

// Project metadata returned by GET /api/queries/projects
export interface ProjectMetadata {
  _id: string;
  title: string; // backend may return as 'name' during transition — handled in api/queries.ts
  startDate: string | null;
  endDate: string | null;
  totalTime: number; // seconds
}

// Task metadata returned by GET /api/queries/tasks
export interface TaskMetadata {
  _id: string;
  name: string;
  projectName: string;
  totalTime: number; // seconds
  startDate: string | null;
  endDate: string | null;
}

// Full project view from GET /api/queries/project/:id
export interface FullProject {
  project: ApiProject;
  tasks: ApiTask[];
  sessions: ApiSession[];
  notes: ApiNote[];
}

// Full session view from GET /api/queries/session/:id
export interface FullSession {
  session: ApiSession;
  project: ApiProject;
  tasks: Array<{ _id: string; name: string; timeSpent: number }>;
}

// ── UI-only shapes ──────────────────────────────────────────────────────────

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
