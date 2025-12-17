'use client';

import { store, persistor } from '@/lib/store/store';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import LayoutWrapper from './static/LayoutWrapper';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <LayoutWrapper>{children}</LayoutWrapper>
      </PersistGate>
    </Provider>
  );
}
