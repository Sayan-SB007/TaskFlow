import React, {
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ActivityIndicator,
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useSafeAreaInsets,
} from 'react-native-safe-area-context';

import {
  useAppDispatch,
} from '../../../hooks/useAppDispatch';

import {
  useAppSelector,
} from '../../../hooks/useAppSelector';

import {
  selectCompletedCount,
  selectProgress,
  selectRemainingCount,
  selectTaskCount,
  selectTaskFilter,
  selectVisibleTasks,
} from '../taskSelectors';

import {
  deleteTask,
  loadTasks,
  setFilter,
  toggleTask,
} from '../taskSlice';

import type {
  Task,
  TaskFilter,
} from '../types';

import {
  TaskCard,
} from '../components/TaskCard';

import {
  ProductivityCard,
} from '../components/ProductivityCard';

import {
  TaskFormSheet,
} from '../components/TaskFormSheet';

import {
  TaskDetailsSheet,
} from '../components/TaskDetailsSheet';

import {
  lightTheme,
} from '../../../theme/lightTheme';

import {
  spacing,
} from '../../../theme/spacing';

import {
  typography,
} from '../../../theme/typography';

import {
  shadows,
} from '../../../theme/shadows';

import {
  debugTasks,
} from '../../../database/debug';

import {
  firebaseAuth,
} from '../../../config/firebase';


/* ================================================= */
/* FILTERS                                           */
/* ================================================= */

const FILTERS: {
  label: string;
  value: TaskFilter;
}[] = [
    {
      label: 'All',
      value: 'all',
    },
    {
      label: 'Today',
      value: 'today',
    },
    {
      label: 'Upcoming',
      value: 'upcoming',
    },
  ];


/* ================================================= */
/* GREETING                                          */
/* ================================================= */

const getGreeting = (): string => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good morning';
  }

  if (hour >= 12 && hour < 17) {
    return 'Good afternoon';
  }

  if (hour >= 17 && hour < 21) {
    return 'Good evening';
  }

  return 'Good night';
};


/* ================================================= */
/* SCREEN                                             */
/* ================================================= */

