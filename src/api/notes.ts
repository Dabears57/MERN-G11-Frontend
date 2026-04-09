import { apiPost, apiPut, apiDelete } from './apiClient.ts';
import type { ApiNote } from '../types/index.ts';

export async function createNote(
  content: string,
  parentType: ApiNote['parentType'],
  parentId: string
): Promise<{ data?: ApiNote; error?: string }> {
  const res = await apiPost<ApiNote>('api/notes/create', { content, parentType, parentId });
  return { data: res.data, error: res.error };
}

export async function fetchNotesFor(
  parentType: ApiNote['parentType'],
  parentId: string
): Promise<{ data?: ApiNote[]; error?: string }> {
  const res = await apiPost<ApiNote[]>('api/notes/fetch/many', { parentType, parentId });
  return { data: res.data, error: res.error };
}

export async function updateNote(noteId: string, content: string): Promise<{ error?: string }> {
  const res = await apiPut('api/notes/edit', { noteId, content });
  return { error: res.error };
}

export async function deleteNote(id: string): Promise<{ error?: string }> {
  const res = await apiDelete('api/notes/delete', { id });
  return { error: res.error };
}
