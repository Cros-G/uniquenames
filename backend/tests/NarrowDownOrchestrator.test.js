import { describe, test, expect, beforeEach } from '@jest/globals';
import { NarrowDownOrchestrator } from '../orchestrators/NarrowDownOrchestrator.js';
import { getDatabase } from '../db/init.js';
import { Prompt } from '../models/Prompt.js';

let db;

beforeEach(() => {
  db = getDatabase();
  db.prepare('DELETE FROM audit_logs').run();
  // 只清理明确的测试提示词
  db.prepare('DELETE FROM prompts WHERE name IN (?, ?)').run('list_names_test', 'list_names_test2');
});

describe('NarrowDownOrchestrator', () => {
  test('应该正确初始化', () => {
    const mockClient = {};
    const orchestrator = new NarrowDownOrchestrator(
      db,
      mockClient,
      'test input',
      'test-model'
    );

    expect(orchestrator.db).toBe(db);
    expect(orchestrator.userInput).toBe('test input');
    expect(orchestrator.model).toBe('test-model');
    expect(orchestrator.names).toEqual([]);
  });

  test('extractJSON 应该能提取 markdown 包裹的 JSON', () => {
    const mockClient = {};
    const orchestrator = new NarrowDownOrchestrator(db, mockClient, '', '');
    
    const response = '```json\n{"key": "value"}\n```';
    const result = orchestrator.extractJSON(response);
    
    expect(result).toEqual({ key: 'value' });
  });

  test('extractJSON 应该能直接解析 JSON', () => {
    const mockClient = {};
    const orchestrator = new NarrowDownOrchestrator(db, mockClient, '', '');
    
    const response = '{"key": "value"}';
    const result = orchestrator.extractJSON(response);
    
    expect(result).toEqual({ key: 'value' });
  });

  test('callAPI 应该能汇总流式响应并返回usage', async () => {
    // Mock client 返回流式数据
    const mockClient = {
      generateNames: async function* (prompt) {
        yield { content: 'Hello', usage: null };
        yield { content: ' ', usage: null };
        yield { content: 'World', usage: null };
        yield { content: null, usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 } };
      }
    };
    
    const orchestrator = new NarrowDownOrchestrator(db, mockClient, '', '');
    const result = await orchestrator.callAPI('test');
    
    expect(result).toEqual({
      response: 'Hello World',
      usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
    });
  });

  // 注意：完整流程测试需要真实的API密钥和提示词
  // 这里只测试逻辑结构，不进行真实API调用
  
  test('step1_listNames 应该在名字超限时抛出错误', async () => {
    const mockClient = {
      generateNames: async function* (prompt) {
        yield { content: 'Name1\nName2\nName3\nName4\nName5\nName6', usage: null };
      }
    };
    
    // 确保有 list_names 提示词（使用generation标签的占位）
    const promptId = Prompt.create(db, {
      name: 'list_names_test',
      version: '1.0',
      tag: 'selection',
      content: '{{user_input}}',
      isActive: true,
    });
    
    const orchestrator = new NarrowDownOrchestrator(
      db,
      mockClient,
      'test input',
      'test-model'
    );
    
    // max_names 默认是5，这里有6个名字，应该抛出错误
    await expect(orchestrator.step1_listNames()).rejects.toThrow('名字数量超过限制');
    
    // 清理（先删除audit_logs再删除prompt）
    db.prepare('DELETE FROM audit_logs WHERE prompt_id = ?').run(promptId);
    Prompt.delete(db, promptId);
  });

  test('step1_listNames 应该正确解析名字列表', async () => {
    const mockClient = {
      generateNames: async function* (prompt) {
        yield { content: 'Name1\nName2\nName3', usage: null };
      }
    };
    
    const promptId = Prompt.create(db, {
      name: 'list_names_test2',
      version: '1.0',
      tag: 'selection',
      content: '{{user_input}}',
      isActive: true,
    });
    
    const orchestrator = new NarrowDownOrchestrator(
      db,
      mockClient,
      'test input',
      'test-model'
    );
    
    const result = await orchestrator.step1_listNames();
    
    expect(result.names).toEqual(['Name1', 'Name2', 'Name3']);
    expect(result.count).toBe(3);
    
    // 清理（先删除audit_logs再删除prompt）
    db.prepare('DELETE FROM audit_logs WHERE prompt_id = ?').run(promptId);
    Prompt.delete(db, promptId);
  });
});

