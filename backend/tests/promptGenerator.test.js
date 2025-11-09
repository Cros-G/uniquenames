import { describe, test, expect } from '@jest/globals';
import { generatePrompt } from '../prompts/generator.js';

describe('Prompt Generator', () => {
  test('应该正确注入用户context', () => {
    const userContext = '给我的咖啡店起个名字';
    const prompt = generatePrompt(userContext);
    
    expect(prompt).toContain(userContext);
    expect(prompt).toContain('naming master');
  });

  test('应该包含完整的提示词结构', () => {
    const userContext = '测试';
    const prompt = generatePrompt(userContext);
    
    expect(prompt).toContain('Role');
    expect(prompt).toContain('Task');
    expect(prompt).toContain('Output Requirements');
  });

  test('应该处理空输入', () => {
    expect(() => generatePrompt('')).toThrow('User context is required');
  });
});

