/**
 * 用户认证工具 - 临时方案
 * 使用 localStorage 存储匿名 user_id
 * 后续集成 Google/邮箱登录后会替换
 */

const USER_ID_KEY = 'uniquenames_user_id';

/**
 * 获取或生成用户 ID
 */
export function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  
  if (!userId) {
    // 生成新的匿名 user_id
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    userId = `user_${timestamp}_${random}`;
    
    localStorage.setItem(USER_ID_KEY, userId);
    console.log('🆕 [UserAuth] 生成新用户 ID:', userId);
  }
  
  return userId;
}

/**
 * 设置用户 ID（用于后续登录功能）
 */
export function setUserId(userId: string): void {
  localStorage.setItem(USER_ID_KEY, userId);
  console.log('✅ [UserAuth] 设置用户 ID:', userId);
}

/**
 * 清除用户 ID（登出）
 */
export function clearUserId(): void {
  localStorage.removeItem(USER_ID_KEY);
  console.log('🚪 [UserAuth] 清除用户 ID');
}

/**
 * 检查是否已登录（后续实现）
 */
export function isAuthenticated(): boolean {
  // 临时方案：只要有 user_id 就算已认证
  return !!localStorage.getItem(USER_ID_KEY);
}