export function TasksScreen() {
  const dispatch = useAppDispatch();

  const insets = useSafeAreaInsets();


  /* ================================================= */
  /* UI STATE                                           */
  /* ================================================= */

  const [formVisible, setFormVisible] =
    useState(false);

  const [detailsVisible, setDetailsVisible] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState<Task | null>(null);

  const [deleteVisible, setDeleteVisible] =
    useState(false);

  const [taskToDelete, setTaskToDelete] =
    useState<Task | null>(null);


  /* ================================================= */
  /* REDUX STATE                                        */
  /* ================================================= */

  const tasks = useAppSelector(
    selectVisibleTasks,
  );

  const filter = useAppSelector(
    selectTaskFilter,
  );

  const total = useAppSelector(
    selectTaskCount,
  );

  const completed = useAppSelector(
    selectCompletedCount,
  );

  const remaining = useAppSelector(
    selectRemainingCount,
  );

  const progress = useAppSelector(
    selectProgress,
  );

  const taskStatus = useAppSelector(
    state => state.tasks.status,
  );

  const taskOperation = useAppSelector(
    state => state.tasks.operation,
  );


  /* ================================================= */
  /* CURRENT USER                                      */
  /* ================================================= */

  const currentUser =
    firebaseAuth.currentUser;

  const userName =
    currentUser?.displayName?.trim() ||
    'there';

  const greeting =
    getGreeting();


  /* ================================================= */
  /* DATABASE INITIALIZATION                           */
  /* ================================================= */

  useEffect(() => {
    dispatch(loadTasks());

    debugTasks();
  }, [dispatch]);


  /* ================================================= */
  /* LOADING MESSAGE                                   */
  /* ================================================= */

  const loadingMessage =
    taskOperation === 'create'
      ? 'Creating task...'
      : taskOperation === 'update'
        ? 'Updating task...'
        : taskOperation === 'delete'
          ? 'Deleting task...'
          : taskOperation === 'toggle'
            ? 'Updating task...'
            : 'Loading tasks...';


  /* ================================================= */
  /* TASK TOGGLE                                       */
  /* ================================================= */

  const handleToggle = useCallback(
    (task: Task) => {
      if (taskStatus === 'loading') {
        return;
      }

      dispatch(
        toggleTask(task.id),
      );
    },
    [
      dispatch,
      taskStatus,
    ],
  );


  /* ================================================= */
  /* TASK PRESS                                        */
  /* ================================================= */

  const handleTaskPress = useCallback(
    (task: Task) => {
      if (taskStatus === 'loading') {
        return;
      }

      setSelectedTask(task);

      setDetailsVisible(true);
    },
    [taskStatus],
  );


  /* ================================================= */
  /* FILTER                                            */
  /* ================================================= */

  const handleFilter = useCallback(
    (value: TaskFilter) => {
      if (taskStatus === 'loading') {
        return;
      }

      dispatch(
        setFilter(value),
      );
    },
    [
      dispatch,
      taskStatus,
    ],
  );


  /* ================================================= */
  /* CREATE                                             */
  /* ================================================= */

  const handleCreateTask = useCallback(() => {
    if (taskStatus === 'loading') {
      return;
    }

    setSelectedTask(null);

    setFormVisible(true);
  }, [taskStatus]);


  /* ================================================= */
  /* CLOSE FORM                                        */
  /* ================================================= */

  const handleCloseForm = useCallback(() => {
    if (taskStatus === 'loading') {
      return;
    }

    setFormVisible(false);

    setSelectedTask(null);
  }, [taskStatus]);


  /* ================================================= */
  /* CLOSE DETAILS                                     */
  /* ================================================= */

  const handleCloseDetails =
    useCallback(() => {
      if (taskStatus === 'loading') {
        return;
      }

      setDetailsVisible(false);

      setSelectedTask(null);
    }, [taskStatus]);


  /* ================================================= */
  /* COMPLETE FROM DETAILS                             */
  /* ================================================= */

  const handleToggleFromDetails =
    useCallback(
      (task: Task) => {
        if (taskStatus === 'loading') {
          return;
        }

        dispatch(
          toggleTask(task.id),
        );
      },
      [
        dispatch,
        taskStatus,
      ],
    );


  /* ================================================= */
  /* EDIT                                              */
  /* ================================================= */

  const handleEditTask =
    useCallback(
      (task: Task) => {
        if (taskStatus === 'loading') {
          return;
        }

        setDetailsVisible(false);

        setSelectedTask(task);

        setFormVisible(true);
      },
      [taskStatus],
    );


  /* ================================================= */
  /* DELETE REQUEST                                    */
  /* ================================================= */

  const handleDeleteRequest =
    useCallback(
      (task: Task) => {
        if (taskStatus === 'loading') {
          return;
        }

        setDetailsVisible(false);

        setTaskToDelete(task);

        setDeleteVisible(true);
      },
      [taskStatus],
    );


  /* ================================================= */
  /* DELETE CONFIRM                                    */
  /* ================================================= */

  const handleConfirmDelete =
    useCallback(() => {
      if (
        !taskToDelete ||
        taskStatus === 'loading'
      ) {
        return;
      }

      dispatch(
        deleteTask(
          taskToDelete.id,
        ),
      );

      setDeleteVisible(false);

      setTaskToDelete(null);

      setSelectedTask(null);
    }, [
      dispatch,
      taskStatus,
      taskToDelete,
    ]);


  /* ================================================= */
  /* DELETE CANCEL                                     */
  /* ================================================= */

  const handleCancelDelete =
    useCallback(() => {
      if (taskStatus === 'loading') {
        return;
      }

      setDeleteVisible(false);

      setTaskToDelete(null);
    }, [taskStatus]);


  /* ================================================= */
  /* FLATLIST ITEM                                      */
  /* ================================================= */

  const renderTask = useCallback(
    ({
      item,
    }: {
      item: Task;
    }) => {
      return (
        <TaskCard
          task={item}
          onToggle={handleToggle}
          onPress={handleTaskPress}
        />
      );
    },
    [
      handleToggle,
      handleTaskPress,
    ],
  );


  /* ================================================= */
  /* FAB POSITION                                      */
  /* ================================================= */

  /*
   * Keep the FAB above the Android
   * system navigation area.
   *
   * We intentionally do NOT use
   * useBottomTabBarHeight() here because
   * the current screen layout should keep
   * the FAB independent from the tab bar.
   */

  const fabBottom =
    Math.max(
      insets.bottom,
      Platform.OS === 'android'
        ? 12
        : 8,
    ) + 18;


  /*
   * Give the FlatList enough bottom room
   * so the last task can always be scrolled
   * above the FAB.
   */

  const listBottomPadding =
    Math.max(
      insets.bottom,
      Platform.OS === 'android'
        ? 12
        : 8,
    ) + 110;



  // RENDER

  return (
    <View style={styles.safeArea}>

<StatusBar
  barStyle="dark-content"
/>


      <FlatList
        data={tasks}

        keyExtractor={
          item => item.id
        }

        renderItem={
          renderTask
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={[
          styles.content,
          {
            paddingBottom:
              listBottomPadding,
          },
        ]}

        initialNumToRender={8}

        maxToRenderPerBatch={8}

        windowSize={7}

        removeClippedSubviews


        /* ================================================= */
        /* HEADER                                             */
        /* ================================================= */

        ListHeaderComponent={
          <>
            <View
              style={
                styles.header
              }>

              <View
                style={
                  styles.greetingContainer
                }>

                <Text
                  style={
                    styles.greeting
                  }>
                  {greeting} 👋
                </Text>

                <Text
                  style={
                    styles.name
                  }>
                  {userName}
                </Text>

              </View>


              {/* Notification */}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
                disabled={
                  taskStatus ===
                  'loading'
                }
                style={
                  styles.notificationButton
                }>

                <Text
                  style={
                    styles.notificationIcon
                  }>
                  🔔
                </Text>

                <View
                  style={
                    styles.notificationDot
                  }
                />

              </Pressable>

            </View>



            {/* PRODUCTIVITY   */}
    

            <ProductivityCard
              total={total}
              completed={completed}
              remaining={remaining}
              progress={progress}
            />


        {/* TASK HEADER    */}
   

            <View
              style={
                styles.sectionHeader
              }>

              <Text
                style={
                  styles.sectionTitle
                }>
                My Tasks
              </Text>


              <Pressable
                accessibilityRole="button"
                accessibilityLabel="See all tasks"
                disabled={
                  taskStatus ===
                  'loading'
                }>

                <Text
                  style={
                    styles.seeAll
                  }>
                  See all
                </Text>

              </Pressable>

            </View>


        {/* FILTERS  */}


            <View
              style={
                styles.filters
              }>

              {FILTERS.map(
                item => {

                  const active =
                    filter ===
                    item.value;

                  return (
                    <Pressable
                      key={
                        item.value
                      }

                      accessibilityRole="button"

                      accessibilityState={{
                        selected:
                          active,
                      }}

                      disabled={
                        taskStatus ===
                        'loading'
                      }

                      onPress={() =>
                        handleFilter(
                          item.value,
                        )
                      }

                      style={[
                        styles.filter,

                        active &&
                        styles.filterActive,

                        taskStatus ===
                        'loading' &&
                        styles.disabledButton,
                      ]}>

                      <Text
                        style={[
                          styles.filterText,

                          active &&
                          styles.filterTextActive,
                        ]}>

                        {item.label}

                      </Text>

                    </Pressable>
                  );
                },
              )}

            </View>

          </>
        }


        /* ================================================= */
        /* EMPTY STATE                                        */
        /* ================================================= */

        ListEmptyComponent={
          <View
            style={
              styles.empty
            }>

            <View
              style={
                styles.emptyIconContainer
              }>

              <Text
                style={
                  styles.emptyIcon
                }>
                ✓
              </Text>

            </View>


            <Text
              style={
                styles.emptyTitle
              }>
              No tasks here
            </Text>


            <Text
              style={
                styles.emptyText
              }>
              You're all caught up.
              {'\n'}
              Enjoy the moment.
            </Text>


            <Pressable
              onPress={
                handleCreateTask
              }

              disabled={
                taskStatus ===
                'loading'
              }

              style={[
                styles.emptyButton,

                taskStatus ===
                'loading' &&
                styles.disabledButton,
              ]}>

              <Text
                style={
                  styles.emptyButtonText
                }>
                Create a task
              </Text>

            </Pressable>

          </View>
        }
      />


      {/* ================================================= */}
      /* FLOATING ACTION BUTTON                             */
      /* ================================================= */

      <Pressable
        accessibilityRole="button"

        accessibilityLabel="Create new task"

        onPress={
          handleCreateTask
        }

        disabled={
          taskStatus ===
          'loading'
        }

        style={({
          pressed,
        }) => [
            styles.fab,

            {
              bottom:
                fabBottom,
            },

            pressed &&
            styles.fabPressed,

            taskStatus ===
            'loading' &&
            styles.disabledButton,
          ]}>

        <Text
          style={
            styles.fabText
          }>
          +
        </Text>

      </Pressable>


      {/* ================================================= */}
      /* CREATE / EDIT TASK                                */
      /* ================================================= */

      <TaskFormSheet
        visible={
          formVisible
        }

        task={
          selectedTask
        }

        onClose={
          handleCloseForm
        }
      />


  

      <TaskDetailsSheet
        visible={
          detailsVisible
        }

        task={
          selectedTask
        }

        onClose={
          handleCloseDetails
        }

        onToggle={
          handleToggleFromDetails
        }

        onEdit={
          handleEditTask
        }

        onDelete={
          handleDeleteRequest
        }
      />




      <DeleteConfirmation
        visible={
          deleteVisible
        }

        task={
          taskToDelete
        }

        onCancel={
          handleCancelDelete
        }

        onConfirm={
          handleConfirmDelete
        }
      />

        /* DATABASE / TASK OPERATION LOADING                 */
        
        { taskStatus ===
        'loading' && (
          <Modal
            visible
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={() => { }}>

            <View
              style={
                styles.loadingOverlay
              }>

              <View
                style={
                  styles.loadingCard
                }>

                <ActivityIndicator
                  size="large"
                  color={
                    lightTheme.colors
                      .primary
                  }
                />


                <Text
                  style={
                    styles.loadingTitle
                  }>
                  Please wait
                </Text>


                <Text
                  style={
                    styles.loadingText
                  }>
                  {loadingMessage}
                </Text>

              </View>

            </View>

          </Modal>
        )}

    </View>
  );
}


/* ================================================= */
/* DELETE CONFIRMATION                               */
/* ================================================= */

interface DeleteConfirmationProps {
  visible: boolean;
  task: Task | null;
  onCancel: () => void;
  onConfirm: () => void;
}


function DeleteConfirmation({
  visible,
  task,
  onCancel,
  onConfirm,
}: DeleteConfirmationProps) {

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={
        onCancel
      }>

      <View
        style={
          styles.deleteOverlay
        }>

        <View
          style={
            styles.deleteDialog
          }>


          {/* Delete icon */}

          <View
            style={
              styles.deleteIconContainer
            }>

            <Text
              style={
                styles.deleteIcon
              }>
              !
            </Text>

          </View>


          {/* Title */}

          <Text
            style={
              styles.deleteTitle
            }>
            Delete task?
          </Text>


          {/* Message */}

          <Text
            style={
              styles.deleteMessage
            }>

            {task
              ? `"${task.title}" will be permanently removed.`
              : 'This task will be permanently removed.'}

          </Text>


          {/* Actions */}

          <View
            style={
              styles.deleteActions
            }>

            <Pressable
              onPress={
                onCancel
              }

              disabled={false}

              style={
                styles.cancelButton
              }>

              <Text
                style={
                  styles.cancelButtonText
                }>
                Cancel
              </Text>

            </Pressable>


            <Pressable
              onPress={
                onConfirm
              }

              style={
                styles.confirmDeleteButton
              }>

              <Text
                style={
                  styles.confirmDeleteText
                }>
                Delete
              </Text>

            </Pressable>

          </View>

        </View>

      </View>

    </Modal>
  );
}


