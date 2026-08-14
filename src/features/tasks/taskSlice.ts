import {
  createAsyncThunk,
  createSlice,
  PayloadAction,
} from '@reduxjs/toolkit';

import type {
  Task,
  TaskFilter,
  TaskPriority,
} from './types';

import {taskService} from './taskService';

interface TaskState {
  items: Task[];

  filter: TaskFilter;

  status:
    | 'idle'
    | 'loading'
    | 'success'
    | 'error';

  operation:
    | 'load'
    | 'create'
    | 'update'
    | 'toggle'
    | 'delete'
    | null;

  error: string | null;
}

interface TaskPayload {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate: string;
  dueTime?: string;
}

/* ================================================= */
/* LOAD TASKS                                        */
/* ================================================= */

export const loadTasks = createAsyncThunk(
  'tasks/loadTasks',
  async (_, {rejectWithValue}) => {
    try {
      return await taskService.getTasks();
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error),
      );
    }
  },
);

/* ================================================= */
/* ADD TASK                                          */
/* ================================================= */

export const addTask = createAsyncThunk(
  'tasks/addTask',
  async (
    payload: TaskPayload,
    {rejectWithValue},
  ) => {
    try {
      const timestamp =
        new Date().toISOString();

      const task: Task = {
        id: `task-${Date.now()}`,

        title: payload.title.trim(),

        description:
          payload.description?.trim(),

        priority: payload.priority,

        status: 'pending',

        dueDate: payload.dueDate,

        dueTime: payload.dueTime,

        createdAt: timestamp,

        updatedAt: timestamp,
      };

      return await taskService.createTask(
        task,
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error),
      );
    }
  },
);

/* ================================================= */
/* UPDATE TASK                                       */
/* ================================================= */

export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async (
    payload: TaskPayload & {
      id: string;
    },
    {rejectWithValue},
  ) => {
    try {
      const existing =
        await taskService.getTaskById(
          payload.id,
        );

      if (!existing) {
        throw new Error(
          'Task could not be found.',
        );
      }

      const task: Task = {
        ...existing,

        title: payload.title.trim(),

        description:
          payload.description?.trim(),

        priority: payload.priority,

        dueDate: payload.dueDate,

        dueTime: payload.dueTime,

        updatedAt:
          new Date().toISOString(),
      };

      return await taskService.updateTask(
        task,
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error),
      );
    }
  },
);

/* ================================================= */
/* TOGGLE TASK                                       */
/* ================================================= */

export const toggleTask = createAsyncThunk(
  'tasks/toggleTask',
  async (
    id: string,
    {rejectWithValue},
  ) => {
    try {
      const task =
        await taskService.getTaskById(id);

      if (!task) {
        throw new Error(
          'Task could not be found.',
        );
      }

      return await taskService.toggleTask(
        task,
      );
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error),
      );
    }
  },
);

/* ================================================= */
/* DELETE TASK                                       */
/* ================================================= */

export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (
    id: string,
    {rejectWithValue},
  ) => {
    try {
      await taskService.deleteTask(id);

      return id;
    } catch (error) {
      return rejectWithValue(
        getErrorMessage(error),
      );
    }
  },
);

/* ================================================= */
/* INITIAL STATE                                     */
/* ================================================= */

const initialState: TaskState = {
  items: [],

  filter: 'all',

  status: 'idle',

  operation: null,

  error: null,
};

/* ================================================= */
/* SLICE                                             */
/* ================================================= */

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

    clearTaskError: state => {
      state.error = null;
    },
  },

  extraReducers: builder => {
    /* --------------------------------------------- */
    /* LOAD                                           */
    /* --------------------------------------------- */

    builder.addCase(
      loadTasks.pending,
      state => {
        state.status = 'loading';

        state.operation = 'load';

        state.error = null;
      },
    );

    builder.addCase(
      loadTasks.fulfilled,
      (state, action) => {
        state.items = action.payload;

        state.status = 'success';

        state.operation = null;

        state.error = null;
      },
    );

    builder.addCase(
      loadTasks.rejected,
      (state, action) => {
        state.status = 'error';

        state.operation = null;

        state.error =
          action.payload as string;
      },
    );

    /* --------------------------------------------- */
    /* ADD                                            */
    /* --------------------------------------------- */

    builder.addCase(
      addTask.pending,
      state => {
        state.status = 'loading';

        state.operation = 'create';

        state.error = null;
      },
    );

    builder.addCase(
      addTask.fulfilled,
      (state, action) => {
        state.items.unshift(
          action.payload,
        );

        state.status = 'success';

        state.operation = null;

        state.error = null;
      },
    );

    builder.addCase(
      addTask.rejected,
      (state, action) => {
        state.status = 'error';

        state.operation = null;

        state.error =
          action.payload as string;
      },
    );

    /* --------------------------------------------- */
    /* UPDATE                                         */
    /* --------------------------------------------- */

    builder.addCase(
      updateTask.pending,
      state => {
        state.status = 'loading';

        state.operation = 'update';

        state.error = null;
      },
    );

    builder.addCase(
      updateTask.fulfilled,
      (state, action) => {
        const index =
          state.items.findIndex(
            item =>
              item.id ===
              action.payload.id,
          );

        if (index !== -1) {
          state.items[index] =
            action.payload;
        }

        state.status = 'success';

        state.operation = null;

        state.error = null;
      },
    );

    builder.addCase(
      updateTask.rejected,
      (state, action) => {
        state.status = 'error';

        state.operation = null;

        state.error =
          action.payload as string;
      },
    );

    /* --------------------------------------------- */
    /* TOGGLE                                         */
    /* --------------------------------------------- */

    builder.addCase(
      toggleTask.pending,
      state => {
        state.status = 'loading';

        state.operation = 'toggle';

        state.error = null;
      },
    );

    builder.addCase(
      toggleTask.fulfilled,
      (state, action) => {
        const index =
          state.items.findIndex(
            item =>
              item.id ===
              action.payload.id,
          );

        if (index !== -1) {
          state.items[index] =
            action.payload;
        }

        state.status = 'success';

        state.operation = null;
      },
    );

    builder.addCase(
      toggleTask.rejected,
      (state, action) => {
        state.status = 'error';

        state.operation = null;

        state.error =
          action.payload as string;
      },
    );

    /* --------------------------------------------- */
    /* DELETE                                         */
    /* --------------------------------------------- */

    builder.addCase(
      deleteTask.pending,
      state => {
        state.status = 'loading';

        state.operation = 'delete';

        state.error = null;
      },
    );

    builder.addCase(
      deleteTask.fulfilled,
      (state, action) => {
        state.items =
          state.items.filter(
            task =>
              task.id !==
              action.payload,
          );

        state.status = 'success';

        state.operation = null;

        state.error = null;
      },
    );

    builder.addCase(
      deleteTask.rejected,
      (state, action) => {
        state.status = 'error';

        state.operation = null;

        state.error =
          action.payload as string;
      },
    );
  },
});

/* ================================================= */
/* ACTIONS                                           */
/* ================================================= */

export const {
  setFilter,
  clearTaskError,
} = taskSlice.actions;

/* ================================================= */
/* REDUCER                                           */
/* ================================================= */

export default taskSlice.reducer;

/* ================================================= */
/* ERROR HELPER                                      */
/* ================================================= */

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Something went wrong while processing the task.';
}