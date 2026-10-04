export interface AuthUser {
  id: string;
  name?: string;
  email?: string;
  role?: { id?: string; name?: string } | string;
}

const TOKEN_KEY = "token";
const USER_KEY = "user";

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function getCurrentUser(): AuthUser | null {
  const value = localStorage.getItem(USER_KEY);
  if (!value) return null;
  try {
    return JSON.parse(value) as AuthUser;
  } catch {
    clearAuthSession();
    return null;
  }
}

export function saveAuthSession(token: string, user: AuthUser) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}
