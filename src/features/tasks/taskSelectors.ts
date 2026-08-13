import {createSelector} from '@reduxjs/toolkit';

import type {RootState} from '../../app/store';

const selectTaskState = (state: RootState) =>
  state.tasks;

export const selectTasks = createSelector(
  [selectTaskState],
  taskState => taskState.items,
);

export const selectTaskFilter = createSelector(
  [selectTaskState],
  taskState => taskState.filter,
);

export const selectCompletedTasks = createSelector(
  [selectTasks],
  tasks =>
    tasks.filter(
      task => task.status === 'completed',
    ),
);

export const selectPendingTasks = createSelector(
  [selectTasks],
  tasks =>
    tasks.filter(
      task => task.status === 'pending',
    ),
);

export const selectTaskCount = createSelector(
  [selectTasks],
  tasks => tasks.length,
);

export const selectCompletedCount = createSelector(
  [selectCompletedTasks],
  tasks => tasks.length,
);

export const selectRemainingCount = createSelector(
  [selectPendingTasks],
  tasks => tasks.length,
);

export const selectProgress = createSelector(
  [selectTaskCount, selectCompletedCount],
  (total, completed) =>
    total === 0 ? 0 : completed / total,
);

export const selectVisibleTasks = createSelector(
  [selectTasks, selectTaskFilter],

  (tasks, filter) => {
    switch (filter) {
      case 'today':
        return tasks.filter(
          task => task.dueDate === 'Today',
        );

      case 'upcoming':
        return tasks.filter(
          task => task.dueDate !== 'Today',
        );

      case 'all':
      default:
        return tasks;
    }
  },
);