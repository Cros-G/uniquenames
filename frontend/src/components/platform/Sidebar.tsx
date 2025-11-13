import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

/**
 * 管理后台侧边栏
 */
export function Sidebar() {
  const location = useLocation();

  const menuItems = [
    {
      path: '/platform/prompts',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: '提示词管理',
    },
    {
      path: '/platform/audit',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      label: '审计日志',
    },
  ];

  return (
    <div className="w-64 bg-card-bg h-screen border-r border-gray-700 flex flex-col">
      {/* Logo区域 */}
      <div className="p-6 border-b border-gray-700">
        <Link to="/" className="flex items-center gap-3 text-text-primary hover:text-accent transition-colors">
          <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <div>
            <div className="font-bold text-lg">管理后台</div>
            <div className="text-xs text-text-secondary">返回前台</div>
          </div>
        </Link>
      </div>

      {/* 菜单项 */}
      <nav className="flex-1 p-4">
        <div className="space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path || 
                            (item.path === '/platform/prompts' && location.pathname === '/platform');
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                  ${isActive 
                    ? 'bg-accent text-white shadow-lg' 
                    : 'text-text-secondary hover:bg-dark-bg/50 hover:text-text-primary'}
                `}
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 底部信息 */}
      <div className="p-4 border-t border-gray-700 text-xs text-text-secondary">
        <div>AI 起名工具</div>
        <div>管理员控制面板</div>
      </div>
    </div>
  );
}


