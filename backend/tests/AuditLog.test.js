import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { AuditLog } from '../models/AuditLog.js';
import { Prompt } from '../models/Prompt.js';
import { getDatabase, closeDatabase } from '../db/init.js';

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

describe('AuditLog Model', () => {
  test('应该能创建审计日志', () => {
    const id = AuditLog.create(db, {
      model: 'anthropic/claude-3.5-sonnet',
      userInput: '测试输入',
      systemPrompt: '测试提示词',
      rawOutput: '测试输出',
      tokensPrompt: 100,
      tokensCompletion: 200,
      tokensTotal: 300,
      costUsd: 0.005,
      durationMs: 1500,
      success: true,
    });

    expect(id).toBeGreaterThan(0);
  });

  test('应该能查询所有审计日志', () => {
    // 创建两条日志
    AuditLog.create(db, {
      model: 'gpt-4',
      userInput: '输入1',
      systemPrompt: '提示1',
      rawOutput: '输出1',
      durationMs: 1000,
      success: true,
    });

    AuditLog.create(db, {
      model: 'claude-3',
      userInput: '输入2',
      systemPrompt: '提示2',
      rawOutput: '输出2',
      durationMs: 2000,
      success: true,
    });

    const logs = AuditLog.findAll(db);
    expect(logs.length).toBe(2);
  });

  test('应该支持分页查询', () => {
    // 创建5条日志
    for (let i = 1; i <= 5; i++) {
      AuditLog.create(db, {
        model: 'test-model',
        userInput: `输入${i}`,
        systemPrompt: `提示${i}`,
        rawOutput: `输出${i}`,
        durationMs: 1000,
        success: true,
      });
    }

    // 第一页（2条）
    const page1 = AuditLog.findAll(db, { limit: 2, offset: 0 });
    expect(page1.length).toBe(2);

    // 第二页（2条）
    const page2 = AuditLog.findAll(db, { limit: 2, offset: 2 });
    expect(page2.length).toBe(2);

    // 第三页（1条）
    const page3 = AuditLog.findAll(db, { limit: 2, offset: 4 });
    expect(page3.length).toBe(1);
  });

  test('应该能按模型筛选', () => {
    AuditLog.create(db, {
      model: 'gpt-4',
      userInput: '输入1',
      systemPrompt: '提示1',
      rawOutput: '输出1',
      durationMs: 1000,
      success: true,
    });

    AuditLog.create(db, {
      model: 'claude-3',
      userInput: '输入2',
      systemPrompt: '提示2',
      rawOutput: '输出2',
      durationMs: 2000,
      success: true,
    });

    const gptLogs = AuditLog.findAll(db, { model: 'gpt-4' });
    expect(gptLogs.length).toBe(1);
    expect(gptLogs[0].model).toBe('gpt-4');
  });

  test('应该能按成功状态筛选', () => {
    AuditLog.create(db, {
      model: 'test',
      userInput: '成功',
      systemPrompt: '提示',
      rawOutput: '输出',
      durationMs: 1000,
      success: true,
    });

    AuditLog.create(db, {
      model: 'test',
      userInput: '失败',
      systemPrompt: '提示',
      rawOutput: '',
      durationMs: 500,
      success: false,
      error: '测试错误',
    });

    const successLogs = AuditLog.findAll(db, { success: true });
    expect(successLogs.length).toBe(1);
    expect(successLogs[0].user_input).toBe('成功');
  });

  test('应该能获取统计信息', () => {
    // 创建测试数据
    AuditLog.create(db, {
      model: 'test',
      userInput: '1',
      systemPrompt: 'p',
      rawOutput: 'o',
      tokensTotal: 100,
      costUsd: 0.001,
      durationMs: 1000,
      success: true,
    });

    AuditLog.create(db, {
      model: 'test',
      userInput: '2',
      systemPrompt: 'p',
      rawOutput: 'o',
      tokensTotal: 200,
      costUsd: 0.002,
      durationMs: 2000,
      success: true,
    });

    AuditLog.create(db, {
      model: 'test',
      userInput: '3',
      systemPrompt: 'p',
      rawOutput: '',
      durationMs: 500,
      success: false,
      error: '错误',
    });

    const stats = AuditLog.getStats(db);
    expect(stats.total).toBe(3);
    expect(stats.successful).toBe(2);
    expect(stats.failed).toBe(1);
    expect(stats.totalTokens).toBe(300);
    expect(stats.totalCost).toBeCloseTo(0.003, 6);
  });

  test('应该能关联提示词', () => {
    // 先创建一个提示词
    const promptId = Prompt.create(db, {
      name: '测试',
      version: '1.0',
      tag: 'generation',
      content: '内容',
      isActive: true,
    });

    // 创建关联的审计日志
    const logId = AuditLog.create(db, {
      model: 'test',
      promptId: promptId,
      userInput: '输入',
      systemPrompt: '提示',
      rawOutput: '输出',
      durationMs: 1000,
      success: true,
    });

    const log = AuditLog.findById(db, logId);
    expect(log.prompt_id).toBe(promptId);
  });
});

