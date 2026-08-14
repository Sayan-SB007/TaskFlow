import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import type { AuthStackParamList } from './types';
import SignupScreen from '../features/auth/screens/SignupScreen';
import LoginScreen from '../features/auth/screens/LoginScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Login"
        component={LoginScreen}
      />

      <Stack.Screen
        name="Signup"
        component={SignupScreen}
      />
    </Stack.Navigator>
  );
}