import { apiPost, apiPut, apiDelete } from './apiClient.ts';
import type { ApiProject } from '../types/index.ts';

export async function createProject(
  title: string,
  description: string
): Promise<{ data?: ApiProject; error?: string }> {
  const res = await apiPost<ApiProject>('api/projects/create', { title, description });
  return { data: res.data, error: res.error };
}

export async function fetchProjects(): Promise<{ data?: ApiProject[]; error?: string }> {
  const res = await apiPost<ApiProject[]>('api/projects/fetch/many', {});
  return { data: res.data, error: res.error };
}

export async function fetchProject(id: string): Promise<{ data?: ApiProject; error?: string }> {
  const res = await apiPost<ApiProject>('api/projects/fetch/one', { _id: id });
  return { data: res.data, error: res.error };
}

export async function updateProject(
  id: string,
  update: Partial<Pick<ApiProject, 'title' | 'description' | 'endDate'>>
): Promise<{ error?: string }> {
  const res = await apiPut('api/projects/update', { id, update });
  return { error: res.error };
}

export async function deleteProject(id: string): Promise<{ error?: string }> {
  const res = await apiDelete('api/projects/delete', { id });
  return { error: res.error };
}
