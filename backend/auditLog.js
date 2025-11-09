/**
 * 审计日志模块
 * 记录每次 AI API 调用的详细信息
 */

// 内存存储审计日志（生产环境应该用数据库）
const auditLogs = [];
const MAX_LOGS = 100; // 最多保留100条记录

/**
 * 记录一次 API 调用
 */
export function logAPICall(data) {
  const log = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    model: data.model || 'anthropic/claude-3.5-sonnet',
    userInput: data.userInput,
    systemPrompt: data.systemPrompt, // 系统提示词
    promptLength: data.systemPrompt?.length || 0,
    rawOutput: data.rawOutput,
    outputLength: data.rawOutput?.length || 0,
    tokensUsed: data.tokensUsed || null,
    duration: data.duration, // 毫秒
    success: data.success,
    error: data.error || null,
  };

  auditLogs.unshift(log); // 最新的在前面
  
  // 限制日志数量
  if (auditLogs.length > MAX_LOGS) {
    auditLogs.pop();
  }

  console.log('📝 [Audit] 记录日志 ID:', log.id);
  
  return log;
}

/**
 * 获取所有审计日志
 */
export function getAuditLogs(limit = 50) {
  return auditLogs.slice(0, limit);
}

/**
 * 获取单个审计日志
 */
export function getAuditLog(id) {
  return auditLogs.find(log => log.id === parseInt(id));
}

/**
 * 清空审计日志
 */
export function clearAuditLogs() {
  const count = auditLogs.length;
  auditLogs.length = 0;
  console.log('🗑️ [Audit] 清空了', count, '条日志');
  return count;
}

/**
 * 获取统计信息
 */
export function getAuditStats() {
  const total = auditLogs.length;
  const successful = auditLogs.filter(log => log.success).length;
  const failed = total - successful;
  const totalTokens = auditLogs.reduce((sum, log) => sum + (log.tokensUsed || 0), 0);
  const avgDuration = total > 0 
    ? auditLogs.reduce((sum, log) => sum + log.duration, 0) / total 
    : 0;

  return {
    total,
    successful,
    failed,
    totalTokens,
    avgDuration: Math.round(avgDuration),
  };
}

