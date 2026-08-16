import React, {
  Suspense,
  lazy,
} from 'react';

import {
  ActivityIndicator,
  StyleSheet,
  View,
  Text,
} from 'react-native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import type {
  AuthStackParamList,
} from './types';

/* ================================================= */
/* LAZY LOADED AUTH SCREENS                          */
/* ================================================= */

const LazyLoginScreen = lazy(
  () =>
    import(
      '../features/auth/screens/LoginScreen'
    ),
);

const LazySignupScreen = lazy(
  () =>
    import(
      '../features/auth/screens/SignupScreen'
    ),
);

/* ================================================= */
/* NAVIGATOR                                         */
/* ================================================= */

const Stack =
  createNativeStackNavigator<AuthStackParamList>();

/* ================================================= */
/* LOADING                                           */
/* ================================================= */

function ScreenLoader() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator
        size="large"
        color="#1769E0"
      />

      <Text style={styles.loadingText}>
        Loading...
      </Text>
    </View>
  );
}

/* ================================================= */
/* AUTH NAVIGATOR                                    */
/* ================================================= */

export function AuthNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ================================================= */}
      {/* LOGIN                                             */}
      {/* ================================================= */}

      <Stack.Screen
        name="Login"
        options={{
          headerShown: false,
        }}
      >
        {props => (
          <Suspense fallback={<ScreenLoader />}>
            <LazyLoginScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>

      {/* ================================================= */}
      {/* SIGNUP                                            */}
      {/* ================================================= */}

      <Stack.Screen
        name="Signup"
        options={{
          headerShown: false,
        }}
      >
        {props => (
          <Suspense fallback={<ScreenLoader />}>
            <LazySignupScreen {...props} />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
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
    backgroundColor: '#F7F8FA',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
});