/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({

  /* ================================================= */
  /* SCREEN                                             */
  /* ================================================= */

  safeArea: {
    flex: 1,

    backgroundColor:
      lightTheme.colors.background,

    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight ??
        0
        : 0,
  },


  content: {
    paddingHorizontal:
      spacing.xl,

    /*
     * This is intentionally larger
     * than the FAB height.
     *
     * It allows the user to scroll
     * the final task completely above
     * the floating button.
     */
    paddingBottom: 120,
  },


  /* ================================================= */
  /* HEADER                                             */
  /* ================================================= */

  header: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    paddingTop:
      spacing.md,

    paddingBottom:
      spacing.xxl,
  },


  greetingContainer: {
    flex: 1,
  },


  greeting: {
    ...typography.body,

    color:
      lightTheme.colors.textSecondary,
  },


  name: {
    ...typography.display,

    color:
      lightTheme.colors.text,

    marginTop: 2,
  },


  notificationButton: {
    width: 46,

    height: 46,

    borderRadius: 15,

    backgroundColor:
      lightTheme.colors.surface,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.border,

    alignItems: 'center',

    justifyContent: 'center',
  },


  notificationIcon: {
    fontSize: 18,
  },


  notificationDot: {
    position: 'absolute',

    top: 9,

    right: 9,

    width: 7,

    height: 7,

    borderRadius: 4,

    backgroundColor:
      lightTheme.colors.danger,

    borderWidth: 1,

    borderColor:
      lightTheme.colors.surface,
  },


  /* ================================================= */
  /* TASK SECTION                                       */
  /* ================================================= */

  sectionHeader: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    marginBottom:
      spacing.md,
  },


  sectionTitle: {
    ...typography.title,

    color:
      lightTheme.colors.text,
  },


  seeAll: {
    ...typography.bodyMedium,

    color:
      lightTheme.colors.primary,
  },


  /* ================================================= */
  /* FILTERS                                           */
  /* ================================================= */

  filters: {
    flexDirection: 'row',

    marginBottom:
      spacing.lg,
  },


  filter: {
    paddingHorizontal: 15,

    paddingVertical: 9,

    borderRadius: 10,

    marginRight:
      spacing.sm,
  },


  filterActive: {
    backgroundColor:
      lightTheme.colors.primarySoft,
  },


  filterText: {
    ...typography.caption,

    color:
      lightTheme.colors.textSecondary,
  },


  filterTextActive: {
    color:
      lightTheme.colors.primary,

    fontWeight: '700',
  },


  /* ================================================= */
  /* EMPTY STATE                                        */
  /* ================================================= */

  empty: {
    alignItems: 'center',

    paddingTop:
      spacing.huge,
  },


  emptyIconContainer: {
    width: 56,

    height: 56,

    borderRadius: 28,

    backgroundColor:
      lightTheme.colors.successSoft,

    alignItems: 'center',

    justifyContent: 'center',
  },


  emptyIcon: {
    fontSize: 25,

    fontWeight: '700',

    color:
      lightTheme.colors.success,
  },


  emptyTitle: {
    ...typography.heading,

    color:
      lightTheme.colors.text,

    marginTop:
      spacing.lg,
  },


  emptyText: {
    ...typography.body,

    color:
      lightTheme.colors.textSecondary,

    textAlign: 'center',

    marginTop:
      spacing.xs,
  },


  emptyButton: {
    marginTop:
      spacing.lg,

    paddingHorizontal:
      spacing.xl,

    paddingVertical:
      spacing.md,

    borderRadius:
      lightTheme.radius.md,

    backgroundColor:
      lightTheme.colors.primary,
  },


  emptyButtonText: {
    ...typography.button,

    color: '#FFFFFF',
  },


  /* ================================================= */
  /* FAB                                                */
  /* ================================================= */

  fab: {
    position: 'absolute',

    right: 20,

    /*
     * IMPORTANT:
     * Do not hard-code bottom: 34 anymore.
     * The actual bottom value is calculated
     * from the device safe-area inset.
     */
    bottom: 30,

    width: 58,

    height: 58,

    borderRadius: 18,

    backgroundColor:
      lightTheme.colors.primary,

    borderWidth: 1,

    borderColor:
      'rgba(255,255,255,0.15)',

    alignItems: 'center',

    justifyContent: 'center',

    ...shadows.floating,
  },


  fabPressed: {
    transform: [
      {
        scale: 0.94,
      },
    ],

    opacity: 0.9,
  },


  fabText: {
    color: '#FFFFFF',

    fontSize: 30,

    lineHeight: 32,

    fontWeight: '300',

    marginTop: -2,
  },


  /* ================================================= */
  /* DISABLED                                           */
  /* ================================================= */

  disabledButton: {
    opacity: 0.55,
  },


  /* ================================================= */
  /* DELETE DIALOG                                     */
  /* ================================================= */

  deleteOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(15, 18, 25, 0.55)',

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal:
      spacing.xl,
  },


  deleteDialog: {
    width: '100%',

    backgroundColor:
      lightTheme.colors.surface,

    borderRadius:
      lightTheme.radius.xl,

    padding:
      spacing.xl,

    ...shadows.floating,
  },


  deleteIconContainer: {
    width: 48,

    height: 48,

    borderRadius: 24,

    backgroundColor:
      lightTheme.colors.dangerSoft,

    alignItems: 'center',

    justifyContent: 'center',

    marginBottom:
      spacing.lg,
  },


  deleteIcon: {
    fontSize: 23,

    fontWeight: '800',

    color:
      lightTheme.colors.danger,
  },


  deleteTitle: {
    ...typography.title,

    color:
      lightTheme.colors.text,
  },


  deleteMessage: {
    ...typography.body,

    color:
      lightTheme.colors.textSecondary,

    lineHeight: 22,

    marginTop:
      spacing.sm,
  },


  deleteActions: {
    flexDirection: 'row',

    gap: spacing.md,

    marginTop:
      spacing.xxl,
  },


  cancelButton: {
    flex: 1,

    height: 50,

    borderRadius:
      lightTheme.radius.md,

    backgroundColor:
      lightTheme.colors.surfaceSecondary,

    alignItems: 'center',

    justifyContent: 'center',
  },


  cancelButtonText: {
    ...typography.button,

    color:
      lightTheme.colors.text,
  },


  confirmDeleteButton: {
    flex: 1,

    height: 50,

    borderRadius:
      lightTheme.radius.md,

    backgroundColor:
      lightTheme.colors.danger,

    alignItems: 'center',

    justifyContent: 'center',
  },


  confirmDeleteText: {
    ...typography.button,

    color: '#FFFFFF',
  },


  /* ================================================= */
  /* LOADING                                            */
  /* ================================================= */

  loadingOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(15, 18, 25, 0.35)',

    alignItems: 'center',

    justifyContent: 'center',
  },


  loadingCard: {
    minWidth: 190,

    backgroundColor:
      lightTheme.colors.surface,

    borderRadius:
      lightTheme.radius.xl,

    paddingVertical:
      spacing.xl,

    paddingHorizontal:
      spacing.xxl,

    alignItems: 'center',

    ...shadows.floating,
  },


  loadingTitle: {
    ...typography.bodyMedium,

    color:
      lightTheme.colors.text,

    marginTop:
      spacing.md,
  },


  loadingText: {
    ...typography.caption,

    color:
      lightTheme.colors.textSecondary,

    marginTop:
      spacing.xs,

    textAlign: 'center',
  },

});