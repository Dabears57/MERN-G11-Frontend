import { buildPath } from './buildPath.ts';
import { getToken } from '../hooks/useAuth.ts';

export function authHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

export async function apiGet<T>(route: string): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(buildPath(route), { headers: authHeaders() });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? json.message ?? 'Request failed' };
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function apiPost<T>(route: string, body: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(buildPath(route), {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? json.message ?? 'Request failed' };
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function apiPut<T>(route: string, body: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(buildPath(route), {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? json.message ?? 'Request failed' };
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: 'Network error' };
  }
}

export async function apiDelete<T>(route: string, body: unknown): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const res = await fetch(buildPath(route), {
      method: 'DELETE',
      headers: authHeaders(),
      body: JSON.stringify(body),
    });
    const json = await res.json();
    if (!res.ok) return { success: false, error: json.error ?? json.message ?? 'Request failed' };
    return { success: true, data: json.data };
  } catch {
    return { success: false, error: 'Network error' };
  }
}
