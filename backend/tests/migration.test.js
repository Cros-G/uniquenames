import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';

/**
 * 匿名历史迁移测试
 * 遵循 good_habits.md: 测试驱动开发
 */
describe('Anonymous History Migration', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    
    // 创建测试表
    db.exec(`
      CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        model VARCHAR(100) NOT NULL,
        user_id VARCHAR(255),
        user_input TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        raw_output TEXT,
        tokens_total INTEGER,
        duration_ms INTEGER,
        success BOOLEAN DEFAULT 1,
        workflow_type VARCHAR(50) DEFAULT 'generation'
      )
    `);
  });

  afterEach(() => {
    db.close();
  });

  test('应该能查询匿名用户的记录', () => {
    // 插入匿名记录
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, model, user_input, system_prompt, tokens_total, duration_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run('anon_123', 'gpt-4', 'test 1', 'prompt 1', 100, 1000);
    stmt.run('anon_123', 'gpt-4', 'test 2', 'prompt 2', 200, 2000);
    stmt.run('other_user', 'gpt-4', 'test 3', 'prompt 3', 300, 3000);
    
    // 查询匿名用户的记录
    const records = db.prepare('SELECT * FROM audit_logs WHERE user_id = ?').all('anon_123');
    
    expect(records).toHaveLength(2);
  });

  test('应该能更新匿名记录的 user_id', () => {
    // 插入匿名记录
    db.prepare(`
      INSERT INTO audit_logs (user_id, model, user_input, system_prompt, tokens_total, duration_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run('anon_123', 'gpt-4', 'test', 'prompt', 100, 1000);
    
    // 更新 user_id
    const updateStmt = db.prepare('UPDATE audit_logs SET user_id = ? WHERE user_id = ?');
    updateStmt.run('real-user-id', 'anon_123');
    
    // 验证更新成功
    const records = db.prepare('SELECT * FROM audit_logs WHERE user_id = ?').all('real-user-id');
    expect(records).toHaveLength(1);
    expect(records[0].user_input).toBe('test');
  });

  test('迁移不应该影响其他用户的数据', () => {
    // 插入多个用户的记录
    const stmt = db.prepare(`
      INSERT INTO audit_logs (user_id, model, user_input, system_prompt, tokens_total, duration_ms)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run('anon_123', 'gpt-4', 'anon test', 'prompt', 100, 1000);
    stmt.run('other_user', 'gpt-4', 'other test', 'prompt', 200, 2000);
    
    // 迁移 anon_123
    db.prepare('UPDATE audit_logs SET user_id = ? WHERE user_id = ?')
      .run('real-user-id', 'anon_123');
    
    // 验证其他用户数据未受影响
    const otherRecords = db.prepare('SELECT * FROM audit_logs WHERE user_id = ?').all('other_user');
    expect(otherRecords).toHaveLength(1);
    expect(otherRecords[0].user_input).toBe('other test');
  });
});

