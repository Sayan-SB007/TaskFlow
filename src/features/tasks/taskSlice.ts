import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type {
  Task,
  TaskFilter,
  TaskPriority,
} from './types';

interface TaskState {
  items: Task[];
  filter: TaskFilter;
  status: 'idle' | 'loading' | 'success' | 'error';
  error: string | null;
}

const now = new Date().toISOString();

const initialState: TaskState = {
  items: [
    {
      id: 'task-1',
      title: 'Complete React Native assignment',
      description:
        'Finish the offline-first architecture and polish the UI.',
      priority: 'high',
      status: 'pending',
      dueDate: 'Today',
      dueTime: '10:30 AM',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-2',
      title: 'Review project architecture',
      description:
        'Review navigation, state management and folder structure.',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Tomorrow',
      dueTime: '2:00 PM',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-3',
      title: 'Setup React Native project',
      priority: 'low',
      status: 'completed',
      dueDate: 'Yesterday',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-4',
      title: 'Prepare technical documentation',
      description:
        'Document architecture decisions and known limitations.',
      priority: 'medium',
      status: 'pending',
      dueDate: 'Friday',
      dueTime: '5:00 PM',
      createdAt: now,
      updatedAt: now,
    },
    {
      id: 'task-5',
      title: 'Record Loom walkthrough',
      priority: 'low',
      status: 'pending',
      dueDate: 'Friday',
      dueTime: '7:00 PM',
      createdAt: now,
      updatedAt: now,
    },
  ],

  filter: 'all',
  status: 'success',
  error: null,
};

const taskSlice = createSlice({
  name: 'tasks',

  initialState,

  reducers: {
    setFilter: (
      state,
      action: PayloadAction<TaskFilter>,
    ) => {
      state.filter = action.payload;
    },

    toggleTask: (
      state,
      action: PayloadAction<string>,
    ) => {
      const task = state.items.find(
        item => item.id === action.payload,
      );

      if (!task) {
        return;
      }

      task.status =
        task.status === 'completed'
          ? 'pending'
          : 'completed';

      task.updatedAt = new Date().toISOString();
    },

    addTask: (
      state,
      action: PayloadAction<{
        title: string;
        description?: string;
        priority: TaskPriority;
        dueDate: string;
        dueTime?: string;
      }>,
    ) => {
      const timestamp = new Date().toISOString();

      state.items.unshift({
        id: `task-${Date.now()}`,
        title: action.payload.title,
        description: action.payload.description,
        priority: action.payload.priority,
        status: 'pending',
        dueDate: action.payload.dueDate,
        dueTime: action.payload.dueTime,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
    },

    updateTask: (
      state,
      action: PayloadAction<{
        id: string;
        title: string;
        description?: string;
        priority: TaskPriority;
        dueDate: string;
        dueTime?: string;
      }>,
    ) => {
      const task = state.items.find(
        item => item.id === action.payload.id,
      );

      if (!task) {
        return;
      }

      task.title = action.payload.title;
      task.description =
        action.payload.description;
      task.priority =
        action.payload.priority;
      task.dueDate =
        action.payload.dueDate;
      task.dueTime =
        action.payload.dueTime;

      task.updatedAt =
        new Date().toISOString();
    },

    deleteTask: (
      state,
      action: PayloadAction<string>,
    ) => {
      state.items = state.items.filter(
        task => task.id !== action.payload,
      );
    },
  },
});

export const {
  setFilter,
  toggleTask,
  addTask,
  updateTask,
  deleteTask,
} = taskSlice.actions;

export default taskSlice.reducer;