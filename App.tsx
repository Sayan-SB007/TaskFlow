import React from 'react';

import {AppProviders} from './src/app/providers/AppProviders';
import {RootNavigator} from './src/navigation/RootNavigator';

function App() {
  return (
    <AppProviders>
      <RootNavigator />
    </AppProviders>
  );
}

export default App;