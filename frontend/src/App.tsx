import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LandingPage } from './pages/LandingPage';
import { GeneratePage } from './pages/GeneratePage';
import { NarrowDownPage } from './pages/NarrowDownPage';
import { RecordsPage } from './pages/RecordsPage';
import { PromptManagePage } from './pages/PromptManagePage';
import { AuditTablePage } from './pages/AuditTablePage';

/**
 * Main App - Route Configuration
 * Note: "/" uses React LandingPage in dev, static HTML in production (via Nginx)
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing Page - 开发环境使用 React 版本 */}
        <Route path="/" element={<LandingPage />} />
        
        {/* User功能 - /app/* 路径 */}
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

