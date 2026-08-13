import {configureStore} from '@reduxjs/toolkit';

import appReducer from './appSlice';
import taskReducer from '../features/tasks/taskSlice';

export const store = configureStore({
  reducer: {
    app: appReducer,
    tasks: taskReducer,
  },
});

export type RootState = ReturnType<
  typeof store.getState
>;

export type AppDispatch = typeof store.dispatch;