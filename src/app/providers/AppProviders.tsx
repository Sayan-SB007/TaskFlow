import React, { PropsWithChildren } from 'react';

import { Provider } from 'react-redux';

import { store } from '../store';
import { ThemeProvider } from './ThemeProvider';

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <Provider store={store}>
      <ThemeProvider>{children}</ThemeProvider>
    </Provider>
  );
}
