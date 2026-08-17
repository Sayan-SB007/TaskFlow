import React, {useEffect} from 'react';

import {
  NavigationContainer,
} from '@react-navigation/native';

import BootSplash from 'react-native-bootsplash';

import {AppProviders} from './src/app/providers/AppProviders';

import {RootNavigator} from './src/navigation/RootNavigator';

import {
  initializeNotifications,
} from './src/features/notifications/notificationService';


function App() {

  useEffect(() => {

    initializeNotifications()
      .then(granted => {

        console.log(
          'NOTIFICATION: Initialized',
          {
            granted,
          },
        );

      })
      .catch(error => {

        console.warn(
          'NOTIFICATION: Initialization error',
          error,
        );

      });

  }, []);


  return (

    <AppProviders>

      <NavigationContainer
        onReady={() => {

          BootSplash.hide({
            fade: true,
          });

        }}
      >

        <RootNavigator />

      </NavigationContainer>

    </AppProviders>

  );

}


export default App;