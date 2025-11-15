import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import { getDatabase } from '../db/init.js';
import { migrateAnonymousHistory } from '../controllers/userController.js';

/**
 * 迁移 API 测试
 * 测试 /api/user/migrate 端点
 */
describe('Migration API', () => {
  let db;
  let req;
  let res;

  beforeEach(() => {
    // 使用真实数据库进行集成测试
    db = getDatabase();
    
    // Mock request 和 response
    req = {
      body: {},
    };
    
    res = {
      status: function(code) {
        this.statusCode = code;
        return this;
      },
      json: function(data) {
        this.data = data;
        return this;
      },
    };
  });

  afterEach(() => {
    // 清理测试数据
    try {
      db.prepare('DELETE FROM audit_logs WHERE user_id LIKE ?').run('anon_%');
      db.prepare('DELETE FROM audit_logs WHERE user_id LIKE ?').run('real-uuid%');
    } catch (e) {
      // 忽略清理错误
    }
  });

  test('应该拒绝缺少参数的请求', async () => {
    req.body = { anonymousUserId: 'anon_123' }; // 缺少 supabaseUserId
    
    await migrateAnonymousHistory(req, res);
    
    expect(res.statusCode).toBe(400);
    expect(res.data.error).toContain('缺少必要参数');
  });

  test('应该成功迁移匿名记录', async () => {
    // 插入匿名记录
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, model, user_input, system_prompt, tokens_total, duration_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run('anon_123', 'gpt-4', 'test 1', 'prompt 1', 100, 1000);
    stmt.run('anon_123', 'gpt-4', 'test 2', 'prompt 2', 200, 2000);
    
    // 执行迁移
    req.body = {
      anonymousUserId: 'anon_123',
      supabaseUserId: 'real-uuid-456',
    };
    
    await migrateAnonymousHistory(req, res);
    
    // 验证响应
    expect(res.data.migrated).toBe(2);
    expect(res.data.message).toContain('成功迁移');
    
    // 验证数据库已更新
    const records = db.prepare('SELECT * FROM audit_logs WHERE user_id = ?').all('real-uuid-456');
    expect(records).toHaveLength(2);
    
    // 验证匿名记录已清除
    const anonymousRecords = db.prepare('SELECT * FROM audit_logs WHERE user_id = ?').all('anon_123');
    expect(anonymousRecords).toHaveLength(0);
  });

  test('无匿名记录时应该返回无需迁移', async () => {
    req.body = {
      anonymousUserId: 'anon_nonexistent',
      supabaseUserId: 'real-uuid-789',
    };
    
    await migrateAnonymousHistory(req, res);
    
    expect(res.data.migrated).toBe(0);
    expect(res.data.message).toContain('无需迁移');
  });
});

