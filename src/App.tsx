import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { WorkspacePage } from './pages/WorkspacePage';
import { NewCasePage } from './pages/NewCasePage';
import { DebatePage } from './pages/DebatePage';
import { HistoryPage } from './pages/HistoryPage';
import { TermsPage } from './pages/TermsPage';
import { PrivacyPage } from './pages/PrivacyPage';

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />

        {/* Authentication */}
        <Route path="/login" element={<LoginPage />} />

        {/* Dashboard Alias */}
        <Route path="/dashboard" element={<Navigate to="/workspace" replace />} />

        {/* New Case Intake */}
        <Route path="/workspace/new" element={<NewCasePage />} />
        <Route path="/new-case" element={<NewCasePage />} />
        <Route path="/cases/new" element={<NewCasePage />} />

        {/* Legal AI Workspace */}
        <Route path="/workspace" element={<WorkspacePage />} />
        
        {/* Saved Session Direct Link */}
        <Route path="/workspace/session/:id" element={<WorkspacePage />} />

        {/* Virtual Debate Chamber */}
        <Route path="/workspace/debate" element={<DebatePage />} />

        {/* Session Archive & History */}
        <Route path="/workspace/history" element={<HistoryPage />} />

        {/* Legal Policies */}
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />

        {/* Catch-all Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
