import {initializeApp} from 'firebase/app';

import {initializeAuth} from 'firebase/auth';

import {createAsyncStorage} from '@react-native-async-storage/async-storage';

const {
  getReactNativePersistence,
} = require('firebase/auth') as {
  getReactNativePersistence: (
    storage: {
      getItem: (key: string) => Promise<string | null>;
      setItem: (key: string, value: string) => Promise<void>;
      removeItem: (key: string) => Promise<void>;
    },
  ) => any;
};

const firebaseConfig = {
  apiKey: 'AIzaSyBoOjhdfssDftAY73ekIVel3irdUVdXXWA',
  authDomain: 'taskflow-feac9.firebaseapp.com',
  projectId: 'taskflow-feac9',
  storageBucket: 'taskflow-feac9.firebasestorage.app',
  messagingSenderId: '135695161045',
  appId: '1:135695161045:web:dc4b217758688f40fff45c',
};

export const firebaseApp = initializeApp(firebaseConfig);

const appStorage = createAsyncStorage('taskflow');

export const firebaseAuth = initializeAuth(firebaseApp, {
  persistence: getReactNativePersistence(appStorage),
});