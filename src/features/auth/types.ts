export interface AuthUser {
  id: string;
  email: string | null;
  displayName: string | null;
}

export interface AuthState {
  user: AuthUser | null;

  status: 'idle' | 'loading' | 'authenticated' | 'unauthenticated' | 'error';

  initialized: boolean;

  error: string | null;
}
