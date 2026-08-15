import {
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';

import {
  getAuth,
  initializeAuth,
  type Auth,
} from 'firebase/auth';

import {
  createAsyncStorage,
} from '@react-native-async-storage/async-storage';

import {
  getFirestore,
} from 'firebase/firestore';


/* ================================================= */
/* REACT NATIVE PERSISTENCE                          */
/* ================================================= */

const {
  getReactNativePersistence,
} = require('firebase/auth') as {
  getReactNativePersistence: (
    storage: {
      getItem: (
        key: string,
      ) => Promise<string | null>;

      setItem: (
        key: string,
        value: string,
      ) => Promise<void>;

      removeItem: (
        key: string,
      ) => Promise<void>;
    },
  ) => any;
};


/* ================================================= */
/* FIREBASE CONFIG                                   */
/* ================================================= */

const firebaseConfig = {
  apiKey: 'AIzaSyBoOjhdfssDftAY73ekIVel3irdUVdXXWA',
  authDomain: 'taskflow-feac9.firebaseapp.com',
  projectId: 'taskflow-feac9',
  storageBucket: 'taskflow-feac9.firebasestorage.app',
  messagingSenderId: '135695161045',
  appId: '1:135695161045:web:dc4b217758688f40fff45c',
};

/* ================================================= */
/* FIREBASE APP                                      */
/* ================================================= */

export const firebaseApp =
  getApps().length > 0
    ? getApp()
    : initializeApp(
        firebaseConfig,
      );


/* ================================================= */
/* AUTH                                              */
/* ================================================= */

const appStorage =
  createAsyncStorage('taskflow');


/*
 * IMPORTANT:
 *
 * Explicitly tell TypeScript that this
 * variable is Firebase Auth.
 *
 * Without this annotation:
 *
 *     let firebaseAuth;
 *
 * TypeScript treats it as implicit `any`.
 */
let firebaseAuth: Auth;


try {
  /*
   * First app load:
   *
   * Initialize Firebase Auth with
   * React Native AsyncStorage persistence.
   */
  firebaseAuth =
    initializeAuth(
      firebaseApp,
      {
        persistence:
          getReactNativePersistence(
            appStorage,
          ),
      },
    );
} catch (error) {
  /*
   * During React Native Fast Refresh,
   * Firebase Auth may already have been
   * initialized.
   *
   * In that situation, reuse the existing
   * Auth instance.
   */
  if (
    error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as {code?: string}).code ===
      'auth/already-initialized'
  ) {
    firebaseAuth =
      getAuth(firebaseApp);
  } else {
    throw error;
  }
}


export {
  firebaseAuth,
};


/* ================================================= */
/* FIRESTORE                                         */
/* ================================================= */

export const firestoreDb =
  getFirestore(firebaseApp);