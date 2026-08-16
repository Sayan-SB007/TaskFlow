import React, {
  useCallback,
  useEffect,
  useMemo,
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

import FontAwesome6 from
  '@react-native-vector-icons/fontawesome6/static';

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
/* DATE HELPERS                                      */
/* ================================================= */

function parseTaskDate(
  value?: string,
): Date | null {

  if (!value) {
    return null;
  }

  /*
   * Existing task format:
   *
   * Today
   */
  if (
    value.trim().toLowerCase() ===
    'today'
  ) {
    const today = new Date();

    return new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
    );
  }


  /*
   * ISO / normal Date-compatible values.
   */
  const nativeDate =
    new Date(value);

  if (
    !Number.isNaN(
      nativeDate.getTime(),
    )
  ) {
    return new Date(
      nativeDate.getFullYear(),
      nativeDate.getMonth(),
      nativeDate.getDate(),
    );
  }


  /*
   * Existing UI format:
   *
   * 17 Aug 2026
   */
  const parts =
    value.trim().split(/\s+/);

  if (
    parts.length !== 3
  ) {
    return null;
  }

  const day =
    Number(parts[0]);

  const month =
    parts[1];

  const year =
    Number(parts[2]);

  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];

  const monthIndex =
    months.findIndex(
      item =>
        item.toLowerCase() ===
        month.toLowerCase(),
    );

  if (
    !Number.isFinite(day) ||
    monthIndex < 0 ||
    !Number.isFinite(year)
  ) {
    return null;
  }

  return new Date(
    year,
    monthIndex,
    day,
  );
}


/* ================================================= */
/* DATE NORMALIZATION                                */
/* ================================================= */

function startOfDay(
  date: Date,
): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
}


function isSameDay(
  first: Date,
  second: Date,
): boolean {

  return (
    first.getFullYear() ===
      second.getFullYear() &&

    first.getMonth() ===
      second.getMonth() &&

    first.getDate() ===
      second.getDate()
  );
}


function isToday(
  value?: string,
): boolean {

  const date =
    parseTaskDate(value);

  if (!date) {
    return false;
  }

  return isSameDay(
    date,
    new Date(),
  );
}


/* ================================================= */
/* SCREEN                                             */
/* ================================================= */

