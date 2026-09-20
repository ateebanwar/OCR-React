import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { WorkspacePage } from '@/features/converter/WorkspacePage';
import { DocumentChatPage } from '@/features/chat/DocumentChatPage';
import { SettingsPage } from '@/features/settings/SettingsPage';
import { AboutPage } from '@/features/about/AboutPage';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { ErrorBoundary } from '@/components/feedback/ErrorBoundary';
import { useDocumentSession } from '@/application/orchestration/DocumentSessionContext';

const OnboardingGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useDocumentSession();
  if (!profile.isOnboarded) {
    return <Navigate to="/onboarding" replace />;
  }
  return <>{children}</>;
};

export const AppRouter: React.FC = () => {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/onboarding" element={<OnboardingPage />} />

          <Route
            path="/"
            element={
              <OnboardingGuard>
                <AppShell />
              </OnboardingGuard>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="workspace" element={<WorkspacePage />} />
            <Route path="converter" element={<WorkspacePage />} />
            <Route path="documents" element={<WorkspacePage />} />
            <Route path="chat" element={<DocumentChatPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="about" element={<AboutPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
};
