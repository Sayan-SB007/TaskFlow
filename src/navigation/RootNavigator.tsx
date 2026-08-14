import React, {useEffect} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {useAppDispatch} from '../hooks/useAppDispatch';
import {useAppSelector} from '../hooks/useAppSelector';

import {
  authStateChanged,
} from '../features/auth/authSlice';

import {
  selectAuthInitialized,
  selectIsAuthenticated,
} from '../features/auth/authSelectors';

import {authService} from '../features/auth/authService';

import {AuthNavigator} from './AuthNavigator';
import {AppNavigator} from './AppNavigator';

import {lightTheme} from '../theme/lightTheme';

export function RootNavigator() {
  const dispatch = useAppDispatch();

  const initialized = useAppSelector(
    selectAuthInitialized,
  );

  const isAuthenticated = useAppSelector(
    selectIsAuthenticated,
  );

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

  /*
   * Firebase is checking whether a previous
   * session exists.
   */
  if (!initialized) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={lightTheme.colors.primary}
        />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor:
      lightTheme.colors.background,
  },
});