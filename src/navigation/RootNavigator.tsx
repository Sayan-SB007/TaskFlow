import React from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {TasksScreen} from '../features/tasks/screens/TasksScreen';

export type RootStackParamList = {
  Tasks: undefined;
};

const Stack =
  createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen
          name="Tasks"
          component={TasksScreen}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}