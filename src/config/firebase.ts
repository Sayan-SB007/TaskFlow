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

import {env} from './env';


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
  apiKey: env.firebase.apiKey,
  authDomain: env.firebase.authDomain,
  projectId: env.firebase.projectId,
  storageBucket: env.firebase.storageBucket,
  messagingSenderId:
    env.firebase.messagingSenderId,
  appId: env.firebase.appId,
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


let firebaseAuth: Auth;


try {
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