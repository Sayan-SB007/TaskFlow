import React, {
  useCallback,
  useState,
} from 'react';

import {
  FlatList,
  Modal,
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {useAppDispatch} from '../../../hooks/useAppDispatch';
import {useAppSelector} from '../../../hooks/useAppSelector';

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
  setFilter,
  toggleTask,
} from '../taskSlice';

import type {
  Task,
  TaskFilter,
} from '../types';

import {TaskCard} from '../components/TaskCard';
import {ProductivityCard} from '../components/ProductivityCard';
import {TaskFormSheet} from '../components/TaskFormSheet';
import {TaskDetailsSheet} from '../components/TaskDetailsSheet';
import {lightTheme} from '../../../theme/lightTheme';
import {spacing} from '../../../theme/spacing';
import {typography} from '../../../theme/typography';
import {shadows} from '../../../theme/shadows';

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

export function TasksScreen() {
  const dispatch = useAppDispatch();

  // -----------------------------
  // UI STATE
  // -----------------------------

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

  // -----------------------------
  // REDUX STATE
  // -----------------------------

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

  // -----------------------------
  // TASK ACTIONS
  // -----------------------------

  const handleToggle = useCallback(
    (task: Task) => {
      dispatch(toggleTask(task.id));
    },
    [dispatch],
  );

  const handleTaskPress = useCallback(
    (task: Task) => {
      setSelectedTask(task);
      setDetailsVisible(true);
    },
    [],
  );

  const handleFilter = useCallback(
    (value: TaskFilter) => {
      dispatch(setFilter(value));
    },
    [dispatch],
  );

  // -----------------------------
  // CREATE
  // -----------------------------

  const handleCreateTask = useCallback(() => {
    setSelectedTask(null);
    setFormVisible(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setFormVisible(false);
    setSelectedTask(null);
  }, []);

  // -----------------------------
  // DETAILS
  // -----------------------------

  const handleCloseDetails =
    useCallback(() => {
      setDetailsVisible(false);
      setSelectedTask(null);
    }, []);

  // -----------------------------
  // COMPLETE FROM DETAILS
  // -----------------------------

  const handleToggleFromDetails =
    useCallback(
      (task: Task) => {
        dispatch(toggleTask(task.id));
      },
      [dispatch],
    );

  // -----------------------------
  // EDIT
  // -----------------------------

  const handleEditTask =
    useCallback((task: Task) => {
      setDetailsVisible(false);

      setSelectedTask(task);

      setFormVisible(true);
    }, []);

  // -----------------------------
  // DELETE REQUEST
  // -----------------------------

  const handleDeleteRequest =
    useCallback((task: Task) => {
      setDetailsVisible(false);

      setTaskToDelete(task);

      setDeleteVisible(true);
    }, []);

  // -----------------------------
  // DELETE CONFIRM
  // -----------------------------

  const handleConfirmDelete =
    useCallback(() => {
      if (!taskToDelete) {
        return;
      }

      dispatch(
        deleteTask(taskToDelete.id),
      );

      setDeleteVisible(false);

      setTaskToDelete(null);

      setSelectedTask(null);
    }, [
      dispatch,
      taskToDelete,
    ]);

  // -----------------------------
  // DELETE CANCEL
  // -----------------------------

  const handleCancelDelete =
    useCallback(() => {
      setDeleteVisible(false);
      setTaskToDelete(null);
    }, []);

  // -----------------------------
  // FLATLIST ITEM
  // -----------------------------

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

  return (
    <View style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor={
          lightTheme.colors.background
        }
      />

      <FlatList
        data={tasks}
        keyExtractor={item => item.id}
        renderItem={renderTask}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.content
        }
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews
        ListHeaderComponent={
          <>
            {/* ========================= */}
            {/* HEADER */}
            {/* ========================= */}

            <View style={styles.header}>
              <View
                style={
                  styles.greetingContainer
                }>
                <Text style={styles.greeting}>
                  Good morning 👋
                </Text>

                <Text style={styles.name}>
                  Sayan
                </Text>
              </View>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Notifications"
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

            {/* ========================= */}
            {/* PRODUCTIVITY */}
            {/* ========================= */}

            <ProductivityCard
              total={total}
              completed={completed}
              remaining={remaining}
              progress={progress}
            />

            {/* ========================= */}
            {/* TASK HEADER */}
            {/* ========================= */}

            <View
              style={styles.sectionHeader}>
              <Text
                style={styles.sectionTitle}>
                My Tasks
              </Text>

              <Pressable
                accessibilityRole="button"
                accessibilityLabel="See all tasks">
                <Text
                  style={styles.seeAll}>
                  See all
                </Text>
              </Pressable>
            </View>

            {/* ========================= */}
            {/* FILTERS */}
            {/* ========================= */}

            <View style={styles.filters}>
              {FILTERS.map(item => {
                const active =
                  filter === item.value;

                return (
                  <Pressable
                    key={item.value}
                    accessibilityRole="button"
                    accessibilityState={{
                      selected: active,
                    }}
                    onPress={() =>
                      handleFilter(
                        item.value,
                      )
                    }
                    style={[
                      styles.filter,
                      active &&
                        styles.filterActive,
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
              })}
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.empty}>
            <View
              style={
                styles.emptyIconContainer
              }>
              <Text style={styles.emptyIcon}>
                ✓
              </Text>
            </View>

            <Text
              style={styles.emptyTitle}>
              No tasks here
            </Text>

            <Text
              style={styles.emptyText}>
              You're all caught up.
              {'\n'}
              Enjoy the moment.
            </Text>

            <Pressable
              onPress={handleCreateTask}
              style={styles.emptyButton}>
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

      {/* ========================= */}
      {/* FLOATING ACTION BUTTON */}
      {/* ========================= */}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create new task"
        onPress={handleCreateTask}
        style={({pressed}) => [
          styles.fab,
          pressed && styles.fabPressed,
        ]}>
        <Text style={styles.fabText}>
          +
        </Text>
      </Pressable>

      {/* ========================= */}
      {/* CREATE / EDIT TASK */}
      {/* ========================= */}

      <TaskFormSheet
        visible={formVisible}
        task={selectedTask}
        onClose={handleCloseForm}
      />

      {/* ========================= */}
      {/* TASK DETAILS */}
      {/* ========================= */}

 <TaskDetailsSheet
  visible={detailsVisible}
  task={selectedTask}
  onClose={handleCloseDetails}
  onToggle={handleToggleFromDetails}
  onEdit={handleEditTask}
  onDelete={handleDeleteRequest}
/>

      {/* ========================= */}
      {/* DELETE CONFIRMATION */}
      {/* ========================= */}

      <DeleteConfirmation
        visible={deleteVisible}
        task={taskToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />
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
      onRequestClose={onCancel}>
      <View style={styles.deleteOverlay}>
        <View style={styles.deleteDialog}>
          <View
            style={
              styles.deleteIconContainer
            }>
            <Text
              style={styles.deleteIcon}>
              !
            </Text>
          </View>

          <Text
            style={styles.deleteTitle}>
            Delete task?
          </Text>

          <Text
            style={styles.deleteMessage}>
            {task
              ? `"${task.title}" will be permanently removed.`
              : 'This task will be permanently removed.'}
          </Text>

          <View style={styles.deleteActions}>
            <Pressable
              onPress={onCancel}
              style={styles.cancelButton}>
              <Text
                style={
                  styles.cancelButtonText
                }>
                Cancel
              </Text>
            </Pressable>

            <Pressable
              onPress={onConfirm}
              style={styles.confirmDeleteButton}>
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
  safeArea: {
    flex: 1,

    backgroundColor:
      lightTheme.colors.background,

    paddingTop:
      Platform.OS === 'android'
        ? StatusBar.currentHeight ?? 0
        : 0,
  },

  content: {
    paddingHorizontal:
      spacing.xl,

    /*
     * Extra bottom space ensures the
     * last task isn't hidden behind FAB.
     */
    paddingBottom: 150,
  },

  /* ========================= */
  /* HEADER */
  /* ========================= */

  header: {
    flexDirection: 'row',

    alignItems: 'center',

    justifyContent:
      'space-between',

    paddingTop: spacing.md,

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

  /* ========================= */
  /* TASK SECTION */
  /* ========================= */

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

  /* ========================= */
  /* FILTERS */
  /* ========================= */

  filters: {
    flexDirection: 'row',

    marginBottom:
      spacing.lg,
  },

  filter: {
    paddingHorizontal: 15,

    paddingVertical: 9,

    borderRadius: 10,

    marginRight: spacing.sm,
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

  /* ========================= */
  /* EMPTY STATE */
  /* ========================= */

  empty: {
    alignItems: 'center',

    paddingTop: spacing.huge,
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

    marginTop: spacing.lg,
  },

  emptyText: {
    ...typography.body,

    color:
      lightTheme.colors.textSecondary,

    textAlign: 'center',

    marginTop: spacing.xs,
  },

  emptyButton: {
    marginTop: spacing.lg,

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

  /* ========================= */
  /* FAB */
  /* ========================= */

  fab: {
    position: 'absolute',

    right: 20,

    bottom: 34,

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

  /* ========================= */
  /* DELETE DIALOG */
  /* ========================= */

  deleteOverlay: {
    flex: 1,

    backgroundColor:
      'rgba(15, 18, 25, 0.55)',

    alignItems: 'center',

    justifyContent: 'center',

    paddingHorizontal: spacing.xl,
  },

  deleteDialog: {
    width: '100%',

    backgroundColor:
      lightTheme.colors.surface,

    borderRadius:
      lightTheme.radius.xl,

    padding: spacing.xl,

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

    marginBottom: spacing.lg,
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

    marginTop: spacing.sm,
  },

  deleteActions: {
    flexDirection: 'row',

    gap: spacing.md,

    marginTop: spacing.xxl,
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
});