import { apiPost, apiGet } from './apiClient.ts';
import type { ApiSession, SessionStatus } from '../types/index.ts';

export async function createSession(projectId: string): Promise<{ error?: string }> {
  const res = await apiPost('api/sessions/create', { projectId });
  return { error: res.error };
}

export async function startSession(): Promise<{ data?: ApiSession; error?: string }> {
  const res = await apiGet<ApiSession>('api/sessions/start');
  return { data: res.data, error: res.error };
}

export async function pauseSession(): Promise<{ data?: ApiSession; error?: string }> {
  const res = await apiGet<ApiSession>('api/sessions/pause');
  return { data: res.data, error: res.error };
}

export async function stopSession(): Promise<{ data?: ApiSession; error?: string }> {
  const res = await apiGet<ApiSession>('api/sessions/stop');
  return { data: res.data, error: res.error };
}

export async function getSessionStatus(): Promise<{ data?: SessionStatus; error?: string }> {
  const res = await apiGet<SessionStatus>('api/sessions/status');
  return { data: res.data, error: res.error };
}

export async function addTaskToSession(taskId: string): Promise<{ data?: ApiSession; error?: string }> {
  const res = await apiPost<ApiSession>('api/sessions/task/add', { taskId });
  return { data: res.data, error: res.error };
}

export async function removeTaskFromSession(taskId: string): Promise<{ data?: ApiSession; error?: string }> {
  const res = await apiPost<ApiSession>('api/sessions/task/remove', { taskId });
  return { data: res.data, error: res.error };
}
