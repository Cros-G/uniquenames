import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { getDatabase, closeDatabase } from '../db/init.js';
import { AuditLog } from '../models/AuditLog.js';

let db;

beforeEach(() => {
  db = getDatabase();
  // 只清空测试数据（ID > 1000）
  db.prepare('DELETE FROM audit_logs WHERE id > 1000').run();
  db.prepare('DELETE FROM prompts WHERE id > 1000').run();
});

afterEach(() => {
  // 不关闭连接，使用单例模式
  // closeDatabase(db);
});

describe('Audit API', () => {
  test('GET /api/admin/audit 应该返回审计日志', async () => {
    // 创建测试数据
    const id = AuditLog.create(db, {
      model: 'test',
      userInput: '测试',
      systemPrompt: '提示',
      rawOutput: '输出',
      durationMs: 1000,
      success: true,
    });
    
    console.log('创建的审计日志 ID:', id);
    
    // 验证数据确实创建了
    const log = AuditLog.findById(db, id);
    console.log('直接查询的日志:', log);

    const response = await request(app).get('/api/admin/audit');
    
    console.log('API返回:', response.body);
    
    expect(response.status).toBe(200);
    expect(response.body.logs).toBeDefined();
    expect(response.body.logs.length).toBeGreaterThanOrEqual(1);
  });

  test('GET /api/admin/audit 应该支持分页', async () => {
    // 创建5条日志
    for (let i = 1; i <= 5; i++) {
      AuditLog.create(db, {
        model: 'test',
        userInput: `测试${i}`,
        systemPrompt: '提示',
        rawOutput: '输出',
        durationMs: 1000,
        success: true,
      });
    }

    const response = await request(app)
      .get('/api/admin/audit')
      .query({ limit: 2, offset: 0 });
    
    expect(response.status).toBe(200);
    expect(response.body.logs.length).toBe(2);
  });

  test('GET /api/admin/audit 应该支持按模型筛选', async () => {
    AuditLog.create(db, {
      model: 'gpt-4',
      userInput: '测试1',
      systemPrompt: '提示',
      rawOutput: '输出',
      durationMs: 1000,
      success: true,
    });

    AuditLog.create(db, {
      model: 'claude-3',
      userInput: '测试2',
      systemPrompt: '提示',
      rawOutput: '输出',
      durationMs: 1000,
      success: true,
    });

    const response = await request(app)
      .get('/api/admin/audit')
      .query({ model: 'gpt-4' });
    
    expect(response.status).toBe(200);
    expect(response.body.logs.length).toBe(1);
    expect(response.body.logs[0].model).toBe('gpt-4');
  });

  test('GET /api/admin/audit/stats 应该返回统计信息', async () => {
    AuditLog.create(db, {
      model: 'test',
      userInput: '1',
      systemPrompt: 'p',
      rawOutput: 'o',
      tokensTotal: 100,
      costUsd: 0.01,
      durationMs: 1000,
      success: true,
    });

    AuditLog.create(db, {
      model: 'test',
      userInput: '2',
      systemPrompt: 'p',
      rawOutput: '',
      durationMs: 500,
      success: false,
    });

    const response = await request(app).get('/api/admin/audit/stats');
    
    expect(response.status).toBe(200);
    expect(response.body.stats.total).toBe(2);
    expect(response.body.stats.successful).toBe(1);
    expect(response.body.stats.failed).toBe(1);
  });

  test('GET /api/admin/audit/:id 应该返回单条日志详情', async () => {
    const id = AuditLog.create(db, {
      model: 'test',
      userInput: '测试',
      systemPrompt: '提示词',
      rawOutput: '输出',
      durationMs: 1000,
      success: true,
    });

    const response = await request(app).get(`/api/admin/audit/${id}`);
    
    expect(response.status).toBe(200);
    expect(response.body.log).toBeDefined();
    expect(response.body.log.user_input).toBe('测试');
  });

  test('DELETE /api/admin/audit 应该清空所有日志', async () => {
    AuditLog.create(db, {
      model: 'test',
      userInput: '1',
      systemPrompt: 'p',
      rawOutput: 'o',
      durationMs: 1000,
      success: true,
    });

    const response = await request(app).delete('/api/admin/audit');
    
    expect(response.status).toBe(200);
    
    const logs = AuditLog.findAll(db);
    expect(logs.length).toBe(0);
  });
});

