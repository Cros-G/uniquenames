import { describe, test, expect } from '@jest/globals';
import { OpenRouterClient } from '../openrouter.js';

describe('OpenRouterClient', () => {
  test('应该正确初始化客户端', () => {
    const client = new OpenRouterClient('test-api-key');
    expect(client).toBeDefined();
    expect(client.apiKey).toBe('test-api-key');
  });

  test('应该抛出错误如果没有提供API密钥', () => {
    expect(() => new OpenRouterClient()).toThrow('API key is required');
  });

  test('应该有 generateNames 方法', () => {
    const client = new OpenRouterClient('test-api-key');
    expect(typeof client.generateNames).toBe('function');
  });
});

