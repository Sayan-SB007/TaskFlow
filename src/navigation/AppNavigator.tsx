import React from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  Text,
  View,
  StyleSheet,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  TasksScreen,
} from '../features/tasks/screens/TasksScreen';

import {
  SettingsScreen,
} from '../features/settings/screens/SettingsScreen';

import TaskFormScreen from '../features/tasks/screens/TaskFormScreen';

/* ================================================= */
/* TYPES                                             */
/* ================================================= */

export type AppTabParamList = {
  Tasks: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  TaskForm: undefined;
};

/* ================================================= */
/* NAVIGATORS                                        */
/* ================================================= */

const Tab =
  createBottomTabNavigator<AppTabParamList>();

const Stack =
  createNativeStackNavigator<AppStackParamList>();

/* ================================================= */
/* TAB ICON                                          */
/* ================================================= */

function TabIcon({
  name,
  focused,
}: {
  name: 'tasks' | 'settings';
  focused: boolean;
}) {
  return (
    <View
      style={[
        styles.iconContainer,
        focused &&
          styles.iconContainerActive,
      ]}
    >
      <Text
        style={[
          styles.icon,
          focused &&
            styles.iconActive,
        ]}
      >
        {name === 'tasks'
          ? '✓'
          : '⚙'}
      </Text>
    </View>
  );
}

/* ================================================= */
/* MAIN TABS                                         */
/* ================================================= */

function MainTabs() {
  /*
   * Get the device's actual bottom safe area.
   *
   * This handles Android:
   * - Home button
   * - Back button
   * - Gesture navigation area
   *
   * It does NOT change any navigation functionality.
   */
  const insets =
    useSafeAreaInsets();

  /*
   * Keep the original visible tab content
   * approximately the same size.
   */
  const TAB_CONTENT_HEIGHT = 61;

  /*
   * Add the device's safe-area height
   * to the tab bar.
   */
  const tabBarHeight =
    TAB_CONTENT_HEIGHT +
    insets.bottom;

  return (
    <Tab.Navigator
      initialRouteName="Tasks"
      screenOptions={{
        headerShown: false,

        tabBarActiveTintColor:
          '#1769E0',

        tabBarInactiveTintColor:
          '#94A3B8',

        tabBarShowLabel: true,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 4,
        },

        /*
         * ONLY CHANGE:
         *
         * The previous fixed 68px height
         * did not account for the Android
         * system navigation area.
         */
        tabBarStyle: {
          height: tabBarHeight,

          paddingTop: 6,

          /*
           * Keep the tab content above the
           * Android Home / Back area.
           */
          paddingBottom:
            insets.bottom + 7,

          backgroundColor:
            '#FFFFFF',

          borderTopWidth: 1,

          borderTopColor:
            '#E8ECF2',

          elevation: 12,

          shadowColor:
            '#000000',

          shadowOffset: {
            width: 0,
            height: -3,
          },

          shadowOpacity: 0.05,

          shadowRadius: 10,
        },
      }}
    >
      {/* ================================================= */}
      {/* TASKS                                             */}
      {/* ================================================= */}

      <Tab.Screen
        name="Tasks"
        component={TasksScreen}
        options={{
          tabBarLabel: 'Tasks',

          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              name="tasks"
              focused={focused}
            />
          ),
        }}
      />

      {/* ================================================= */}
      {/* SETTINGS                                          */}
      {/* ================================================= */}

      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Settings',

          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              name="settings"
              focused={focused}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

/* ================================================= */
/* APP NAVIGATOR                                     */
/* ================================================= */

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      <Stack.Screen
        name="TaskForm"
        component={TaskFormScreen}
      />
    </Stack.Navigator>
  );
}

/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({
  iconContainer: {
    width: 32,
    height: 28,
    borderRadius: 10,

    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainerActive: {
    backgroundColor:
      '#EAF2FF',
  },

  icon: {
    fontSize: 18,
    color: '#94A3B8',
    fontWeight: '700',
  },

  iconActive: {
    color: '#1769E0',
  },
});