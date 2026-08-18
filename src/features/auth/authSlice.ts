import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';

import type { User } from 'firebase/auth';

import { authService } from './authService';
import type { AuthState, AuthUser } from './types';

const mapUser = (user: User | null): AuthUser | null => {
  if (!user) {
    return null;
  }

  return {
    id: user.uid,
    email: user.email,
    displayName: user.displayName,
  };
};

const getErrorMessage = (error: unknown): string => {
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String((error as { message: unknown }).message);
  }

  return 'Something went wrong.';
};

/* ================================================= */
/* SIGN UP                                           */
/* ================================================= */

export const signUp = createAsyncThunk(
  'auth/signUp',
  async (
    payload: {
      email: string;
      password: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const user = await authService.signUp(payload.email, payload.password);

      return mapUser(user);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* ================================================= */
/* LOGIN                                             */
/* ================================================= */

export const login = createAsyncThunk(
  'auth/login',
  async (
    payload: {
      email: string;
      password: string;
    },
    { rejectWithValue },
  ) => {
    try {
      const user = await authService.login(payload.email, payload.password);

      return mapUser(user);
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* ================================================= */
/* LOGOUT                                            */
/* ================================================= */

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
    } catch (error) {
      return rejectWithValue(getErrorMessage(error));
    }
  },
);

/* ================================================= */
/* INITIAL STATE                                     */
/* ================================================= */

const initialState: AuthState = {
  user: null,

  status: 'idle',

  initialized: false,

  error: null,
};

/* ================================================= */
/* SLICE                                             */
/* ================================================= */

const authSlice = createSlice({
  name: 'auth',

  initialState,

  reducers: {
    authStateChanged: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;

      state.initialized = true;

      state.status = action.payload ? 'authenticated' : 'unauthenticated';

      state.error = null;
    },

    clearAuthError: state => {
      state.error = null;
    },
  },

  extraReducers: builder => {
    /* SIGN UP */

    builder.addCase(signUp.pending, state => {
      state.status = 'loading';
      state.error = null;
    });

    builder.addCase(signUp.fulfilled, (state, action) => {
      state.user = action.payload;
      state.status = 'authenticated';
      state.initialized = true;
      state.error = null;
    });

    builder.addCase(signUp.rejected, (state, action) => {
      state.status = 'error';

      state.error = action.payload as string;
    });

    /* LOGIN */

    builder.addCase(login.pending, state => {
      state.status = 'loading';
      state.error = null;
    });

    builder.addCase(login.fulfilled, (state, action) => {
      state.user = action.payload;
      state.status = 'authenticated';
      state.initialized = true;
      state.error = null;
    });

    builder.addCase(login.rejected, (state, action) => {
      state.status = 'error';

      state.error = action.payload as string;
    });

    /* LOGOUT */

    builder.addCase(logout.fulfilled, state => {
      state.user = null;
      state.status = 'unauthenticated';
      state.error = null;
    });
  },
});

/* ================================================= */
/* ACTIONS                                           */
/* ================================================= */

export const { authStateChanged, clearAuthError } = authSlice.actions;

/* ================================================= */
/* SELECTORS                                         */
/* ================================================= */

export const selectAuthUser = (state: { auth: AuthState }) => state.auth.user;

export const selectAuthStatus = (state: { auth: AuthState }) =>
  state.auth.status;

export const selectAuthInitialized = (state: { auth: AuthState }) =>
  state.auth.initialized;

/* ================================================= */
/* REDUCER                                           */
/* ================================================= */

export default authSlice.reducer;
