import { apiGet } from './apiClient.ts';
import type {
  ProjectMetadata,
  SessionMetadata,
  TaskMetadata,
  FullProject,
  FullSession,
} from '../types/index.ts';

// The backend currently returns 'name' instead of 'title' for projects — normalise here.
function normaliseProject(p: Record<string, unknown>): ProjectMetadata {
  return {
    _id: p._id as string,
    title: (p.title ?? p.name ?? '') as string,
    startDate: (p.startDate ?? null) as string | null,
    endDate: (p.endDate ?? null) as string | null,
    totalTime: (p.totalTime ?? 0) as number,
  };
}

// The backend currently returns 'startDate'/'endDate' mapped from 'createdAt'/'endTime' — normalise here.
function normaliseSession(s: Record<string, unknown>): SessionMetadata {
  return {
    _id: s._id as string,
    name: (s.name ?? '') as string,
    startDate: ((s.startDate ?? s.createdAt) ?? null) as string | null,
    endDate: ((s.endDate ?? s.endTime) ?? null) as string | null,
    projectName: (s.projectName ?? '') as string,
  };
}

export async function listProjects(): Promise<{ data?: ProjectMetadata[]; error?: string }> {
  const res = await apiGet<Record<string, unknown>[]>('api/queries/projects');
  if (!res.success || !res.data) return { error: res.error };
  return { data: res.data.map(normaliseProject) };
}

export async function listSessions(): Promise<{ data?: SessionMetadata[]; error?: string }> {
  const res = await apiGet<Record<string, unknown>[]>('api/queries/sessions');
  if (!res.success || !res.data) return { error: res.error };
  return { data: res.data.map(normaliseSession) };
}

export async function listTasks(): Promise<{ data?: TaskMetadata[]; error?: string }> {
  const res = await apiGet<TaskMetadata[]>('api/queries/tasks');
  return { data: res.data, error: res.error };
}

export async function getFullProject(id: string): Promise<{ data?: FullProject; error?: string }> {
  const res = await apiGet<FullProject>(`api/queries/project/${id}`);
  return { data: res.data, error: res.error };
}

export async function getFullSession(id: string): Promise<{ data?: FullSession; error?: string }> {
  const res = await apiGet<FullSession>(`api/queries/session/${id}`);
  return { data: res.data, error: res.error };
}
