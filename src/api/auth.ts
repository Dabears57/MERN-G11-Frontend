import { buildPath } from './buildPath.ts';

export async function loginUser(
  email: string,
  password: string
): Promise<{ token?: string; error?: string; emailNotVerified?: boolean }> {
  try {
    const response = await fetch(buildPath('api/users/login'), {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorCode = data.error ?? data.message ?? 'Login failed';
      return {
        error: errorCode,
        emailNotVerified: data.error === 'EMAIL_NOT_VERIFIED',
      };
    }

    return { token: data.data?.token };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

export async function createUser(
  email: string,
  password: string,
  firstName: string
): Promise<{ message?: string; error?: string; verificationLink?: string }> {
  try {
    const response = await fetch(buildPath('api/users/create'), {
      method: 'POST',
      body: JSON.stringify({ email, password, firstName }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error ?? data.message ?? 'Registration failed' };
    }

    return {
      message: data.message,
      verificationLink: data.data?.verificationLink,
    };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

export async function verifyEmail(
  token: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const response = await fetch(buildPath(`api/users/verify?token=${encodeURIComponent(token)}`));
    const data = await response.json();

    if (!response.ok) {
      return { error: data.error ?? data.message ?? 'Verification failed' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

export async function resendVerification(
  email: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const response = await fetch(buildPath('api/users/verify/regen'), {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error ?? data.message ?? 'Failed to resend' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}

export async function requestPasswordReset(
  email: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const response = await fetch(buildPath('api/users/password/reset/request'), {
      method: 'POST',
      body: JSON.stringify({ email }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error ?? data.message ?? 'Request failed' };
    }

    return { success: true };
  } catch {
    // Treat network/no-response as success to avoid leaking whether email exists
    return { success: true };
  }
}

export async function resetPassword(
  token: string,
  newPassword: string
): Promise<{ success?: boolean; error?: string }> {
  try {
    const response = await fetch(buildPath('api/users/password/reset'), {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json();

    if (!response.ok) {
      return { error: data.error ?? data.message ?? 'Reset failed' };
    }

    return { success: true };
  } catch {
    return { error: 'Network error. Please try again.' };
  }
}
