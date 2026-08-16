import {AppRegistry} from 'react-native';

import App from './App';

import {
  name as appName,
} from './app.json';

import {
  registerNotificationBackgroundHandler,
} from './src/features/notifications/notificationHandlers';


/* ================================================= */
/* NOTIFICATION BACKGROUND HANDLER                   */
/* ================================================= */

registerNotificationBackgroundHandler();


/* ================================================= */
/* REGISTER APP                                      */
/* ================================================= */

AppRegistry.registerComponent(
  appName,
  () => App,
);