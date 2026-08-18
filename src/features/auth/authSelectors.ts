import type { RootState } from '../../app/store';

export const selectAuthUser = (state: RootState) => state.auth.user;

export const selectAuthStatus = (state: RootState) => state.auth.status;

export const selectAuthInitialized = (state: RootState) =>
  state.auth.initialized;

export const selectAuthError = (state: RootState) => state.auth.error;

export const selectIsAuthenticated = (state: RootState) =>
  Boolean(state.auth.user);
