import React, {
  useEffect,
} from 'react';

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

import {
  SyncStatusBanner,
} from '../features/sync/SyncStatusBanner';


export function RootNavigator() {

  const dispatch =
    useAppDispatch();


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

                  email:
                    user.email,

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

    if (!isAuthenticated) {
      return;
    }


    console.log(
      'SYNC: Starting task sync listener...',
    );


    const unsubscribe =
      startSyncListener();


    return unsubscribe;

  }, [isAuthenticated]);


  /* ================================================= */
  /* AUTH INITIALIZATION                               */
  /* ================================================= */

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
    <View
      style={
        styles.root
      }>

      {/* ============================================= */}
      {/* SYNC STATUS                                   */}
      {/* ============================================= */}

      {isAuthenticated && (
        <SyncStatusBanner />
      )}


      {/* ============================================= */}
      {/* NAVIGATION                                    */}
      {/* ============================================= */}

      <View
        style={
          styles.navigation
        }>

        <NavigationContainer>

          {isAuthenticated ? (
            <AppNavigator />
          ) : (
            <AuthNavigator />
          )}

        </NavigationContainer>

      </View>

    </View>
  );
}


/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({

  root: {
    flex: 1,

    backgroundColor:
      lightTheme.colors.background,
  },


  navigation: {
    flex: 1,
  },


  loadingContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      lightTheme.colors.background,
  },

});