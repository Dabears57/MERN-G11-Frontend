import { jwtDecode } from 'jwt-decode';

const TOKEN_KEY = 'tt_token';

interface JwtPayload {
  firstName?: string;
  name?: string;
  email?: string;
  [key: string]: unknown;
}

export function saveToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function isLoggedIn(): boolean {
  return getToken() !== null;
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export function getUserName(): string {
  const token = getToken();
  if (!token) return '';
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.firstName || decoded.name || '';
  } catch {
    return '';
  }
}

export function getUserInitial(): string {
  const name = getUserName();
  if (!name) return '';
  return name.charAt(0).toUpperCase();
}

export function getUserEmail(): string {
  const token = getToken();
  if (!token) return '';
  try {
    const decoded = jwtDecode<JwtPayload>(token);
    return decoded.email || '';
  } catch {
    return '';
  }
}
