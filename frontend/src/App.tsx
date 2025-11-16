import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { AuthCallback } from './pages/AuthCallback';
import { GeneratePage } from './pages/GeneratePage';
import { NarrowDownPage } from './pages/NarrowDownPage';
import { RecordsPage } from './pages/RecordsPage';
import { PromptManagePage } from './pages/PromptManagePage';
import { AuditTablePage } from './pages/AuditTablePage';
import { PrivacyPage } from './pages/PrivacyPage';
import { TermsPage } from './pages/TermsPage';

/**
 * Main App - Route Configuration
 * Note: "/" uses React LandingPage in dev, static HTML in production (via Nginx)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Pages */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/privacy" element={<PrivacyPage />} />
        <Route path="/terms" element={<TermsPage />} />
        
        {/* User功能 - /app/* 路径（暂时可匿名访问，有使用限制） */}
        <Route path="/app/generate" element={<GeneratePage />} />
        <Route path="/app/narrow-down" element={<NarrowDownPage />} />
        <Route path="/app/records" element={<RecordsPage />} />
        
        {/* 管理后台 */}
        <Route path="/platform" element={<Navigate to="/platform/prompts" replace />} />
        <Route path="/platform/prompts" element={<PromptManagePage />} />
        <Route path="/platform/audit" element={<AuditTablePage />} />
        
        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

