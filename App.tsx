import React, { useEffect } from 'react';

import {AppProviders} from './src/app/providers/AppProviders';
import {RootNavigator} from './src/navigation/RootNavigator';
import { initializeNotifications } from './src/features/notifications/notificationService';


function App() {
  useEffect(() => {
  void initializeNotifications();
}, []);
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

export default App;