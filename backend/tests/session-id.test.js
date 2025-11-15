import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import { AuditLog } from '../models/AuditLog.js';

/**
 * Session ID 功能测试
 * 遵循 good_habits.md: 测试驱动开发
 */
describe('Session ID in AuditLog', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    
    // 创建完整的测试表（和真实表结构一致）
    db.exec(`
      CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        model VARCHAR(100) NOT NULL,
        prompt_id INTEGER,
        user_id VARCHAR(255),
        user_input TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        raw_output TEXT,
        tokens_prompt INTEGER,
        tokens_completion INTEGER,
        tokens_total INTEGER,
        cost_usd DECIMAL(10, 6),
        duration_ms INTEGER,
        success BOOLEAN DEFAULT 1,
        error TEXT,
        workflow_type VARCHAR(50) DEFAULT 'generation',
        step_name VARCHAR(100),
        names_count INTEGER,
        session_id VARCHAR(255)
      )
    `);
  });

  afterEach(() => {
    db.close();
  });

  test('应该能创建带 session_id 的审计日志', () => {
    const sessionId = 'gen_123456_abc';
    
    const logId = AuditLog.create(db, {
      model: 'gpt-4',
      userId: 'test-user',
      userInput: 'test',
      systemPrompt: 'prompt',
      durationMs: 1000,
      success: true,
      workflowType: 'generation',
      sessionId: sessionId,
    });
    
    expect(logId).toBeGreaterThan(0);
    
    // 验证 session_id 已写入
    const record = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(logId);
    expect(record.session_id).toBe(sessionId);
  });

  test('同一 session_id 可以有多条记录', () => {
    const sessionId = 'narrow_123_xyz';
    
    // 插入多条记录（模拟 Narrow Down 的多个步骤）
    const id1 = AuditLog.create(db, {
      model: 'gpt-4',
      userId: 'test-user',
      userInput: 'test',
      systemPrompt: 'prompt 1',
      durationMs: 1000,
      success: true,
      workflowType: 'narrow_down',
      sessionId: sessionId,
      stepName: 'list_names',
    });
    
    const id2 = AuditLog.create(db, {
      model: 'gpt-4',
      userId: 'test-user',
      userInput: 'test',
      systemPrompt: 'prompt 2',
      durationMs: 2000,
      success: true,
      workflowType: 'narrow_down',
      sessionId: sessionId,
      stepName: 'isolate',
    });
    
    expect(id1).toBeGreaterThan(0);
    expect(id2).toBeGreaterThan(0);
    
    // 验证可以按 session_id 查询
    const records = db.prepare('SELECT * FROM audit_logs WHERE session_id = ?').all(sessionId);
    expect(records).toHaveLength(2);
    expect(records[0].step_name).toBe('list_names');
    expect(records[1].step_name).toBe('isolate');
  });

  test('可以按 session_id 汇总 token 和费用', () => {
    const sessionId = 'test_session_sum';
    
    // 插入3条记录
    AuditLog.create(db, {
      model: 'gpt-4',
      userId: 'test-user',
      userInput: 'test',
      systemPrompt: 'prompt',
      tokensTotal: 100,
      costUsd: 0.001,
      durationMs: 1000,
      success: true,
      sessionId: sessionId,
    });
    
    AuditLog.create(db, {
      model: 'gpt-4',
      userId: 'test-user',
      userInput: 'test',
      systemPrompt: 'prompt',
      tokensTotal: 200,
      costUsd: 0.002,
      durationMs: 2000,
      success: true,
      sessionId: sessionId,
    });
    
    AuditLog.create(db, {
      model: 'gpt-4',
      userId: 'test-user',
      userInput: 'test',
      systemPrompt: 'prompt',
      tokensTotal: 150,
      costUsd: 0.0015,
      durationMs: 1500,
      success: true,
      sessionId: sessionId,
    });
    
    // 汇总查询
    const result = db.prepare(`
      SELECT 
        COUNT(*) as step_count,
        SUM(tokens_total) as total_tokens,
        SUM(cost_usd) as total_cost,
        SUM(duration_ms) as total_duration
      FROM audit_logs
      WHERE session_id = ?
    `).get(sessionId);
    
    expect(result.step_count).toBe(3);
    expect(result.total_tokens).toBe(450);
    expect(result.total_cost).toBeCloseTo(0.0045, 4);
    expect(result.total_duration).toBe(4500);
  });

  test('向后兼容：session_id 可以为 null', () => {
    // 不传 session_id（旧数据场景）
    const logId = AuditLog.create(db, {
      model: 'gpt-4',
      userId: 'test-user',
      userInput: 'test',
      systemPrompt: 'prompt',
      durationMs: 1000,
      success: true,
    });
    
    expect(logId).toBeGreaterThan(0);
    
    const record = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(logId);
    expect(record.session_id).toBeNull();
  });
});

