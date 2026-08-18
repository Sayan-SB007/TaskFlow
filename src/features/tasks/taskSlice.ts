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

import {
  taskService,
} from './taskService';

import {
  syncTasks,
} from '../sync/syncService';

import {
  scheduleTaskReminder,
  cancelTaskReminder,
} from '../notifications/notificationService';


/* ================================================= */
/* STATE                                             */
/* ================================================= */

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


/* ================================================= */
/* PAYLOAD                                           */
/* ================================================= */

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

export const loadTasks =
  createAsyncThunk(

    'tasks/loadTasks',

    async (
      _,
      {rejectWithValue},
    ) => {

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
/* REFRESH TASKS                                     */
/* ================================================= */

/*
 * Used after synchronization.
 *
 * IMPORTANT:
 *
 * This refreshes Redux from SQLite without
 * changing the visible loading/operation state.
 *
 * This fixes the initial hydration problem:
 *
 * Firestore
 *    ↓
 * SQLite
 *    ↓
 * Redux
 *    ↓
 * UI
 */
export const refreshTasks =
  createAsyncThunk(

    'tasks/refreshTasks',

    async (
      _,
      {rejectWithValue},
    ) => {

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

export const addTask =
  createAsyncThunk(

    'tasks/addTask',

    async (

      payload: TaskPayload,

      {rejectWithValue},

    ) => {

      try {

        const timestamp =
          new Date().toISOString();


        const task: Task = {

          id:
            `task-${Date.now()}`,

          title:
            payload.title.trim(),

          description:
            payload.description?.trim(),

          priority:
            payload.priority,

          status:
            'pending',

          dueDate:
            payload.dueDate,

          dueTime:
            payload.dueTime,

          createdAt:
            timestamp,

          updatedAt:
            timestamp,
        };


        /* ============================================= */
        /* STEP 1 — SAVE TO SQLITE                       */
        /* ============================================= */

        const createdTask =
          await taskService.createTask(
            task,
          );


        /* ============================================= */
        /* STEP 2 — SCHEDULE NOTIFICATION                */
        /* ============================================= */

        void scheduleTaskReminder(
          createdTask,
        ).catch(error => {

          console.warn(
            'NOTIFICATION: Failed to schedule created task reminder',
            error,
          );
        });


        /* ============================================= */
        /* STEP 3 — BACKGROUND SYNC                      */
        /* ============================================= */

        /*
         * IMPORTANT:
         *
         * syncTasks() is now debounced.
         *
         * The task is already safely stored
         * in SQLite before this runs.
         *
         * The UI does not wait for Firebase.
         */
        void syncTasks();


        return createdTask;

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

export const updateTask =
  createAsyncThunk(

    'tasks/updateTask',

    async (

      payload: TaskPayload & {
        id: string;
      },

      {rejectWithValue},

    ) => {

      try {

        /* ============================================= */
        /* GET EXISTING TASK                             */
        /* ============================================= */

        const existing =
          await taskService.getTaskById(
            payload.id,
          );


        if (!existing) {

          throw new Error(
            'Task could not be found.',
          );
        }


        /* ============================================= */
        /* BUILD UPDATED TASK                            */
        /* ============================================= */

        const task: Task = {

          ...existing,

          title:
            payload.title.trim(),

          description:
            payload.description?.trim(),

          priority:
            payload.priority,

          dueDate:
            payload.dueDate,

          dueTime:
            payload.dueTime,

          updatedAt:
            new Date().toISOString(),
        };


        /* ============================================= */
        /* STEP 1 — UPDATE SQLITE                       */
        /* ============================================= */

        const updatedTask =
          await taskService.updateTask(
            task,
          );


        /* ============================================= */
        /* STEP 2 — UPDATE NOTIFICATION                 */
        /* ============================================= */

        void scheduleTaskReminder(
          updatedTask,
        ).catch(error => {

          console.warn(
            'NOTIFICATION: Failed to reschedule updated task',
            error,
          );
        });


        /* ============================================= */
        /* STEP 3 — BACKGROUND SYNC                      */
        /* ============================================= */

        void syncTasks();


        return updatedTask;

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

export const toggleTask =
  createAsyncThunk(

    'tasks/toggleTask',

    async (

      id: string,

      {rejectWithValue},

    ) => {

      try {

        /* ============================================= */
        /* GET EXISTING TASK                             */
        /* ============================================= */

        const task =
          await taskService.getTaskById(
            id,
          );


        if (!task) {

          throw new Error(
            'Task could not be found.',
          );
        }


        /* ============================================= */
        /* STEP 1 — UPDATE SQLITE                       */
        /* ============================================= */

        const updatedTask =
          await taskService.toggleTask(
            task,
          );


        /* ============================================= */
        /* STEP 2 — UPDATE NOTIFICATION                 */
        /* ============================================= */

        void scheduleTaskReminder(
          updatedTask,
        ).catch(error => {

          console.warn(
            'NOTIFICATION: Failed to update task reminder',
            error,
          );
        });


        /* ============================================= */
        /* STEP 3 — BACKGROUND SYNC                      */
        /* ============================================= */

        void syncTasks();


        return updatedTask;

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

export const deleteTask =
  createAsyncThunk(

    'tasks/deleteTask',

    async (

      id: string,

      {rejectWithValue},

    ) => {

      try {

        /* ============================================= */
        /* STEP 1 — DELETE FROM SQLITE                  */
        /* ============================================= */

        await taskService.deleteTask(
          id,
        );


        /* ============================================= */
        /* STEP 2 — CANCEL NOTIFICATION                 */
        /* ============================================= */

        void cancelTaskReminder(
          id,
        ).catch(error => {

          console.warn(
            'NOTIFICATION: Failed to cancel deleted task reminder',
            error,
          );
        });


        /* ============================================= */
        /* STEP 3 — BACKGROUND SYNC                      */
        /* ============================================= */

        void syncTasks();


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

  filter:
    'all',

  status:
    'idle',

  operation:
    null,

  error:
    null,
};


/* ================================================= */
/* SLICE                                             */
/* ================================================= */

const taskSlice =
  createSlice({

    name:
      'tasks',

    initialState,

    reducers: {

      /* ============================================= */
      /* SET FILTER                                    */
      /* ============================================= */

      setFilter: (

        state,

        action:
          PayloadAction<TaskFilter>,

      ) => {

        state.filter =
          action.payload;
      },


      /* ============================================= */
      /* CLEAR ERROR                                   */
      /* ============================================= */

      clearTaskError:
        state => {

          state.error =
            null;
        },
    },


    /* ================================================= */
    /* EXTRA REDUCERS                                   */
    /* ================================================= */

    extraReducers:
      builder => {


        /* ============================================= */
        /* LOAD TASKS                                    */
        /* ============================================= */

        builder.addCase(

          loadTasks.pending,

          state => {

            state.status =
              'loading';

            state.operation =
              'load';

            state.error =
              null;
          },
        );


        builder.addCase(

          loadTasks.fulfilled,

          (
            state,
            action,
          ) => {

            state.items =
              action.payload;

            state.status =
              'success';

            state.operation =
              null;

            state.error =
              null;
          },
        );


        builder.addCase(

          loadTasks.rejected,

          (
            state,
            action,
          ) => {

            state.status =
              'error';

            state.operation =
              null;

            state.error =
              action.payload as string;
          },
        );


        /* ============================================= */
        /* REFRESH TASKS                                 */
        /* ============================================= */

        builder.addCase(

          refreshTasks.fulfilled,

          (
            state,
            action,
          ) => {

            /*
             * IMPORTANT:
             *
             * Do NOT set status to loading.
             *
             * The user should not see a loading
             * overlay every time synchronization
             * refreshes local data.
             */
            state.items =
              action.payload;
          },
        );


        builder.addCase(

          refreshTasks.rejected,

          (
            state,
            action,
          ) => {

            /*
             * Refresh failure should not destroy
             * the currently visible task list.
             *
             * Keep the existing state and only
             * record the error.
             */
            state.error =
              action.payload as string;
          },
        );


        /* ============================================= */
        /* ADD TASK                                      */
        /* ============================================= */

        builder.addCase(

          addTask.pending,

          state => {

            state.status =
              'loading';

            state.operation =
              'create';

            state.error =
              null;
          },
        );


        builder.addCase(

          addTask.fulfilled,

          (
            state,
            action,
          ) => {

            state.items.unshift(
              action.payload,
            );

            state.status =
              'success';

            state.operation =
              null;

            state.error =
              null;
          },
        );


        builder.addCase(

          addTask.rejected,

          (
            state,
            action,
          ) => {

            state.status =
              'error';

            state.operation =
              null;

            state.error =
              action.payload as string;
          },
        );


        /* ============================================= */
        /* UPDATE TASK                                   */
        /* ============================================= */

        builder.addCase(

          updateTask.pending,

          state => {

            state.status =
              'loading';

            state.operation =
              'update';

            state.error =
              null;
          },
        );


        builder.addCase(

          updateTask.fulfilled,

          (
            state,
            action,
          ) => {

            const index =
              state.items.findIndex(

                item =>
                  item.id ===
                  action.payload.id,

              );


            if (
              index !== -1
            ) {

              state.items[index] =
                action.payload;
            }


            state.status =
              'success';

            state.operation =
              null;

            state.error =
              null;
          },
        );


        builder.addCase(

          updateTask.rejected,

          (
            state,
            action,
          ) => {

            state.status =
              'error';

            state.operation =
              null;

            state.error =
              action.payload as string;
          },
        );


        /* ============================================= */
        /* TOGGLE TASK                                   */
        /* ============================================= */

        builder.addCase(

          toggleTask.pending,

          state => {

            state.status =
              'loading';

            state.operation =
              'toggle';

            state.error =
              null;
          },
        );


        builder.addCase(

          toggleTask.fulfilled,

          (
            state,
            action,
          ) => {

            const index =
              state.items.findIndex(

                item =>
                  item.id ===
                  action.payload.id,

              );


            if (
              index !== -1
            ) {

              state.items[index] =
                action.payload;
            }


            state.status =
              'success';

            state.operation =
              null;
          },
        );


        builder.addCase(

          toggleTask.rejected,

          (
            state,
            action,
          ) => {

            state.status =
              'error';

            state.operation =
              null;

            state.error =
              action.payload as string;
          },
        );


        /* ============================================= */
        /* DELETE TASK                                   */
        /* ============================================= */

        builder.addCase(

          deleteTask.pending,

          state => {

            state.status =
              'loading';

            state.operation =
              'delete';

            state.error =
              null;
          },
        );


        builder.addCase(

          deleteTask.fulfilled,

          (
            state,
            action,
          ) => {

            state.items =
              state.items.filter(

                task =>
                  task.id !==
                  action.payload,

              );


            state.status =
              'success';

            state.operation =
              null;

            state.error =
              null;
          },
        );


        builder.addCase(

          deleteTask.rejected,

          (
            state,
            action,
          ) => {

            state.status =
              'error';

            state.operation =
              null;

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

  if (
    error instanceof Error
  ) {

    return error.message;
  }

  return (
    'Something went wrong while processing the task.'
  );
}