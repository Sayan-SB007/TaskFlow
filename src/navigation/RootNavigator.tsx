import React, { useEffect } from 'react';

import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { useAppDispatch } from '../hooks/useAppDispatch';

import { useAppSelector } from '../hooks/useAppSelector';

import { authStateChanged } from '../features/auth/authSlice';

import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from '../features/auth/authSelectors';

import { authService } from '../features/auth/authService';

import { AuthNavigator } from './AuthNavigator';

import { AppNavigator } from './AppNavigator';

import { lightTheme } from '../theme/lightTheme';

import { startSyncListener } from '../features/sync/syncService';

import { SyncStatusBanner } from '../features/sync/SyncStatusBanner';

import { refreshTasks } from '../features/tasks/taskSlice';

export function RootNavigator() {
  const dispatch = useAppDispatch();

  const initialized = useAppSelector(selectAuthInitialized);

  const isAuthenticated = useAppSelector(selectIsAuthenticated);

  /* ================================================= */
  /* FIREBASE AUTH LISTENER                            */
  /* ================================================= */

  useEffect(() => {
    const unsubscribe = authService.subscribe(user => {
      dispatch(
        authStateChanged(
          user
            ? {
                id: user.uid,

                email: user.email,

                displayName: user.displayName,
              }
            : null,
        ),
      );
    });

    return unsubscribe;
  }, [dispatch]);

  /* ================================================= */
  /* TASK / FIRESTORE SYNC LISTENER                   */
  /* ================================================= */

  useEffect(() => {
    /*
     * Do not start synchronization when
     * the user is logged out.
     */
    if (!isAuthenticated) {
      return;
    }

    console.log('SYNC: Starting task sync listener...');

    /*
     * IMPORTANT:
     *
     * When the initial Firestore sync finishes,
     * or when connectivity returns, refresh Redux
     * from SQLite.
     *
     * This fixes:
     *
     * Firebase = 5 tasks
     * SQLite initially = 0
     * Redux initially = 0
     *
     * After sync:
     *
     * Firestore
     *    ↓
     * SQLite = 5
     *    ↓
     * refreshTasks()
     *    ↓
     * Redux = 5
     *    ↓
     * UI = 5
     */
    const unsubscribe = startSyncListener(() => {
      console.log('SYNC: Refreshing Redux from SQLite...');

      void dispatch(refreshTasks());
    });

    return unsubscribe;
  }, [isAuthenticated, dispatch]);

  /* ================================================= */
  /* AUTH INITIALIZATION                               */
  /* ================================================= */

  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={lightTheme.colors.primary} />
      </View>
    );
  }

  /* ================================================= */
  /* NAVIGATION                                        */
  /* ================================================= */

  return (
    <View style={styles.root}>
      {/* ================================================= */}
      {/* SYNC STATUS                                       */}
      {/* ================================================= */}

      <SyncStatusBanner />

      {/* ================================================= */}
      {/* AUTH / APP NAVIGATION                             */}
      {/* ================================================= */}

      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </View>
  );
}

/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({
  root: {
    flex: 1,

    backgroundColor: lightTheme.colors.background,
  },

  loadingContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor: lightTheme.colors.background,
  },
});
