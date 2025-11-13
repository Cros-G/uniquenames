import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { PromptManagePage } from './pages/PromptManagePage';
import { AuditTablePage } from './pages/AuditTablePage';

/**
 * 主应用 - 路由配置
 */
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 前台：用户生成名字 */}
        <Route path="/" element={<HomePage />} />
        
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

