import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AuditLog {
  id: number;
  timestamp: string;
  model: string;
  userInput: string;
  systemPrompt: string; // 系统提示词
  promptLength: number;
  rawOutput: string;
  outputLength: number;
  tokensUsed: number | null;
  duration: number;
  success: boolean;
  error: string | null;
}

interface AuditStats {
  total: number;
  successful: number;
  failed: number;
  totalTokens: number;
  avgDuration: number;
}

interface AuditPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * 审计面板组件 - 显示API调用的详细信息
 */
export function AuditPanel({ isOpen, onClose }: AuditPanelProps) {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [loading, setLoading] = useState(false);

  // 加载审计日志
  const loadLogs = async () => {
    setLoading(true);
    try {
      const [logsRes, statsRes] = await Promise.all([
        fetch('/api/audit/logs'),
        fetch('/api/audit/stats'),
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
    if (!confirm('确定要清空所有审计日志吗？')) return;
    
    try {
      await fetch('/api/audit/logs', { method: 'DELETE' });
      loadLogs();
      setSelectedLog(null);
    } catch (error) {
      console.error('清空日志失败:', error);
    }
  };

  // 打开时加载数据
  useEffect(() => {
    if (isOpen) {
      loadLogs();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="w-full max-w-6xl max-h-[90vh] bg-card-bg rounded-lg shadow-2xl overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="bg-gradient-to-r from-purple-900/50 to-violet-900/50 p-6 border-b border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-accent flex items-center gap-2">
                📊 API 调用审计
              </h2>
              <button
                onClick={onClose}
                className="text-text-secondary hover:text-text-primary transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* 统计信息 */}
            {stats && (
              <div className="grid grid-cols-5 gap-4 mt-4">
                <div className="bg-dark-bg/50 p-3 rounded">
                  <div className="text-text-secondary text-sm">总调用</div>
                  <div className="text-xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-dark-bg/50 p-3 rounded">
                  <div className="text-text-secondary text-sm">成功</div>
                  <div className="text-xl font-bold text-green-400">{stats.successful}</div>
                </div>
                <div className="bg-dark-bg/50 p-3 rounded">
                  <div className="text-text-secondary text-sm">失败</div>
                  <div className="text-xl font-bold text-red-400">{stats.failed}</div>
                </div>
                <div className="bg-dark-bg/50 p-3 rounded">
                  <div className="text-text-secondary text-sm">平均耗时</div>
                  <div className="text-xl font-bold">{(stats.avgDuration / 1000).toFixed(2)}s</div>
                </div>
                <div className="bg-dark-bg/50 p-3 rounded">
                  <div className="text-text-secondary text-sm">总Token</div>
                  <div className="text-xl font-bold">{stats.totalTokens || 'N/A'}</div>
                </div>
              </div>
            )}
          </div>

          <div className="flex h-[calc(90vh-200px)]">
            {/* 左侧：日志列表 */}
            <div className="w-1/2 border-r border-gray-700 overflow-y-auto">
              <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                <h3 className="font-semibold">调用记录 ({logs.length})</h3>
                <button
                  onClick={handleClearLogs}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  清空
                </button>
              </div>
              
              {loading ? (
                <div className="p-8 text-center text-text-secondary">加载中...</div>
              ) : logs.length === 0 ? (
                <div className="p-8 text-center text-text-secondary">暂无记录</div>
              ) : (
                <div className="divide-y divide-gray-700">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      onClick={() => setSelectedLog(log)}
                      className={`p-4 cursor-pointer hover:bg-dark-bg/30 transition-colors ${
                        selectedLog?.id === log.id ? 'bg-dark-bg/50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-semibold ${log.success ? 'text-green-400' : 'text-red-400'}`}>
                          {log.success ? '✓ 成功' : '✗ 失败'}
                        </span>
                        <span className="text-xs text-text-secondary">
                          {new Date(log.timestamp).toLocaleString('zh-CN')}
                        </span>
                      </div>
                      <div className="text-sm text-text-secondary truncate">
                        {log.userInput}
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-text-secondary">
                        <span>⏱️ {(log.duration / 1000).toFixed(2)}s</span>
                        <span>📝 {log.outputLength} 字符</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 右侧：详情 */}
            <div className="w-1/2 overflow-y-auto p-6">
              {selectedLog ? (
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-semibold text-accent mb-2">基本信息</h4>
                    <div className="bg-dark-bg/30 p-4 rounded space-y-2 text-sm">
                      <div><span className="text-text-secondary">模型:</span> {selectedLog.model}</div>
                      <div><span className="text-text-secondary">时间:</span> {new Date(selectedLog.timestamp).toLocaleString('zh-CN')}</div>
                      <div><span className="text-text-secondary">耗时:</span> {(selectedLog.duration / 1000).toFixed(2)} 秒</div>
                      <div><span className="text-text-secondary">状态:</span> 
                        <span className={selectedLog.success ? 'text-green-400' : 'text-red-400'}>
                          {selectedLog.success ? ' 成功' : ' 失败'}
                        </span>
                      </div>
                      {selectedLog.tokensUsed && (
                        <div><span className="text-text-secondary">Token:</span> {selectedLog.tokensUsed}</div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-accent mb-2">用户输入</h4>
                    <div className="bg-dark-bg/30 p-4 rounded text-sm whitespace-pre-wrap max-h-32 overflow-y-auto">
                      {selectedLog.userInput}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-accent mb-2">
                      系统提示词 ({selectedLog.promptLength} 字符)
                    </h4>
                    <div className="bg-dark-bg/30 p-4 rounded text-xs whitespace-pre-wrap max-h-64 overflow-y-auto font-mono">
                      {selectedLog.systemPrompt}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-semibold text-accent mb-2">
                      原始输出 ({selectedLog.outputLength} 字符)
                    </h4>
                    <div className="bg-dark-bg/30 p-4 rounded text-sm whitespace-pre-wrap max-h-96 overflow-y-auto">
                      {selectedLog.rawOutput || '(无输出)'}
                    </div>
                  </div>

                  {selectedLog.error && (
                    <div>
                      <h4 className="text-sm font-semibold text-red-400 mb-2">错误信息</h4>
                      <div className="bg-red-900/20 p-4 rounded text-sm text-red-300">
                        {selectedLog.error}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-text-secondary">
                  选择一条记录查看详情
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

