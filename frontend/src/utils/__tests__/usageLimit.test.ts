import { describe, test, expect, beforeEach } from 'vitest';
import {
  checkUsageLimit,
  incrementUsage,
  getUsageCount,
  resetUsage,
  getRemainingUsage,
} from '../usageLimit';

describe('UsageLimit', () => {
  beforeEach(() => {
    // 清空 localStorage
    localStorage.clear();
  });

  test('初始状态应该返回 true（可以使用）', () => {
    expect(checkUsageLimit('generation')).toBe(true);
    expect(checkUsageLimit('narrow_down')).toBe(true);
  });

  test('初始使用次数应该为 0', () => {
    expect(getUsageCount('generation')).toBe(0);
    expect(getUsageCount('narrow_down')).toBe(0);
  });

  test('incrementUsage 应该增加使用次数', () => {
    incrementUsage('generation');
    expect(getUsageCount('generation')).toBe(1);
    
    incrementUsage('generation');
    expect(getUsageCount('generation')).toBe(2);
  });

  test('超过限制后 checkUsageLimit 应该返回 false', () => {
    incrementUsage('generation');
    incrementUsage('generation');
    
    expect(checkUsageLimit('generation')).toBe(false);
  });

  test('不同类型的限制应该独立计数', () => {
    incrementUsage('generation');
    incrementUsage('generation');
    
    expect(checkUsageLimit('generation')).toBe(false);
    expect(checkUsageLimit('narrow_down')).toBe(true);
  });

  test('resetUsage 应该清空所有计数', () => {
    incrementUsage('generation');
    incrementUsage('narrow_down');
    
    resetUsage();
    
    expect(getUsageCount('generation')).toBe(0);
    expect(getUsageCount('narrow_down')).toBe(0);
  });

  test('getRemainingUsage 应该返回剩余次数', () => {
    expect(getRemainingUsage('generation')).toBe(2);
    
    incrementUsage('generation');
    expect(getRemainingUsage('generation')).toBe(1);
    
    incrementUsage('generation');
    expect(getRemainingUsage('generation')).toBe(0);
    
    incrementUsage('generation');
    expect(getRemainingUsage('generation')).toBe(0); // 不会变成负数
  });
});

