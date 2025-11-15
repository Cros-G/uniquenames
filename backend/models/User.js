/**
 * User 模型 - 用户管理
 */

export const User = {
  /**
   * 创建或获取用户
   * @param {object} db - 数据库连接
   * @param {string} userId - 用户 ID
   * @returns {object} 用户信息
   */
  findOrCreate(db, userId) {
    // 查找用户
    let user = db.prepare('SELECT * FROM users WHERE user_id = ?').get(userId);
    
    if (!user) {
      // 创建新用户
      const stmt = db.prepare(`
        INSERT INTO users (user_id, display_name, last_login)
        VALUES (?, ?, CURRENT_TIMESTAMP)
      `);
      
      const result = stmt.run(userId, `User_${userId.slice(-8)}`);
      
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    } else {
      // 更新最后登录时间
      db.prepare('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE user_id = ?')
        .run(userId);
    }
    
    return user;
  },

  /**
   * 根据 user_id 查询用户
   */
  findByUserId(db, userId) {
    const stmt = db.prepare('SELECT * FROM users WHERE user_id = ?');
    return stmt.get(userId) || null;
  },

  /**
   * 更新用户信息（用于后续登录功能）
   */
  update(db, userId, data) {
    const fields = [];
    const values = [];
    
    if (data.email !== undefined) {
      fields.push('email = ?');
      values.push(data.email);
    }
    if (data.google_id !== undefined) {
      fields.push('google_id = ?');
      values.push(data.google_id);
    }
    if (data.display_name !== undefined) {
      fields.push('display_name = ?');
      values.push(data.display_name);
    }
    if (data.avatar_url !== undefined) {
      fields.push('avatar_url = ?');
      values.push(data.avatar_url);
    }
    
    if (fields.length === 0) return null;
    
    values.push(userId);
    
    const stmt = db.prepare(`
      UPDATE users 
      SET ${fields.join(', ')}
      WHERE user_id = ?
    `);
    
    stmt.run(...values);
    
    return this.findByUserId(db, userId);
  },

  /**
   * 获取用户的活动历史
   * @param {object} db - 数据库连接
   * @param {string} userId - 用户 ID
   * @param {object} options - 查询选项 { limit, offset, workflowType }
   * @returns {array} 活动列表
   */
  getActivities(db, userId, options = {}) {
    const { limit = 20, offset = 0, workflowType = null } = options;
    
    let sql = `
      SELECT 
        id,
        timestamp,
        model,
        user_input,
        tokens_prompt,
        tokens_completion,
        tokens_total,
        cost_usd,
        duration_ms,
        workflow_type,
        step_name,
        names_count,
        success,
        error
      FROM audit_logs
      WHERE user_id = ?
    `;
    
    const params = [userId];
    
    if (workflowType) {
      sql += ' AND workflow_type = ?';
      params.push(workflowType);
    }
    
    sql += ' ORDER BY timestamp DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const stmt = db.prepare(sql);
    return stmt.all(...params);
  },

  /**
   * 获取用户的活动统计
   */
  getActivityStats(db, userId) {
    const stmt = db.prepare(`
      SELECT 
        workflow_type,
        COUNT(*) as count,
        SUM(tokens_total) as total_tokens,
        SUM(cost_usd) as total_cost,
        SUM(duration_ms) as total_duration
      FROM audit_logs
      WHERE user_id = ? AND success = 1
      GROUP BY workflow_type
    `);
    
    const stats = stmt.all(userId);
    
    return {
      generation: stats.find(s => s.workflow_type === 'generation') || { count: 0, total_tokens: 0, total_cost: 0, total_duration: 0 },
      narrow_down: stats.find(s => s.workflow_type === 'narrow_down') || { count: 0, total_tokens: 0, total_cost: 0, total_duration: 0 },
    };
  },
};

