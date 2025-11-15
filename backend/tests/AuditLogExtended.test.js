import { describe, test, expect, beforeEach } from '@jest/globals';
import { AuditLog } from '../models/AuditLog.js';
import { getDatabase } from '../db/init.js';

let db;

beforeEach(() => {
  db = getDatabase();
  // 只清空测试数据（ID > 1000）
  db.prepare('DELETE FROM audit_logs WHERE id > 1000').run();
  db.prepare('DELETE FROM prompts WHERE id > 1000').run();
});

describe('AuditLog Model - Narrow Down 扩展', () => {
  test('应该能创建带 workflow_type 的审计日志', () => {
    const id = AuditLog.create(db, {
      model: 'test',
      userInput: '测试',
      systemPrompt: '提示',
      rawOutput: '输出',
      durationMs: 1000,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'list_names',
      namesCount: 3,
    });

    expect(id).toBeGreaterThan(0);
    
    const log = AuditLog.findById(db, id);
    expect(log.workflow_type).toBe('narrow_down');
    expect(log.step_name).toBe('list_names');
    expect(log.names_count).toBe(3);
  });

  test('默认 workflow_type 应该是 generation', () => {
    const id = AuditLog.create(db, {
      model: 'test',
      userInput: '测试',
      systemPrompt: '提示',
      rawOutput: '输出',
      durationMs: 1000,
      success: true,
    });

    const log = AuditLog.findById(db, id);
    expect(log.workflow_type).toBe('generation');
    expect(log.step_name).toBeNull();
    expect(log.names_count).toBeNull();
  });

  test('应该能按 workflow_type 筛选', () => {
    // 创建不同类型的日志
    AuditLog.create(db, {
      model: 'test',
      userInput: 'g1',
      systemPrompt: 'p',
      rawOutput: 'o',
      durationMs: 1000,
      success: true,
      workflowType: 'generation',
    });

    AuditLog.create(db, {
      model: 'test',
      userInput: 'n1',
      systemPrompt: 'p',
      rawOutput: 'o',
      durationMs: 1000,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'isolate',
    });

    AuditLog.create(db, {
      model: 'test',
      userInput: 'n2',
      systemPrompt: 'p',
      rawOutput: 'o',
      durationMs: 1000,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'decide',
    });

    const narrowDownLogs = AuditLog.findAll(db, { workflowType: 'narrow_down' });
    expect(narrowDownLogs.length).toBe(2);
    expect(narrowDownLogs.every(l => l.workflow_type === 'narrow_down')).toBe(true);
  });

  test('应该能按 step_name 筛选', () => {
    AuditLog.create(db, {
      model: 'test',
      userInput: 'test1',
      systemPrompt: 'p',
      rawOutput: 'o',
      durationMs: 1000,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'list_names',
    });

    AuditLog.create(db, {
      model: 'test',
      userInput: 'test2',
      systemPrompt: 'p',
      rawOutput: 'o',
      durationMs: 1000,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'decide',
    });

    const listNamesLogs = AuditLog.findAll(db, { stepName: 'list_names' });
    expect(listNamesLogs.length).toBe(1);
    expect(listNamesLogs[0].step_name).toBe('list_names');
  });

  test('统计信息应该包含 narrow_down 的数据', () => {
    // 创建混合类型的日志
    AuditLog.create(db, {
      model: 'test',
      userInput: 'g',
      systemPrompt: 'p',
      rawOutput: 'o',
      tokensTotal: 100,
      costUsd: 0.001,
      durationMs: 1000,
      success: true,
      workflowType: 'generation',
    });

    AuditLog.create(db, {
      model: 'test',
      userInput: 'n',
      systemPrompt: 'p',
      rawOutput: 'o',
      tokensTotal: 200,
      costUsd: 0.002,
      durationMs: 2000,
      success: true,
      workflowType: 'narrow_down',
      stepName: 'decide',
      namesCount: 5,
    });

    const stats = AuditLog.getStats(db);
    expect(stats.total).toBe(2);
    expect(stats.totalTokens).toBe(300);
    expect(stats.totalCost).toBeCloseTo(0.003, 6);
  });
});


