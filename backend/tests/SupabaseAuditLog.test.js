import { describe, test, expect, beforeEach } from '@jest/globals';
import { SupabaseAuditLog } from '../models/SupabaseAuditLog.js';

/**
 * SupabaseAuditLog 测试
 * 注意：这些是单元测试，不依赖真实的 Supabase 连接
 * 实际集成测试需要在有 Supabase 配置的环境中进行
 */
describe('SupabaseAuditLog Model', () => {
  test('create 在没有 Supabase 配置时应该返回 null', async () => {
    // 由于测试环境没有 Supabase 配置，应该返回 null
    const result = await SupabaseAuditLog.create({
      model: 'test-model',
      userInput: 'test input',
      systemPrompt: 'test prompt',
      durationMs: 1000,
      success: true,
    });

    // 没有配置时应该返回 null，不应该抛出错误
    expect(result).toBeNull();
  });

  test('findByUserId 在没有 Supabase 配置时应该返回空数组', async () => {
    const result = await SupabaseAuditLog.findByUserId('test-user-id');

    expect(result).toEqual([]);
  });

  test('batchInsert 在没有 Supabase 配置时应该返回 0', async () => {
    const result = await SupabaseAuditLog.batchInsert([
      { model: 'test', userInput: 'test', systemPrompt: 'test', durationMs: 1000 }
    ]);

    expect(result).toBe(0);
  });

  // TODO: 添加真实的 Supabase 集成测试（需要测试环境的 Supabase 配置）
  // test('create 应该成功写入 Supabase', async () => { ... });
  // test('findByUserId 应该正确查询数据', async () => { ... });
});

