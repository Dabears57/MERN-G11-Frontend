import { apiPost, apiPut, apiDelete } from './apiClient.ts';
import type { ApiTask } from '../types/index.ts';

export async function createTask(
  projectId: string,
  name: string,
  description: string
): Promise<{ data?: ApiTask; error?: string }> {
  const res = await apiPost<ApiTask>('api/tasks/create', { projectId, name, description });
  return { data: res.data, error: res.error };
}

export async function fetchTasksForProject(projectId: string): Promise<{ data?: ApiTask[]; error?: string }> {
  const res = await apiPost<ApiTask[]>('api/tasks/fetch/many', { projectId });
  return { data: res.data, error: res.error };
}

export async function fetchTask(id: string): Promise<{ data?: ApiTask; error?: string }> {
  const res = await apiPost<ApiTask>('api/tasks/fetch/one', { _id: id });
  return { data: res.data, error: res.error };
}

export async function updateTask(
  id: string,
  update: Partial<Pick<ApiTask, 'name' | 'description'>>
): Promise<{ error?: string }> {
  const res = await apiPut('api/tasks/update', { id, update });
  return { error: res.error };
}

export async function deleteTask(id: string): Promise<{ error?: string }> {
  const res = await apiDelete('api/tasks/delete', { id });
  return { error: res.error };
}
