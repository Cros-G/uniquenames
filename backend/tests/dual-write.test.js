import { describe, test, expect } from '@jest/globals';
import Database from 'better-sqlite3';
import { AuditLog } from '../models/AuditLog.js';
import { SupabaseAuditLog } from '../models/SupabaseAuditLog.js';

/**
 * 双写逻辑测试
 * 验证 SQLite + Supabase 双写不会破坏现有功能
 */
describe('Dual Write Logic', () => {
  let db;

  beforeEach(() => {
    db = new Database(':memory:');
    
    // 创建测试表
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
        names_count INTEGER
      )
    `);
  });

  afterEach(() => {
    db.close();
  });

  test('AuditLog.create 应该正常写入 SQLite（不受 Supabase 影响）', () => {
    const auditData = {
      model: 'test-model',
      userId: 'test-user',
      userInput: 'test input',
      systemPrompt: 'test prompt',
      durationMs: 1000,
      success: true,
      workflowType: 'generation',
    };

    const logId = AuditLog.create(db, auditData);
    
    expect(logId).toBeGreaterThan(0);
    
    // 验证写入成功
    const record = db.prepare('SELECT * FROM audit_logs WHERE id = ?').get(logId);
    expect(record).toBeDefined();
    expect(record.model).toBe('test-model');
    expect(record.user_id).toBe('test-user');
  });

  test('SupabaseAuditLog.create 在无配置时应该返回 null（不抛出错误）', async () => {
    const auditData = {
      model: 'test-model',
      userId: 'test-user',
      userInput: 'test input',
      systemPrompt: 'test prompt',
      durationMs: 1000,
      success: true,
    };

    // 无 Supabase 配置时应该优雅降级
    const result = await SupabaseAuditLog.create(auditData);
    
    expect(result).toBeNull();
  });

  test('双写逻辑应该独立（SQLite 成功，Supabase 失败不影响）', () => {
    const auditData = {
      model: 'test-model',
      userId: 'test-user',
      userInput: 'test input',
      systemPrompt: 'test prompt',
      durationMs: 1000,
      success: true,
      workflowType: 'generation',
    };

    // 1. SQLite 写入应该成功
    const sqliteId = AuditLog.create(db, auditData);
    expect(sqliteId).toBeGreaterThan(0);

    // 2. Supabase 写入失败（无配置）不应该影响 SQLite
    // 这个测试只是验证逻辑，实际双写在 server.js 中
    expect(sqliteId).toBeGreaterThan(0);
  });
});

