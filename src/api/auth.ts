import { buildPath } from './buildPath.ts';

export async function loginUser(
  email: string,
  password: string
): Promise<{ token?: string; error?: string; message?: string }> {
  try {
    const response = await fetch(buildPath('api/user/login'), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message ?? data.error ?? 'Login failed' };
    }

    return { token: data.token };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

export async function createUser(
  email: string,
  password: string
): Promise<{ message?: string; error?: string }> {
  try {
    const response = await fetch(buildPath('api/user/create'), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.message ?? data.error ?? 'Registration failed' };
    }

    return { message: data.message };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}
