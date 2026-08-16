import React, { useEffect } from 'react';

import {AppProviders} from './src/app/providers/AppProviders';
import {RootNavigator} from './src/navigation/RootNavigator';
import { initializeNotifications } from './src/features/notifications/notificationService';


function App() {
  useEffect(() => {
  void initializeNotifications();
}, []);

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
      <RootNavigator />
    </AppProviders>
  );
}

export default App;