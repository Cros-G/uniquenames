/**
 * AuditLog 模型 - 审计日志管理
 */

export const AuditLog = {
  /**
   * 创建审计日志
   */
  create(db, data) {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (
        model, prompt_id, user_id, user_input, system_prompt, raw_output,
        tokens_prompt, tokens_completion, tokens_total, cost_usd,
        duration_ms, success, error,
        workflow_type, step_name, names_count, session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.model,
      data.promptId || null,
      data.userId || null,
      data.userInput,
      data.systemPrompt,
      data.rawOutput || null,
      data.tokensPrompt || null,
      data.tokensCompletion || null,
      data.tokensTotal || null,
      data.costUsd || null,
      data.durationMs,
      data.success ? 1 : 0,
      data.error || null,
      data.workflowType || 'generation',
      data.stepName || null,
      data.namesCount || null,
      data.sessionId || null
    );

    return result.lastInsertRowid;
  },

  /**
   * 根据ID查询审计日志
   */
  findById(db, id) {
    const stmt = db.prepare('SELECT * FROM audit_logs WHERE id = ?');
    return stmt.get(id) || null;
  },

  /**
   * 查询所有审计日志（支持筛选和分页）
   */
  findAll(db, options = {}) {
    let sql = 'SELECT * FROM audit_logs WHERE 1=1';
    const params = [];

    // 筛选条件
    if (options.model) {
      sql += ' AND model = ?';
      params.push(options.model);
    }

    if (options.success !== undefined) {
      sql += ' AND success = ?';
      params.push(options.success ? 1 : 0);
    }

    if (options.startDate) {
      sql += ' AND timestamp >= ?';
      params.push(options.startDate);
    }

    if (options.endDate) {
      sql += ' AND timestamp <= ?';
      params.push(options.endDate);
    }

    // 新增筛选条件：workflow_type
    if (options.workflowType) {
      sql += ' AND workflow_type = ?';
      params.push(options.workflowType);
    }

    // 新增筛选条件：step_name
    if (options.stepName) {
      sql += ' AND step_name = ?';
      params.push(options.stepName);
    }

    // 排序
    sql += ' ORDER BY timestamp DESC';

    // 分页
    if (options.limit) {
      sql += ' LIMIT ?';
      params.push(options.limit);

      if (options.offset) {
        sql += ' OFFSET ?';
        params.push(options.offset);
      }
    }

    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  /**
   * 获取统计信息
   */
  getStats(db) {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
        SUM(CASE WHEN success = 0 THEN 1 ELSE 0 END) as failed,
        COALESCE(SUM(tokens_total), 0) as totalTokens,
        COALESCE(SUM(cost_usd), 0) as totalCost,
        COALESCE(AVG(duration_ms), 0) as avgDuration
      FROM audit_logs
    `).get();

    return {
      total: stats.total,
      successful: stats.successful,
      failed: stats.failed,
      totalTokens: stats.totalTokens,
      totalCost: parseFloat(stats.totalCost.toFixed(6)),
      avgDuration: Math.round(stats.avgDuration),
    };
  },

  /**
   * 按模型分组统计
   */
  getStatsByModel(db) {
    const stmt = db.prepare(`
      SELECT 
        model,
        COUNT(*) as count,
        SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) as successful,
        COALESCE(SUM(tokens_total), 0) as totalTokens,
        COALESCE(SUM(cost_usd), 0) as totalCost
      FROM audit_logs
      GROUP BY model
      ORDER BY count DESC
    `);

    return stmt.all();
  },

  /**
   * 删除审计日志
   */
  delete(db, id) {
    const stmt = db.prepare('DELETE FROM audit_logs WHERE id = ?');
    return stmt.run(id);
  },

  /**
   * 清空所有审计日志
   */
  clear(db) {
    const stmt = db.prepare('DELETE FROM audit_logs');
    return stmt.run();
  },
};


