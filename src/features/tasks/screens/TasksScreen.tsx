import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {FlatList, Platform, Pressable, StatusBar, StyleSheet, Text, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import FontAwesome6 from '@react-native-vector-icons/fontawesome6/static';

import {useAppDispatch} from '../../../hooks/useAppDispatch';
import {useAppSelector} from '../../../hooks/useAppSelector';
import {selectCompletedCount, selectProgress, selectRemainingCount, selectTaskCount, selectTaskFilter} from '../taskSelectors';
import {deleteTask, loadTasks, setFilter, toggleTask} from '../taskSlice';
import type {Task, TaskFilter} from '../types';
import {TaskCard} from '../components/TaskCard';
import {ProductivityCard} from '../components/ProductivityCard';
import {TaskFormSheet} from '../components/TaskFormSheet';
import {TaskDetailsSheet} from '../components/TaskDetailsSheet';
import {TasksHeader} from '../components/TasksHeader';
import {TaskEmptyState} from '../components/TaskEmptyState';
import {DeleteConfirmation} from '../components/DeleteConfirmation';
import {NotificationsSheet} from '../components/NotificationsSheet';
import {TaskLoadingOverlay} from '../components/TaskLoadingOverlay';
import {spacing} from '../../../theme/spacing';
import {useTheme} from '../../../app/providers/ThemeProvider';
import {debugTasks} from '../../../database/debug';
import {firebaseAuth} from '../../../config/firebase';
import {parseTaskDate, startOfDay, isSameDay, isToday} from '../utils/taskDateUtils';
import { TaskFilters } from '../components/TaskFilter';

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

export function TasksScreen() {
  const {theme, isDark} = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const dispatch = useAppDispatch();
  const insets = useSafeAreaInsets();

  const [formVisible, setFormVisible] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [deleteVisible, setDeleteVisible] = useState(false);
  const [taskToDeleteId, setTaskToDeleteId] = useState<string | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);

  const allTasks = useAppSelector(state => state.tasks.items);
  const filter = useAppSelector(selectTaskFilter);
  const total = useAppSelector(selectTaskCount);
  const completed = useAppSelector(selectCompletedCount);
  const remaining = useAppSelector(selectRemainingCount);
  const progress = useAppSelector(selectProgress);
  const taskStatus = useAppSelector(state => state.tasks.status);
  const taskOperation = useAppSelector(state => state.tasks.operation);

  const currentUser = firebaseAuth.currentUser;
  const userName = currentUser?.displayName?.trim() || 'there';
  const greeting = getGreeting();

  useEffect(() => {
    dispatch(loadTasks());
    debugTasks();
  }, [dispatch]);

  const visibleTasks = useMemo(() => {
    const today = startOfDay(new Date());
    if (filter === 'all') return allTasks;

    return allTasks.filter(task => {
      const taskDate = parseTaskDate(task.dueDate);
      if (!taskDate) return false;
      if (filter === 'today') return isSameDay(taskDate, today);
      if (filter === 'upcoming') return startOfDay(taskDate).getTime() > today.getTime();
      return true;
    });
  }, [allTasks, filter]);

  const selectedTask = useMemo(
    () => selectedTaskId ? allTasks.find(task => task.id === selectedTaskId) ?? null : null,
    [allTasks, selectedTaskId],
  );

  const taskToDelete = useMemo(
    () => taskToDeleteId ? allTasks.find(task => task.id === taskToDeleteId) ?? null : null,
    [allTasks, taskToDeleteId],
  );

  const todayNotifications = useMemo(() => allTasks
    .filter(task => task.status !== 'completed' && !!task.dueDate && !!task.dueTime && isToday(task.dueDate))
    .sort((a, b) => (a.dueTime ?? '').localeCompare(b.dueTime ?? '')), [allTasks]);

  const loadingMessage = taskOperation === 'create'
    ? 'Creating task...'
    : taskOperation === 'update'
      ? 'Updating task...'
      : taskOperation === 'delete'
        ? 'Deleting task...'
        : taskOperation === 'toggle'
          ? 'Updating task...'
          : 'Loading tasks...';

  const busy = taskStatus === 'loading';

  const handleToggle = useCallback((task: Task) => {
    if (busy) return;
    dispatch(toggleTask(task.id));
  }, [busy, dispatch]);

  const handleTaskPress = useCallback((task: Task) => {
    if (busy) return;
    setSelectedTaskId(task.id);
    setDetailsVisible(true);
  }, [busy]);

  const handleFilter = useCallback((value: TaskFilter) => {
    if (busy) return;
    dispatch(setFilter(value));
  }, [busy, dispatch]);

  const handleCreateTask = useCallback(() => {
    if (busy) return;
    setSelectedTaskId(null);
    setFormVisible(true);
  }, [busy]);

  const handleCloseForm = useCallback(() => {
    setFormVisible(false);
    setSelectedTaskId(null);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setDetailsVisible(false);
    setSelectedTaskId(null);
  }, []);

  const handleToggleFromDetails = useCallback((task: Task) => {
    if (busy) return;
    dispatch(toggleTask(task.id));
  }, [busy, dispatch]);

  const handleEditTask = useCallback((task: Task) => {
    if (busy) return;
    setDetailsVisible(false);
    setSelectedTaskId(task.id);
    setFormVisible(true);
  }, [busy]);

  const handleDeleteRequest = useCallback((task: Task) => {
    if (busy) return;
    setDetailsVisible(false);
    setTaskToDeleteId(task.id);
    setDeleteVisible(true);
  }, [busy]);

  const handleConfirmDelete = useCallback(() => {
    if (!taskToDeleteId) return;
    dispatch(deleteTask(taskToDeleteId));
    setDeleteVisible(false);
    setTaskToDeleteId(null);
    setSelectedTaskId(null);
    setDetailsVisible(false);
  }, [dispatch, taskToDeleteId]);

  const handleCancelDelete = useCallback(() => {
    setDeleteVisible(false);
    setTaskToDeleteId(null);
  }, []);

  const handleOpenNotifications = useCallback(() => {
    if (busy) return;
    setNotificationsVisible(true);
  }, [busy]);

  const handleCloseNotifications = useCallback(() => setNotificationsVisible(false), []);

  const handleNotificationPress = useCallback((task: Task) => {
    setNotificationsVisible(false);
    setSelectedTaskId(task.id);
    setDetailsVisible(true);
  }, []);

  const renderTask = useCallback(({item}: {item: Task}) => (
    <TaskCard task={item} onPress={handleTaskPress} onToggle={handleToggle} />
  ), [handleTaskPress, handleToggle]);

  const keyExtractor = useCallback((item: Task) => item.id, []);
  const fabBottom = Math.max(insets.bottom, 12) + 72;

  return (
    <View style={styles.safeArea}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      <FlatList
        data={visibleTasks}
        keyExtractor={keyExtractor}
        renderItem={renderTask}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, visibleTasks.length === 0 && styles.emptyListContent]}
        ListHeaderComponent={
          <>
            <TasksHeader
              greeting={greeting}
              userName={userName}
              notificationCount={todayNotifications.length}
              disabled={busy}
              onNotificationsPress={handleOpenNotifications}
            />

            <ProductivityCard total={total} completed={completed} remaining={remaining} progress={progress} />

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>My Tasks</Text>
              <Pressable onPress={() => handleFilter('all')} disabled={busy}>
                <Text style={styles.seeAll}>See all</Text>
              </Pressable>
            </View>

            <TaskFilters value={filter} disabled={busy} onChange={handleFilter} />
          </>
        }
        ListEmptyComponent={<TaskEmptyState disabled={busy} onCreate={handleCreateTask} />}
        ItemSeparatorComponent={() => <View style={styles.taskSeparator} />}
        initialNumToRender={8}
        maxToRenderPerBatch={8}
        windowSize={7}
        removeClippedSubviews={Platform.OS === 'android'}
      />

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create new task"
        onPress={handleCreateTask}
        disabled={busy}
        style={({pressed}) => [styles.fab, {bottom: fabBottom}, pressed && styles.fabPressed, busy && styles.disabled]}>
        <FontAwesome6 name="plus" size={20} color="#FFFFFF" iconStyle="solid" />
      </Pressable>

      <TaskFormSheet visible={formVisible} task={selectedTask} onClose={handleCloseForm} />

      <TaskDetailsSheet
        visible={detailsVisible}
        task={selectedTask}
        onClose={handleCloseDetails}
        onToggle={handleToggleFromDetails}
        onEdit={handleEditTask}
        onDelete={handleDeleteRequest}
      />

      <DeleteConfirmation
        visible={deleteVisible}
        task={taskToDelete}
        onCancel={handleCancelDelete}
        onConfirm={handleConfirmDelete}
      />

      <NotificationsSheet
        visible={notificationsVisible}
        notifications={todayNotifications}
        onClose={handleCloseNotifications}
        onPress={handleNotificationPress}
      />

      <TaskLoadingOverlay visible={busy} message={loadingMessage} />
    </View>
  );
}

type AppTheme = ReturnType<typeof useTheme>['theme'];
const createStyles = (theme: AppTheme) => StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight ?? 0 : 0,
  },
  content: {paddingHorizontal: spacing.xl, paddingBottom: 150},
  emptyListContent: {flexGrow: 1},
  sectionHeader: {flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.xl, marginBottom: spacing.md},
  sectionTitle: {fontSize: 22, fontWeight: '700', color: theme.colors.text},
  seeAll: {fontSize: 15, fontWeight: '700', color: theme.colors.primary},
  taskSeparator: {height: spacing.md},
  fab: {position: 'absolute', right: spacing.xl, width: 58, height: 58, borderRadius: 18, backgroundColor: theme.colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 7, shadowColor: '#000000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.18, shadowRadius: 7},
  fabPressed: {opacity: 0.85, transform: [{scale: 0.96}]},
  disabled: {opacity: 0.5},
});
