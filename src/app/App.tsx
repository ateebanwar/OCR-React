import React from 'react';
import { DocumentSessionProvider } from '@/application/orchestration/DocumentSessionContext';
import { AppRouter } from './router/AppRouter';

export const App: React.FC = () => {
  return (
    <DocumentSessionProvider>
      <AppRouter />
    </DocumentSessionProvider>
  );
};
