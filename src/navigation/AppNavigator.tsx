import React, {
  Suspense,
  lazy,
} from 'react';

import {
  createBottomTabNavigator,
} from '@react-navigation/bottom-tabs';

import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';

import {
  ActivityIndicator,
  Text,
  View,
  StyleSheet,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

/* ================================================= */
/* LAZY LOADED SCREENS                               */
/* ================================================= */

/*
 * Screens are loaded only when React needs them.
 *
 * This keeps the initial navigation tree lighter
 * and avoids eagerly evaluating every screen module.
 */

const LazyTasksScreen = lazy(
  () =>
    import(
      '../features/tasks/screens/TasksScreen'
    ).then(module => ({
      default: module.TasksScreen,
    })),
);

const LazySettingsScreen = lazy(
  () =>
    import(
      '../features/settings/screens/SettingsScreen'
    ).then(module => ({
      default: module.SettingsScreen,
    })),
);

const LazyTaskFormScreen = lazy(
  () =>
    import(
      '../features/tasks/screens/TaskFormScreen'
    ),
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
/* LAZY SCREEN LOADING                               */
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

      /*
       * Bottom tabs already support lazy
       * rendering. Keep this explicitly enabled
       * for clarity and assignment requirements.
       */
      screenOptions={{
        headerShown: false,

        lazy: true,

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

        tabBarStyle: {
          height: tabBarHeight,

          paddingTop: 6,

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
      >
        {() => (
          <Suspense
            fallback={<ScreenLoader />}
          >
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

          tabBarIcon: ({
            focused,
          }) => (
            <TabIcon
              name="settings"
              focused={focused}
            />
          ),
        }}
      >
        {() => (
          <Suspense
            fallback={<ScreenLoader />}
          >
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
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >

      {/* ================================================= */}
      {/* MAIN TABS                                         */}
      {/* ================================================= */}

      <Stack.Screen
        name="MainTabs"
        component={MainTabs}
      />

      {/* ================================================= */}
      {/* TASK FORM                                         */}
      {/* ================================================= */}

      <Stack.Screen
        name="TaskForm"
      >
        {() => (
          <Suspense
            fallback={<ScreenLoader />}
          >
            <LazyTaskFormScreen />
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

  /* ================================================= */
  /* LAZY LOADING                                     */
  /* ================================================= */

  loadingContainer: {
    flex: 1,

    alignItems: 'center',

    justifyContent: 'center',

    backgroundColor:
      '#F7F8FA',
  },

  loadingText: {
    marginTop: 10,

    fontSize: 13,

    color: '#64748B',

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