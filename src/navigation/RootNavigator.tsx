import React, {useEffect} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  useAppDispatch,
} from '../hooks/useAppDispatch';

import {
  useAppSelector,
} from '../hooks/useAppSelector';

import {
  authStateChanged,
} from '../features/auth/authSlice';

import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from '../features/auth/authSelectors';

import {
  authService,
} from '../features/auth/authService';

import {
  AuthNavigator,
} from './AuthNavigator';

import {
  AppNavigator,
} from './AppNavigator';

import {
  lightTheme,
} from '../theme/lightTheme';

import {
  startSyncListener,
} from '../features/sync/syncService';


export function RootNavigator() {
  const dispatch = useAppDispatch();

  const initialized =
    useAppSelector(
      selectAuthInitialized,
    );

  const isAuthenticated =
    useAppSelector(
      selectIsAuthenticated,
    );


  /* ================================================= */
  /* FIREBASE AUTH LISTENER                            */
  /* ================================================= */

  useEffect(() => {
    const unsubscribe =
      authService.subscribe(user => {
        dispatch(
          authStateChanged(
            user
              ? {
                  id: user.uid,
                  email: user.email,
                  displayName:
                    user.displayName,
                }
              : null,
          ),
        );
      });

    return unsubscribe;
  }, [dispatch]);


  /* ================================================= */
  /* FIRESTORE SYNC LISTENER                           */
  /* ================================================= */

  useEffect(() => {
    /*
     * Authentication has not completed yet.
     *
     * We don't start Firestore sync until
     * Firebase tells us that the user is
     * authenticated.
     */
    if (!isAuthenticated) {
      return;
    }

    console.log(
      'SYNC: Starting task sync listener...',
    );

    const unsubscribe =
      startSyncListener();

    /*
     * Stop listening for network changes
     * when the user logs out.
     */
    return unsubscribe;
  }, [isAuthenticated]);


  /* ================================================= */
  /* AUTH INITIALIZATION                               */
  /* ================================================= */

  /*
   * IMPORTANT:
   *
   * This return comes AFTER all hooks.
   *
   * Never put this before the sync useEffect.
   */
  if (!initialized) {
    return (
      <View
        style={
          styles.loadingContainer
        }>

        <ActivityIndicator
          size="large"
          color={
            lightTheme.colors.primary
          }
        />

      </View>
    );
  }


  /* ================================================= */
  /* NAVIGATION                                        */
  /* ================================================= */

  return (
    <NavigationContainer>

      {isAuthenticated ? (
        <AppNavigator />
      ) : (
        <AuthNavigator />
      )}

    </NavigationContainer>
  );
}


/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({

  loadingContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      lightTheme.colors.background,
  },

});