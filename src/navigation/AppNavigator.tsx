import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import type {AppStackParamList} from './types';
import SettingsScreen from '../features/settings/screens/SettingsScreen';
import TaskFormScreen from '../features/tasks/screens/TaskFormScreen';
import {TasksScreen} from '../features/tasks/screens/TasksScreen';

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen
        name="Tasks"
        component={TasksScreen}
      />

      <Stack.Screen
        name="TaskForm"
        component={TaskFormScreen}
      />

      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
      />
    </Stack.Navigator>
  );
}