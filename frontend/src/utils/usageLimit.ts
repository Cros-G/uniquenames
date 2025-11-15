/**
 * 使用限制追踪 - 匿名用户试用次数管理
 * 遵循 good_habits.md: 功能明确，边界清晰
 */

const USAGE_KEY_PREFIX = 'usage_count_';
const LIMITS = {
  generation: 2,    // Generate 免费试用 2 次
  narrow_down: 2,   // Narrow Down 免费试用 2 次
};

/**
 * 检查是否超过使用限制
 * @param type - 功能类型
 * @returns true 表示还可以用，false 表示超限
 */
export function checkUsageLimit(type: 'generation' | 'narrow_down'): boolean {
  const count = getUsageCount(type);
  const limit = LIMITS[type];
  
  console.log(`🔍 [UsageLimit] 检查 ${type} 使用次数: ${count}/${limit}`);
  
  return count < limit;
}

/**
 * 增加使用次数
 */
export function incrementUsage(type: 'generation' | 'narrow_down'): void {
  const count = getUsageCount(type);
  const newCount = count + 1;
  
  localStorage.setItem(`${USAGE_KEY_PREFIX}${type}`, newCount.toString());
  
  console.log(`📈 [UsageLimit] ${type} 使用次数: ${count} → ${newCount}`);
}

/**
 * 获取当前使用次数
 */
export function getUsageCount(type: 'generation' | 'narrow_down'): number {
  const stored = localStorage.getItem(`${USAGE_KEY_PREFIX}${type}`);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * 重置使用次数（登录后调用）
 */
export function resetUsage(): void {
  localStorage.removeItem(`${USAGE_KEY_PREFIX}generation`);
  localStorage.removeItem(`${USAGE_KEY_PREFIX}narrow_down`);
  
  console.log('🔄 [UsageLimit] 使用次数已重置');
}

/**
 * 获取剩余次数
 */
export function getRemainingUsage(type: 'generation' | 'narrow_down'): number {
  const count = getUsageCount(type);
  const limit = LIMITS[type];
  return Math.max(0, limit - count);
}

