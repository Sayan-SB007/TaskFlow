import React, { Suspense, lazy } from 'react';

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { ActivityIndicator, Text, View, StyleSheet } from 'react-native';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Task } from '../features/tasks/types';
import { useTheme } from '../app/providers/ThemeProvider';

/* ================================================= */
/* LAZY LOADED SCREENS                               */
/* ================================================= */

/*
 * Screens are loaded only when React needs them.
 *
 * This keeps the initial navigation tree lighter
 * and avoids eagerly evaluating every screen module.
 */

const LazyTasksScreen = lazy(() =>
  import('../features/tasks/screens/TasksScreen').then(module => ({
    default: module.TasksScreen,
  })),
);

const LazySettingsScreen = lazy(() =>
  import('../features/settings/screens/SettingsScreen').then(module => ({
    default: module.SettingsScreen,
  })),
);

const LazyTaskFormScreen = lazy(() =>
  import('../features/tasks/components/TaskFormSheet').then(module => ({
    default: module.TaskFormSheet,
  })),
);

/* ================================================= */
/* TYPES                                             */
/* ================================================= */

export type AppTabParamList = {
  Tasks: undefined;
  Settings: undefined;
};

export type AppStackParamList = {
  MainTabs: undefined;
  TaskForm:
    | {
        task?: Task | null;
      }
    | undefined;
};
/* ================================================= */
/* NAVIGATORS                                        */
/* ================================================= */

const Tab = createBottomTabNavigator<AppTabParamList>();

const Stack = createNativeStackNavigator<AppStackParamList>();

/* ================================================= */
/* LAZY SCREEN LOADING                               */
/* ================================================= */

type AppTheme = ReturnType<typeof useTheme>['theme'];

function ScreenLoader() {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#1769E0" />

      <Text style={styles.loadingText}>Loading...</Text>
    </View>
  );
}

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
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <View style={[styles.iconContainer, focused && styles.iconContainerActive]}>
      <Text style={[styles.icon, focused && styles.iconActive]}>
        {name === 'tasks' ? '✓' : '⚙'}
      </Text>
    </View>
  );
}

/* ================================================= */
/* MAIN TABS                                         */
/* ================================================= */

function MainTabs() {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  /*
   * Get the device's actual bottom safe area.
   *
   * This handles Android:
   * - Home button
   * - Back button
   * - Gesture navigation area
   */
  const insets = useSafeAreaInsets();

  /*
   * Keep the original visible tab content
   * approximately the same size.
   */
  const TAB_CONTENT_HEIGHT = 61;

  /*
   * Add the device's safe-area height
   * to the tab bar.
   */
  const tabBarHeight = TAB_CONTENT_HEIGHT + insets.bottom;

  return (
    <Tab.Navigator
      initialRouteName="Tasks"
      /*
       * Bottom tabs already support lazy
       * rendering. Keep this explicitly enabled
       * for clarity and assignment requirements.
       */
      screenOptions={{
        headerShown: false,

        lazy: true,

        tabBarActiveTintColor: theme.colors.primary,

        tabBarInactiveTintColor: theme.colors.textMuted,

        tabBarShowLabel: true,

        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '700',
          marginBottom: 4,
        },

        tabBarStyle: {
          height: tabBarHeight,

          paddingTop: 6,

          paddingBottom: insets.bottom + 7,

          backgroundColor: theme.colors.surface,

          borderTopWidth: 1,

          borderTopColor: theme.colors.border,

          elevation: 12,

          shadowColor: '#000000',

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
        options={{
          tabBarLabel: 'Tasks',

          tabBarIcon: ({ focused }) => (
            <TabIcon name="tasks" focused={focused} />
          ),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <LazyTasksScreen />
          </Suspense>
        )}
      </Tab.Screen>

      {/* ================================================= */}
      {/* SETTINGS                                          */}
      {/* ================================================= */}

      <Tab.Screen
        name="Settings"
        options={{
          tabBarLabel: 'Settings',

          tabBarIcon: ({ focused }) => (
            <TabIcon name="settings" focused={focused} />
          ),
        }}
      >
        {() => (
          <Suspense fallback={<ScreenLoader />}>
            <LazySettingsScreen />
          </Suspense>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

/* ================================================= */
/* APP NAVIGATOR                                     */
/* ================================================= */

export function AppNavigator() {
  const { theme } = useTheme();

  const styles = createStyles(theme);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      {/* ================================================= */}
      {/* MAIN TABS                                         */}
      {/* ================================================= */}

      <Stack.Screen name="MainTabs" component={MainTabs} />

      {/* ============================================================ */}
      {/* TASK FORM                                                     */}
      {/* ============================================================ */}

      <Stack.Screen
        name="TaskForm"
        options={{
          presentation: 'transparentModal',
          animation: 'slide_from_bottom',
          headerShown: false,
          contentStyle: {
            backgroundColor: 'transparent',
          },
        }}
      >
        {({ navigation, route }) => (
          <Suspense
            fallback={
              <View
                style={{
                  flex: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <ActivityIndicator size="large" />
              </View>
            }
          >
            <LazyTaskFormScreen
              visible={true}
              task={route.params?.task}
              onClose={() => navigation.goBack()}
            />
          </Suspense>
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const createStyles = (theme: AppTheme) =>
  StyleSheet.create({
    /* ================================================= */
    /* LAZY LOADING                                     */
    /* ================================================= */

    loadingContainer: {
      flex: 1,

      alignItems: 'center',

      justifyContent: 'center',

      backgroundColor: theme.colors.background,
    },

    loadingText: {
      marginTop: 10,

      fontSize: 13,

      color: theme.colors.textSecondary,

      fontWeight: '600',
    },

    /* ================================================= */
    /* TAB ICON                                          */
    /* ================================================= */

    iconContainer: {
      width: 32,
      height: 28,

      borderRadius: 10,

      alignItems: 'center',
      justifyContent: 'center',
    },

    iconContainerActive: {
      backgroundColor: theme.colors.primarySoft,
    },

    icon: {
      fontSize: 18,

      color: theme.colors.textMuted,

      fontWeight: '700',
    },

    iconActive: {
      color: theme.colors.primary,
    },
  });