export function TasksScreen() {

  const dispatch =
    useAppDispatch();

  const insets =
    useSafeAreaInsets();


  /* ================================================= */
  /* UI STATE                                          */
  /* ================================================= */

  const [
    formVisible,
    setFormVisible,
  ] = useState(false);

  const [
    detailsVisible,
    setDetailsVisible,
  ] = useState(false);

  /*
   * IMPORTANT:
   *
   * Store only the ID.
   *
   * Never store the entire Task object here.
   * This prevents stale details after Redux updates.
   */
  const [
    selectedTaskId,
    setSelectedTaskId,
  ] = useState<string | null>(
    null,
  );

  const [
    deleteVisible,
    setDeleteVisible,
  ] = useState(false);

  const [
    taskToDeleteId,
    setTaskToDeleteId,
  ] = useState<string | null>(
    null,
  );

  const [
    notificationsVisible,
    setNotificationsVisible,
  ] = useState(false);


  /* ================================================= */
  /* REDUX STATE                                       */
  /* ================================================= */

  /*
   * Read the actual task collection directly from
   * Redux instead of relying on the old date filter.
   *
   * taskSlice uses `items: Task[]`.
   */
  const allTasks =
    useAppSelector(
      state => state.tasks.items,
    );

  const filter =
    useAppSelector(
      selectTaskFilter,
    );

  const total =
    useAppSelector(
      selectTaskCount,
    );

  const completed =
    useAppSelector(
      selectCompletedCount,
    );

  const remaining =
    useAppSelector(
      selectRemainingCount,
    );

  const progress =
    useAppSelector(
      selectProgress,
    );

  const taskStatus =
    useAppSelector(
      state =>
        state.tasks.status,
    );

  const taskOperation =
    useAppSelector(
      state =>
        state.tasks.operation,
    );


  /* ================================================= */
  /* CURRENT USER                                      */
  /* ================================================= */

  const currentUser =
    firebaseAuth.currentUser;

  const userName =
    currentUser
      ?.displayName
      ?.trim() ||
    'there';

  const greeting =
    getGreeting();


  /* ================================================= */
  /* DATABASE INITIALIZATION                           */
  /* ================================================= */

  useEffect(() => {

    dispatch(
      loadTasks(),
    );

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
  /* FIXED TASK FILTERING                              */
  /* ================================================= */

  /*
   * IMPORTANT:
   *
   * We intentionally do the filtering here.
   *
   * The old selector can fail for values such as:
   *
   * 17 Aug 2026
   *
   * because the stored dueDate is a formatted string.
   *
   * This makes the Today tab correctly include
   * every task whose due date is today's local date.
   */

  const visibleTasks =
    useMemo(() => {

      const today =
        startOfDay(
          new Date(),
        );

      if (
        filter === 'all'
      ) {
        return allTasks;
      }

      if (
        filter === 'today'
      ) {

        return allTasks.filter(
          task => {

            const taskDate =
              parseTaskDate(
                task.dueDate,
              );

            if (!taskDate) {
              return false;
            }

            return isSameDay(
              taskDate,
              today,
            );
          },
        );
      }

      if (
        filter === 'upcoming'
      ) {

        return allTasks.filter(
          task => {

            const taskDate =
              parseTaskDate(
                task.dueDate,
              );

            if (!taskDate) {
              return false;
            }

            return (
              startOfDay(
                taskDate,
              ).getTime() >
              today.getTime()
            );
          },
        );
      }

      return allTasks;

    }, [
      allTasks,
      filter,
    ]);


  /* ================================================= */
  /* SELECTED TASK                                    */
  /* ================================================= */

  /*
   * This is the critical fix.
   *
   * Whenever Redux changes the task,
   * selectedTask automatically becomes
   * the latest version.
   */
  const selectedTask =
    useMemo(() => {

      if (!selectedTaskId) {
        return null;
      }

      return (
        allTasks.find(
          task =>
            task.id ===
            selectedTaskId,
        ) ?? null
      );

    }, [
      allTasks,
      selectedTaskId,
    ]);


  /* ================================================= */
  /* DELETE TASK                                      */
  /* ================================================= */

  const taskToDelete =
    useMemo(() => {

      if (!taskToDeleteId) {
        return null;
      }

      return (
        allTasks.find(
          task =>
            task.id ===
            taskToDeleteId,
        ) ?? null
      );

    }, [
      allTasks,
      taskToDeleteId,
    ]);


  /* ================================================= */
  /* TODAY NOTIFICATIONS                              */
  /* ================================================= */

  /*
   * Simple local notification list.
   *
   * Incomplete tasks with today's date and
   * a due time are shown here.
   */

  const todayNotifications =
    useMemo(() => {

      return allTasks
        .filter(task => {

          if (
            task.status ===
            'completed'
          ) {
            return false;
          }

          if (
            !task.dueDate ||
            !task.dueTime
          ) {
            return false;
          }

          return isToday(
            task.dueDate,
          );
        })
        .sort(
          (
            first,
            second,
          ) => {

            return (
              (
                first.dueTime ??
                ''
              ).localeCompare(
                second.dueTime ??
                '',
              )
            );
          },
        );

    }, [
      allTasks,
    ]);


  const notificationCount =
    todayNotifications.length;


  /* ================================================= */
  /* TASK TOGGLE                                      */
  /* ================================================= */

  const handleToggle =
    useCallback(
      (task: Task) => {

        if (
          taskStatus ===
          'loading'
        ) {
          return;
        }

        dispatch(
          toggleTask(
            task.id,
          ),
        );
      },
      [
        dispatch,
        taskStatus,
      ],
    );


  /* ================================================= */
  /* TASK PRESS                                       */
  /* ================================================= */

  const handleTaskPress =
    useCallback(
      (task: Task) => {

        if (
          taskStatus ===
          'loading'
        ) {
          return;
        }

        setSelectedTaskId(
          task.id,
        );

        setDetailsVisible(
          true,
        );
      },
      [
        taskStatus,
      ],
    );


  /* ================================================= */
  /* FILTER                                           */
  /* ================================================= */

  const handleFilter =
    useCallback(
      (value: TaskFilter) => {

        if (
          taskStatus ===
          'loading'
        ) {
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
  /* CREATE TASK                                      */
  /* ================================================= */

  const handleCreateTask =
    useCallback(() => {

      if (
        taskStatus ===
        'loading'
      ) {
        return;
      }

      setSelectedTaskId(
        null,
      );

      setFormVisible(
        true,
      );

    }, [
      taskStatus,
    ]);


  /* ================================================= */
  /* CLOSE FORM                                       */
  /* ================================================= */

  const handleCloseForm =
    useCallback(() => {

      setFormVisible(
        false,
      );

      /*
       * Only clear the selected ID when
       * we are using the form.
       */
      setSelectedTaskId(
        null,
      );

    }, []);


  /* ================================================= */
  /* CLOSE DETAILS                                    */
  /* ================================================= */

  const handleCloseDetails =
    useCallback(() => {

      setDetailsVisible(
        false,
      );

      setSelectedTaskId(
        null,
      );

    }, []);


  /* ================================================= */
  /* TOGGLE FROM DETAILS                              */
  /* ================================================= */

  const handleToggleFromDetails =
    useCallback(
      (task: Task) => {

        if (
          taskStatus ===
          'loading'
        ) {
          return;
        }

        /*
         * Do NOT modify selectedTask locally.
         *
         * Redux changes first.
         *
         * selectedTask is then resolved again
         * from allTasks above.
         */
        dispatch(
          toggleTask(
            task.id,
          ),
        );

      },
      [
        dispatch,
        taskStatus,
      ],
    );


  /* ================================================= */
  /* EDIT TASK                                        */
  /* ================================================= */

  const handleEditTask =
    useCallback(
      (task: Task) => {

        if (
          taskStatus ===
          'loading'
        ) {
          return;
        }

        setDetailsVisible(
          false,
        );

        setSelectedTaskId(
          task.id,
        );

        setFormVisible(
          true,
        );

      },
      [
        taskStatus,
      ],
    );


  /* ================================================= */
  /* DELETE REQUEST                                   */
  /* ================================================= */

  const handleDeleteRequest =
    useCallback(
      (task: Task) => {

        if (
          taskStatus ===
          'loading'
        ) {
          return;
        }

        setDetailsVisible(
          false,
        );

        setTaskToDeleteId(
          task.id,
        );

        setDeleteVisible(
          true,
        );
      },
      [
        taskStatus,
      ],
    );


  /* ================================================= */
  /* CONFIRM DELETE                                   */
  /* ================================================= */

  const handleConfirmDelete =
    useCallback(
      () => {

        if (
          !taskToDeleteId
        ) {
          return;
        }

        dispatch(
          deleteTask(
            taskToDeleteId,
          ),
        );

        setDeleteVisible(
          false,
        );

        setTaskToDeleteId(
          null,
        );

        setSelectedTaskId(
          null,
        );

        setDetailsVisible(
          false,
        );

      },
      [
        dispatch,
        taskToDeleteId,
      ],
    );


  /* ================================================= */
  /* CANCEL DELETE                                    */
  /* ================================================= */

  const handleCancelDelete =
    useCallback(() => {

      setDeleteVisible(
        false,
      );

      setTaskToDeleteId(
        null,
      );

    }, []);


  /* ================================================= */
  /* NOTIFICATIONS                                    */
  /* ================================================= */

  const handleOpenNotifications =
    useCallback(() => {

      if (
        taskStatus ===
        'loading'
      ) {
        return;
      }

      setNotificationsVisible(
        true,
      );

    }, [
      taskStatus,
    ]);


  const handleCloseNotifications =
    useCallback(() => {

      setNotificationsVisible(
        false,
      );

    }, []);


  const handleNotificationPress =
    useCallback(
      (task: Task) => {

        setNotificationsVisible(
          false,
        );

        setSelectedTaskId(
          task.id,
        );

        setDetailsVisible(
          true,
        );

      },
      [],
    );


  /* ================================================= */
  /* RENDER TASK                                      */
  /* ================================================= */

  const renderTask =
    useCallback(
      ({
        item,
      }: {
        item: Task;
      }) => {

        return (
          <TaskCard
            task={item}
            onPress={
              handleTaskPress
            }
            onToggle={
              handleToggle
            }
          />
        );

      },
      [
        handleTaskPress,
        handleToggle,
      ],
    );


  /* ================================================= */
  /* KEY EXTRACTOR                                    */
  /* ================================================= */

  const keyExtractor =
    useCallback(
      (item: Task) =>
        item.id,
      [],
    );


  /* ================================================= */
  /* EMPTY STATE                                      */
  /* ================================================= */

  const emptyComponent =
    useMemo(() => {

      return (
        <View
          style={
            styles.empty
          }
        >

          <View
            style={
              styles.emptyIconContainer
            }
          >

            <Text
              style={
                styles.emptyIcon
              }
            >
              ✓
            </Text>

          </View>


          <Text
            style={
              styles.emptyTitle
            }
          >
            No tasks here
          </Text>


          <Text
            style={
              styles.emptyText
            }
          >
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
            style={({pressed}) => [
              styles.emptyButton,

              pressed &&
                styles.buttonPressed,

              taskStatus ===
                'loading' &&
                styles.disabledButton,
            ]}
          >

            <Text
              style={
                styles.emptyButtonText
              }
            >
              Create a task
            </Text>

          </Pressable>

        </View>
      );

    }, [
      handleCreateTask,
      taskStatus,
    ]);


  /* ================================================= */
  /* FAB POSITION                                      */
  /* ================================================= */

  const fabBottom =
    Math.max(
      insets.bottom,
      12,
    ) + 72;


  /* ================================================= */
  /* RENDER                                            */
  /* ================================================= */

  return (
    <View
      style={
        styles.safeArea
      }
    >

      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          lightTheme.colors.background
        }
      />


      {/* ================================================= */}
      {/* LIST                                               */}
      {/* ================================================= */}

      <FlatList
        data={
          visibleTasks
        }

        keyExtractor={
          keyExtractor
        }

        renderItem={
          renderTask
        }

        showsVerticalScrollIndicator={
          false
        }

        contentContainerStyle={[
          styles.content,

          visibleTasks.length ===
            0 &&
            styles.emptyListContent,
        ]}

        ListHeaderComponent={
          <>
            {/* ================================================= */}
            {/* HEADER                                             */}
            {/* ================================================= */}

            <View
              style={
                styles.header
              }
            >

              <View
                style={
                  styles.greetingContainer
                }
              >

                <Text
                  style={
                    styles.greeting
                  }
                >
                  {greeting} 👋
                </Text>

                <Text
                  style={
                    styles.name
                  }
                >
                  {userName}
                </Text>

              </View>


              {/* ================================================= */}
              {/* NOTIFICATION BUTTON                               */}
              {/* ================================================= */}

              <Pressable
                accessibilityRole="button"
                accessibilityLabel={
                  notificationCount > 0
                    ? `${notificationCount} notifications`
                    : 'Notifications'
                }
                disabled={
                  taskStatus ===
                  'loading'
                }
                onPress={
                  handleOpenNotifications
                }
                style={({pressed}) => [
                  styles.notificationButton,

                  pressed &&
                    styles.buttonPressed,

                  taskStatus ===
                    'loading' &&
                    styles.disabledButton,
                ]}
              >

                <FontAwesome6
                  name="bell"
                  size={18}
                  color={
                    lightTheme.colors.primary
                  }
                  iconStyle="solid"
                />


                {notificationCount >
                0 ? (

                  <View
                    style={
                      styles.notificationBadge
                    }
                  >

                    <Text
                      style={
                        styles.notificationBadgeText
                      }
                    >
                      {
                        notificationCount >
                        9
                          ? '9+'
                          : notificationCount
                      }
                    </Text>

                  </View>

                ) : null}

              </Pressable>

            </View>


            {/* ================================================= */}
            {/* PRODUCTIVITY                                      */}
            {/* ================================================= */}

            <ProductivityCard
              total={
                total
              }
              completed={
                completed
              }
              remaining={
                remaining
              }
              progress={
                progress
              }
            />


            {/* ================================================= */}
            {/* TASK SECTION                                      */}
            {/* ================================================= */}

            <View
              style={
                styles.sectionHeader
              }
            >

              <Text
                style={
                  styles.sectionTitle
                }
              >
                My Tasks
              </Text>


              <Pressable
                onPress={() =>
                  handleFilter(
                    'all',
                  )
                }
                disabled={
                  taskStatus ===
                  'loading'
                }
              >

                <Text
                  style={
                    styles.seeAll
                  }
                >
                  See all
                </Text>

              </Pressable>

            </View>


            {/* ================================================= */}
            {/* FILTERS                                            */}
            {/* ================================================= */}

            <View
              style={
                styles.filters
              }
            >

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
                      onPress={() =>
                        handleFilter(
                          item.value,
                        )
                      }
                      disabled={
                        taskStatus ===
                        'loading'
                      }
                      style={[
                        styles.filter,

                        active &&
                          styles.filterActive,

                        taskStatus ===
                          'loading' &&
                          styles.disabledButton,
                      ]}
                    >

                      <Text
                        style={[
                          styles.filterText,

                          active &&
                            styles.filterTextActive,
                        ]}
                      >
                        {
                          item.label
                        }
                      </Text>

                    </Pressable>
                  );
                },
              )}

            </View>

          </>
        }

        ListEmptyComponent={
          emptyComponent
        }

        ItemSeparatorComponent={
          () => (
            <View
              style={
                styles.taskSeparator
              }
            />
          )
        }

        initialNumToRender={8}

        maxToRenderPerBatch={8}

        windowSize={7}

        removeClippedSubviews={
          Platform.OS ===
          'android'
        }
      />


      {/* ================================================= */}
      {/* FAB                                                  */}
      {/* ================================================= */}

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
        style={({pressed}) => [
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
        ]}
      >

        <FontAwesome6
          name="plus"
          size={20}
          color="#FFFFFF"
          iconStyle="solid"
        />

      </Pressable>


      {/* ================================================= */}
      {/* CREATE / EDIT                                     */}
      {/* ================================================= */}

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


      {/* ================================================= */}
      {/* DETAILS                                           */}
      {/* ================================================= */}

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


      {/* ================================================= */}
      {/* DELETE CONFIRMATION                               */}
      {/* ================================================= */}

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


      {/* ================================================= */}
      {/* NOTIFICATIONS                                     */}
      {/* ================================================= */}

      <NotificationsSheet
        visible={
          notificationsVisible
        }

        notifications={
          todayNotifications
        }

        onClose={
          handleCloseNotifications
        }

        onPress={
          handleNotificationPress
        }
      />


      {/* ================================================= */}
      {/* DATABASE LOADING                                  */}
      {/* ================================================= */}

      {taskStatus ===
        'loading' && (

        <Modal
          visible
          transparent
          animationType="fade"
          statusBarTranslucent
          onRequestClose={() => {}}
        >

          <View
            style={
              styles.loadingOverlay
            }
          >

            <View
              style={
                styles.loadingCard
              }
            >

              <ActivityIndicator
                size="large"
                color={
                  lightTheme.colors.primary
                }
              />


              <Text
                style={
                  styles.loadingTitle
                }
              >
                Please wait
              </Text>


              <Text
                style={
                  styles.loadingText
                }
              >
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
      visible={
        visible
      }
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={
        onCancel
      }
    >

      <View
        style={
          styles.deleteOverlay
        }
      >

        <View
          style={
            styles.deleteDialog
          }
        >

          <View
            style={
              styles.deleteIconContainer
            }
          >

            <FontAwesome6
              name="trash"
              size={20}
              color={
                lightTheme.colors.danger
              }
              iconStyle="solid"
            />

          </View>


          <Text
            style={
              styles.deleteTitle
            }
          >
            Delete task?
          </Text>


          <Text
            style={
              styles.deleteMessage
            }
          >
            {task
              ? `"${task.title}" will be permanently removed.`
              : 'This task will be permanently removed.'}
          </Text>


          <View
            style={
              styles.deleteActions
            }
          >

            <Pressable
              onPress={
                onCancel
              }
              style={
                styles.cancelButton
              }
            >

              <Text
                style={
                  styles.cancelButtonText
                }
              >
                Cancel
              </Text>

            </Pressable>


            <Pressable
              onPress={
                onConfirm
              }
              style={
                styles.confirmDeleteButton
              }
            >

              <Text
                style={
                  styles.confirmDeleteText
                }
              >
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
/* NOTIFICATIONS SHEET                               */
/* ================================================= */

interface NotificationsSheetProps {
  visible: boolean;
  notifications: Task[];
  onClose: () => void;
  onPress: (task: Task) => void;
}


function NotificationsSheet({
  visible,
  notifications,
  onClose,
  onPress,
}: NotificationsSheetProps) {

  return (
    <Modal
      visible={
        visible
      }
      transparent
      animationType="slide"
      statusBarTranslucent
      onRequestClose={
        onClose
      }
    >

      <View
        style={
          styles.notificationOverlay
        }
      >

        {/* ================================================= */}
        {/* BACKDROP                                           */}
        {/* ================================================= */}

        <Pressable
          style={
            styles.notificationBackdrop
          }
          onPress={
            onClose
          }
        />


        {/* ================================================= */}
        {/* SHEET                                              */}
        {/* ================================================= */}

        <View
          style={
            styles.notificationSheet
          }
        >

          <View
            style={
              styles.notificationHandle
            }
          />


          {/* ================================================= */}
          {/* HEADER                                             */}
          {/* ================================================= */}

          <View
            style={
              styles.notificationHeader
            }
          >

            <View
              style={
                styles.notificationHeaderLeft
              }
            >

              <View
                style={
                  styles.notificationIconContainer
                }
              >

                <FontAwesome6
                  name="bell"
                  size={17}
                  color={
                    lightTheme.colors.primary
                  }
                  iconStyle="solid"
                />

              </View>


              <View>

                <Text
                  style={
                    styles.notificationTitle
                  }
                >
                  Notifications
                </Text>

                <Text
                  style={
                    styles.notificationSubtitle
                  }
                >
                  Today's task reminders
                </Text>

              </View>

            </View>


            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Close notifications"
              onPress={
                onClose
              }
              style={
                styles.notificationCloseButton
              }
            >

              <FontAwesome6
                name="xmark"
                size={17}
                color={
                  lightTheme.colors.textSecondary
                }
                iconStyle="solid"
              />

            </Pressable>

          </View>


          {/* ================================================= */}
          {/* CONTENT                                            */}
          {/* ================================================= */}

          {notifications.length ===
          0 ? (

            <View
              style={
                styles.notificationEmpty
              }
            >

              <View
                style={
                  styles.notificationEmptyIcon
                }
              >

                <FontAwesome6
                  name="check"
                  size={22}
                  color={
                    lightTheme.colors.success
                  }
                  iconStyle="solid"
                />

              </View>


              <Text
                style={
                  styles.notificationEmptyTitle
                }
              >
                You're all caught up
              </Text>


              <Text
                style={
                  styles.notificationEmptyText
                }
              >
                No task reminders for today.
              </Text>

            </View>

          ) : (

            <FlatList
              data={
                notifications
              }

              keyExtractor={
                item =>
                  item.id
              }

              showsVerticalScrollIndicator={
                false
              }

              contentContainerStyle={
                styles.notificationList
              }

              renderItem={({
                item,
              }) => (

                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={
                    `Open task ${item.title}`
                  }
                  onPress={() =>
                    onPress(
                      item,
                    )
                  }
                  style={({pressed}) => [
                    styles.notificationItem,

                    pressed &&
                      styles.buttonPressed,
                  ]}
                >

                  <View
                    style={
                      styles.notificationItemIcon
                    }
                  >

                    <FontAwesome6
                      name="clock"
                      size={15}
                      color={
                        lightTheme.colors.primary
                      }
                      iconStyle="solid"
                    />

                  </View>


                  <View
                    style={
                      styles.notificationItemContent
                    }
                  >

                    <Text
                      style={
                        styles.notificationItemTitle
                      }
                      numberOfLines={
                        1
                      }
                    >
                      {item.title}
                    </Text>


                    <Text
                      style={
                        styles.notificationItemTime
                      }
                    >
                      {item.dueTime}
                    </Text>

                  </View>


                  <FontAwesome6
                    name="chevron-right"
                    size={14}
                    color={
                      lightTheme.colors.textMuted
                    }
                    iconStyle="solid"
                  />

                </Pressable>

              )}
            />

          )}

        </View>

      </View>

    </Modal>
  );
}


/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles =
  StyleSheet.create({

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

      paddingBottom:
        150,
    },


    emptyListContent: {
      flexGrow: 1,
    },


    /* ================================================= */
    /* HEADER                                             */
    /* ================================================= */

    header: {
      flexDirection:
        'row',

      alignItems:
        'center',

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

      alignItems:
        'center',

      justifyContent:
        'center',

      ...shadows.sm,
    },


    notificationBadge: {
      position:
        'absolute',

      top: 5,

      right: 5,

      minWidth: 16,

      height: 16,

      borderRadius: 8,

      paddingHorizontal: 3,

      backgroundColor:
        lightTheme.colors.danger,

      alignItems:
        'center',

      justifyContent:
        'center',

      borderWidth: 1,

      borderColor:
        lightTheme.colors.surface,
    },


    notificationBadgeText: {
      color:
        '#FFFFFF',

      fontSize: 9,

      fontWeight:
        '800',
    },


    /* ================================================= */
    /* TASK SECTION                                      */
    /* ================================================= */

    sectionHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      marginTop:
        spacing.xxl,

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
      flexDirection:
        'row',

      marginBottom:
        spacing.lg,
    },


    filter: {
      paddingHorizontal:
        15,

      paddingVertical:
        9,

      borderRadius:
        10,

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

      fontWeight:
        '700',
    },


    taskSeparator: {
      height:
        spacing.md,
    },


    /* ================================================= */
    /* EMPTY                                             */
    /* ================================================= */

    empty: {
      flex: 1,

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        spacing.xl,

      paddingVertical:
        60,
    },


    emptyIconContainer: {
      width: 56,

      height: 56,

      borderRadius: 28,

      alignItems:
        'center',

      justifyContent:
        'center',

      backgroundColor:
        lightTheme.colors.successSoft,
    },


    emptyIcon: {
      fontSize: 26,

      color:
        lightTheme.colors.success,

      fontWeight:
        '700',
    },


    emptyTitle: {
      ...typography.title,

      color:
        lightTheme.colors.text,

      marginTop:
        spacing.lg,
    },


    emptyText: {
      ...typography.body,

      color:
        lightTheme.colors.textSecondary,

      textAlign:
        'center',

      lineHeight: 23,

      marginTop:
        spacing.sm,
    },


    emptyButton: {
      minWidth: 180,

      height: 52,

      paddingHorizontal:
        spacing.xl,

      borderRadius:
        lightTheme.radius.md,

      backgroundColor:
        lightTheme.colors.primary,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginTop:
        spacing.xl,

      elevation: 3,
    },


    emptyButtonText: {
      ...typography.button,

      color:
        '#FFFFFF',
    },


    /* ================================================= */
    /* FAB                                               */
    /* ================================================= */

    fab: {
      position:
        'absolute',

      right:
        spacing.xl,

      width: 58,

      height: 58,

      borderRadius: 18,

      backgroundColor:
        lightTheme.colors.primary,

      alignItems:
        'center',

      justifyContent:
        'center',

      elevation: 7,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,

        height: 4,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        7,
    },


    fabPressed: {
      opacity:
        0.85,

      transform: [
        {
          scale:
            0.96,
        },
      ],
    },


    /* ================================================= */
    /* COMMON                                             */
    /* ================================================= */

    buttonPressed: {
      opacity:
        0.78,
    },


    disabledButton: {
      opacity:
        0.5,
    },


    /* ================================================= */
    /* DELETE                                             */
    /* ================================================= */

    deleteOverlay: {
      flex: 1,

      backgroundColor:
        'rgba(15,18,25,0.52)',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        spacing.xl,
    },


    deleteDialog: {
      width:
        '100%',

      backgroundColor:
        lightTheme.colors.surface,

      borderRadius:
        24,

      padding:
        spacing.xl,

      elevation:
        24,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,

        height: 8,
      },

      shadowOpacity:
        0.2,

      shadowRadius:
        18,
    },


    deleteIconContainer: {
      width: 46,

      height: 46,

      borderRadius: 23,

      backgroundColor:
        lightTheme.colors.dangerSoft,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        spacing.lg,
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

      lineHeight:
        22,

      marginTop:
        spacing.sm,
    },


    deleteActions: {
      flexDirection:
        'row',

      gap:
        spacing.md,

      marginTop:
        spacing.xl,
    },


    cancelButton: {
      flex: 1,

      height: 50,

      borderRadius:
        lightTheme.radius.md,

      borderWidth: 1,

      borderColor:
        lightTheme.colors.border,

      alignItems:
        'center',

      justifyContent:
        'center',
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

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    confirmDeleteText: {
      ...typography.button,

      color:
        '#FFFFFF',
    },


    /* ================================================= */
    /* LOADING                                           */
    /* ================================================= */

    loadingOverlay: {
      flex: 1,

      backgroundColor:
        'rgba(15,18,25,0.35)',

      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        spacing.xl,
    },


    loadingCard: {
      width:
        '100%',

      maxWidth:
        300,

      backgroundColor:
        lightTheme.colors.surface,

      borderRadius:
        24,

      padding:
        spacing.xl,

      alignItems:
        'center',

      elevation:
        20,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,

        height: 8,
      },

      shadowOpacity:
        0.2,

      shadowRadius:
        18,
    },


    loadingTitle: {
      ...typography.title,

      color:
        lightTheme.colors.text,

      marginTop:
        spacing.lg,
    },


    loadingText: {
      ...typography.body,

      color:
        lightTheme.colors.textSecondary,

      marginTop:
        spacing.xs,

      textAlign:
        'center',
    },


    /* ================================================= */
    /* NOTIFICATION MODAL                                */
    /* ================================================= */

    notificationOverlay: {
      flex: 1,

      justifyContent:
        'flex-end',

      /*
       * Keep the dim layer on the full modal container.
       * This guarantees the page underneath is visibly
       * separated from the notification sheet on Android.
       *
       * This is intentionally the same backdrop color
       * used by Create Task and Task Details.
       */
      backgroundColor:
        'rgba(15,18,25,0.52)',
    },


    /*
     * Transparent touch-catcher only.
     *
     * The actual dimming is handled by notificationOverlay
     * above so Android cannot render the backdrop as visually
     * transparent.
     */
    notificationBackdrop: {
      ...StyleSheet.absoluteFillObject,

      backgroundColor:
        'transparent',
    },


    notificationSheet: {
      width:
        '100%',

      maxHeight:
        '78%',

      backgroundColor:
        lightTheme.colors.surface,

      borderTopLeftRadius:
        28,

      borderTopRightRadius:
        28,

      paddingTop:
        spacing.md,

      paddingBottom:
        spacing.xxl,

      elevation:
        24,

      shadowColor:
        '#000000',

      shadowOffset: {
        width: 0,

        height: -8,
      },

      shadowOpacity:
        0.18,

      shadowRadius:
        20,
    },


    notificationHandle: {
      alignSelf:
        'center',

      width:
        42,

      height:
        4,

      borderRadius:
        2,

      backgroundColor:
        lightTheme.colors.border,

      marginBottom:
        spacing.lg,
    },


    notificationHeader: {
      flexDirection:
        'row',

      alignItems:
        'center',

      justifyContent:
        'space-between',

      paddingHorizontal:
        spacing.xl,

      paddingBottom:
        spacing.lg,
    },


    notificationHeaderLeft: {
      flexDirection:
        'row',

      alignItems:
        'center',

      flex: 1,
    },


    notificationIconContainer: {
      width:
        42,

      height:
        42,

      borderRadius:
        14,

      backgroundColor:
        lightTheme.colors.primarySoft,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        spacing.md,
    },


    notificationTitle: {
      ...typography.title,

      color:
        lightTheme.colors.text,
    },


    notificationSubtitle: {
      ...typography.caption,

      color:
        lightTheme.colors.textSecondary,

      marginTop:
        spacing.xs,
    },


    notificationCloseButton: {
      width:
        40,

      height:
        40,

      borderRadius:
        20,

      backgroundColor:
        lightTheme.colors.background,

      borderWidth:
        1,

      borderColor:
        lightTheme.colors.border,

      alignItems:
        'center',

      justifyContent:
        'center',
    },


    notificationEmpty: {
      alignItems:
        'center',

      justifyContent:
        'center',

      paddingHorizontal:
        spacing.xl,

      paddingVertical:
        70,
    },


    notificationEmptyIcon: {
      width:
        56,

      height:
        56,

      borderRadius:
        28,

      backgroundColor:
        lightTheme.colors.successSoft,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginBottom:
        spacing.lg,
    },


    notificationEmptyTitle: {
      ...typography.title,

      color:
        lightTheme.colors.text,

      textAlign:
        'center',
    },


    notificationEmptyText: {
      ...typography.body,

      color:
        lightTheme.colors.textSecondary,

      textAlign:
        'center',

      marginTop:
        spacing.sm,
    },


    notificationList: {
      paddingHorizontal:
        spacing.xl,

      paddingBottom:
        spacing.xl,
    },


    notificationItem: {
      flexDirection:
        'row',

      alignItems:
        'center',

      minHeight:
        64,

      paddingHorizontal:
        spacing.md,

      borderRadius:
        lightTheme.radius.md,

      backgroundColor:
        lightTheme.colors.background,

      borderWidth:
        1,

      borderColor:
        lightTheme.colors.border,

      marginBottom:
        spacing.sm,
    },


    notificationItemIcon: {
      width:
        36,

      height:
        36,

      borderRadius:
        12,

      backgroundColor:
        lightTheme.colors.primarySoft,

      alignItems:
        'center',

      justifyContent:
        'center',

      marginRight:
        spacing.md,
    },


    notificationItemContent: {
      flex: 1,
    },


    notificationItemTitle: {
      ...typography.bodyMedium,

      color:
        lightTheme.colors.text,

      fontWeight:
        '600',
    },


    notificationItemTime: {
      ...typography.caption,

      color:
        lightTheme.colors.textSecondary,

      marginTop:
        2,
    },

  });