import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sidebar } from '../components/platform/Sidebar';

interface AuditLog {
  id: number;
  timestamp: string;
  model: string;
  prompt_id: number | null;
  user_input: string;
  system_prompt: string;
  raw_output: string;
  tokens_prompt: number | null;
  tokens_completion: number | null;
  tokens_total: number | null;
  cost_usd: number | null;
  duration_ms: number;
  success: number;
  error: string | null;
}

interface AuditStats {
  total: number;
  successful: number;
  failed: number;
  totalTokens: number;
  totalCost: number;
  avgDuration: number;
}

/**
 * 审计表格页面
 */
export function AuditTablePage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);
  const [filterModel, setFilterModel] = useState('');
  
  const PAGE_SIZE = 20;

  // 加载审计日志
  const loadLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: PAGE_SIZE.toString(),
        offset: ((page - 1) * PAGE_SIZE).toString(),
      });
      
      if (filterModel) {
        params.append('model', filterModel);
      }

      const [logsRes, statsRes] = await Promise.all([
        fetch(`/api/admin/audit?${params}`),
        fetch('/api/admin/audit/stats'),
      ]);
      
      const logsData = await logsRes.json();
      const statsData = await statsRes.json();
      
      setLogs(logsData.logs || []);
      setStats(statsData.stats || null);
    } catch (error) {
      console.error('加载审计日志失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 清空日志
  const handleClearLogs = async () => {
    if (!confirm('确定要清空所有审计日志吗？此操作不可恢复！')) return;
    
    try {
      await fetch('/api/admin/audit', { method: 'DELETE' });
      loadLogs();
      setSelectedLog(null);
    } catch (error) {
      console.error('清空日志失败:', error);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [page, filterModel]);

  // 获取所有唯一的模型（用于筛选）
  const uniqueModels = Array.from(new Set(logs.map(log => log.model)));

  return (
    <div className="flex min-h-screen bg-dark-bg">
      <Sidebar />
      
      <div className="flex-1 overflow-y-auto">
        {/* 页面头部 */}
        <div className="p-8 border-b border-gray-700">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-text-primary mb-2">📊 审计日志</h1>
              <p className="text-text-secondary">查看所有API调用记录和费用统计</p>
            </div>
            <button
              onClick={handleClearLogs}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-semibold
                         shadow-lg transition-colors"
            >
              清空日志
            </button>
          </div>

          {/* 统计卡片 */}
          {stats && (
            <div className="grid grid-cols-6 gap-4">
              <div className="bg-card-bg p-4 rounded-lg border border-gray-700">
                <div className="text-text-secondary text-sm mb-1">总调用</div>
                <div className="text-2xl font-bold">{stats.total}</div>
              </div>
              <div className="bg-card-bg p-4 rounded-lg border border-gray-700">
                <div className="text-text-secondary text-sm mb-1">成功</div>
                <div className="text-2xl font-bold text-green-400">{stats.successful}</div>
              </div>
              <div className="bg-card-bg p-4 rounded-lg border border-gray-700">
                <div className="text-text-secondary text-sm mb-1">失败</div>
                <div className="text-2xl font-bold text-red-400">{stats.failed}</div>
              </div>
              <div className="bg-card-bg p-4 rounded-lg border border-gray-700">
                <div className="text-text-secondary text-sm mb-1">总Token</div>
                <div className="text-2xl font-bold">{stats.totalTokens.toLocaleString()}</div>
              </div>
              <div className="bg-card-bg p-4 rounded-lg border border-gray-700">
                <div className="text-text-secondary text-sm mb-1">总费用</div>
                <div className="text-2xl font-bold text-yellow-400">
                  ${stats.totalCost.toFixed(4)}
                </div>
              </div>
              <div className="bg-card-bg p-4 rounded-lg border border-gray-700">
                <div className="text-text-secondary text-sm mb-1">平均耗时</div>
                <div className="text-2xl font-bold">{(stats.avgDuration / 1000).toFixed(2)}s</div>
              </div>
            </div>
          )}

          {/* 筛选器 */}
          <div className="mt-6 flex gap-4">
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="px-4 py-2 bg-card-bg border border-gray-700 rounded-lg
                         text-text-primary focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="">所有模型</option>
              {uniqueModels.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
            
            {filterModel && (
              <button
                onClick={() => setFilterModel('')}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                清除筛选
              </button>
            )}
          </div>
        </div>

        {/* 表格 */}
        <div className="p-8">
          {loading ? (
            <div className="text-center py-12 text-text-secondary">加载中...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12 text-text-secondary">暂无记录</div>
          ) : (
            <div className="bg-card-bg rounded-lg border border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-dark-bg/50 border-b border-gray-700">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">时间</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">模型</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">用户输入</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">Token</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">费用</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">耗时</th>
                    <th className="px-4 py-3 text-sm font-semibold text-text-secondary">状态</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`
                        cursor-pointer transition-colors
                        ${selectedLog?.id === log.id ? 'bg-accent/20' : 'hover:bg-dark-bg/30'}
                      `}
                      whileHover={{ backgroundColor: 'rgba(139, 92, 246, 0.1)' }}
                    >
                      <td className="px-4 py-3 text-sm">
                        {new Date(log.timestamp).toLocaleString('zh-CN', {
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className="px-2 py-1 bg-purple-900/50 rounded text-xs">
                          {log.model.split('/')[1] || log.model}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm max-w-md truncate">
                        {log.user_input}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.tokens_total ? log.tokens_total.toLocaleString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm text-yellow-400">
                        {log.cost_usd ? `$${log.cost_usd.toFixed(5)}` : '-'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {(log.duration_ms / 1000).toFixed(2)}s
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {log.success ? (
                          <span className="text-green-400">✓ 成功</span>
                        ) : (
                          <span className="text-red-400">✗ 失败</span>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* 分页 */}
          {!loading && logs.length === PAGE_SIZE && (
            <div className="flex justify-center gap-2 mt-6">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg disabled:opacity-50
                         disabled:cursor-not-allowed transition-colors"
              >
                上一页
              </button>
              <span className="px-4 py-2 text-text-secondary">
                第 {page} 页
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
              >
                下一页
              </button>
            </div>
          )}
        </div>

        {/* 详情侧边栏 */}
        {selectedLog && (
          <motion.div
            className="fixed right-0 top-0 w-1/2 h-full bg-card-bg border-l border-gray-700 overflow-y-auto shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-accent">详情</h2>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* 基本信息 */}
                <div>
                  <h4 className="text-sm font-semibold text-accent mb-2">基本信息</h4>
                  <div className="bg-dark-bg/50 p-4 rounded space-y-2 text-sm">
                    <div><span className="text-text-secondary">ID:</span> {selectedLog.id}</div>
                    <div><span className="text-text-secondary">时间:</span> {new Date(selectedLog.timestamp).toLocaleString('zh-CN')}</div>
                    <div><span className="text-text-secondary">模型:</span> {selectedLog.model}</div>
                    <div><span className="text-text-secondary">耗时:</span> {(selectedLog.duration_ms / 1000).toFixed(2)} 秒</div>
                    <div>
                      <span className="text-text-secondary">状态:</span>
                      <span className={selectedLog.success ? 'text-green-400' : 'text-red-400'}>
                        {selectedLog.success ? ' ✓ 成功' : ' ✗ 失败'}
                      </span>
                    </div>
                    {selectedLog.tokens_total && (
                      <>
                        <div><span className="text-text-secondary">Prompt Token:</span> {selectedLog.tokens_prompt?.toLocaleString() || '-'}</div>
                        <div><span className="text-text-secondary">Completion Token:</span> {selectedLog.tokens_completion?.toLocaleString() || '-'}</div>
                        <div><span className="text-text-secondary">Total Token:</span> {selectedLog.tokens_total.toLocaleString()}</div>
                      </>
                    )}
                    {selectedLog.cost_usd && (
                      <div><span className="text-text-secondary">费用:</span> 
                        <span className="text-yellow-400"> ${selectedLog.cost_usd.toFixed(6)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 用户输入 */}
                <div>
                  <h4 className="text-sm font-semibold text-accent mb-2">用户输入</h4>
                  <div className="bg-dark-bg/50 p-4 rounded text-sm whitespace-pre-wrap max-h-40 overflow-y-auto">
                    {selectedLog.user_input}
                  </div>
                </div>

                {/* 系统提示词 */}
                <div>
                  <h4 className="text-sm font-semibold text-accent mb-2">
                    系统提示词 ({selectedLog.system_prompt.length} 字符)
                  </h4>
                  <div className="bg-dark-bg/50 p-4 rounded text-xs whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
                    {selectedLog.system_prompt}
                  </div>
                </div>

                {/* 原始输出 */}
                <div>
                  <h4 className="text-sm font-semibold text-accent mb-2">
                    原始输出 ({selectedLog.raw_output?.length || 0} 字符)
                  </h4>
                  <div className="bg-dark-bg/50 p-4 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                    {selectedLog.raw_output || '(无输出)'}
                  </div>
                </div>

                {/* 错误信息 */}
                {selectedLog.error && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2">错误信息</h4>
                    <div className="bg-red-900/20 p-4 rounded text-sm text-red-300">
                      {selectedLog.error}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}


