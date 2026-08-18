import Config from 'react-native-config';

export type AppEnvironment = 'development' | 'staging' | 'production';

const environment = Config.APP_ENV;

const appEnvironment: AppEnvironment =
  environment === 'staging'
    ? 'staging'
    : environment === 'production'
    ? 'production'
    : 'development';

export const env = {
  app: {
    environment: appEnvironment,
  },

  firebase: {
    apiKey: Config.FIREBASE_API_KEY ?? '',

    authDomain: Config.FIREBASE_AUTH_DOMAIN ?? '',

    projectId: Config.FIREBASE_PROJECT_ID ?? '',

    storageBucket: Config.FIREBASE_STORAGE_BUCKET ?? '',

    messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID ?? '',

    appId: Config.FIREBASE_APP_ID ?? '',
  },
} as const;
