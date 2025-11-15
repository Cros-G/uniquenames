import { describe, test, expect } from '@jest/globals';
import { replacePromptVariables, parallelAPICall } from '../utils/promptUtils.js';

describe('replacePromptVariables', () => {
  test('应该替换单个变量', () => {
    const template = 'Hello {{name}}!';
    const result = replacePromptVariables(template, { name: 'World' });
    expect(result).toBe('Hello World!');
  });

  test('应该替换多个变量', () => {
    const template = '{{greeting}} {{name}}, you are {{age}} years old.';
    const result = replacePromptVariables(template, {
      greeting: 'Hi',
      name: 'Alice',
      age: 25,
    });
    expect(result).toBe('Hi Alice, you are 25 years old.');
  });

  test('应该处理对象变量（转为JSON）', () => {
    const template = 'Data: {{data}}';
    const result = replacePromptVariables(template, {
      data: { name: 'test', value: 123 },
    });
    expect(result).toContain('"name": "test"');
    expect(result).toContain('"value": 123');
  });

  test('应该处理数组变量（转为JSON）', () => {
    const template = 'List: {{items}}';
    const result = replacePromptVariables(template, {
      items: ['a', 'b', 'c'],
    });
    // 格式化的JSON，检查包含元素
    expect(result).toContain('"a"');
    expect(result).toContain('"b"');
    expect(result).toContain('"c"');
  });

  test('应该替换同一变量的多次出现', () => {
    const template = '{{name}} loves {{name}}';
    const result = replacePromptVariables(template, { name: 'Bob' });
    expect(result).toBe('Bob loves Bob');
  });

  test('应该处理不存在的占位符（保持不变）', () => {
    const template = 'Hello {{name}}, age is {{age}}';
    const result = replacePromptVariables(template, { name: 'Alice' });
    expect(result).toBe('Hello Alice, age is {{age}}');
  });

  test('应该处理空对象', () => {
    const template = 'Hello {{name}}';
    const result = replacePromptVariables(template, {});
    expect(result).toBe('Hello {{name}}');
  });

  test('应该处理null和undefined值', () => {
    const template = '{{a}} {{b}}';
    const result = replacePromptVariables(template, { a: null, b: undefined });
    expect(result).toBe('null undefined');
  });
});

describe('parallelAPICall', () => {
  test('应该并发执行所有任务', async () => {
    const tasks = [
      async () => { await sleep(10); return 'a'; },
      async () => { await sleep(20); return 'b'; },
      async () => { await sleep(15); return 'c'; },
    ];

    const results = await parallelAPICall(tasks, 3);
    expect(results).toEqual(['a', 'b', 'c']);
  });

  test('应该限制并发数', async () => {
    let concurrent = 0;
    let maxConcurrent = 0;

    const tasks = Array(10).fill(0).map((_, i) => async () => {
      concurrent++;
      maxConcurrent = Math.max(maxConcurrent, concurrent);
      await sleep(10);
      concurrent--;
      return i;
    });

    await parallelAPICall(tasks, 3);
    
    expect(maxConcurrent).toBeLessThanOrEqual(3);
    expect(maxConcurrent).toBeGreaterThan(0);
  });

  test('应该返回所有结果（保持顺序）', async () => {
    const tasks = [
      async () => { await sleep(30); return 1; },
      async () => { await sleep(10); return 2; },
      async () => { await sleep(20); return 3; },
    ];

    const results = await parallelAPICall(tasks, 2);
    expect(results).toEqual([1, 2, 3]); // 顺序应该和输入一致
  });

  test('应该处理任务错误', async () => {
    const tasks = [
      async () => 'success',
      async () => { throw new Error('task error'); },
      async () => 'success2',
    ];

    await expect(parallelAPICall(tasks, 2)).rejects.toThrow('task error');
  });

  test('默认并发数应该是5', async () => {
    const tasks = Array(3).fill(0).map((_, i) => async () => i);
    const results = await parallelAPICall(tasks); // 不传 concurrentLimit
    expect(results).toEqual([0, 1, 2]);
  });
});

// 辅助函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

