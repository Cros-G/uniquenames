/**
 * 用户认证工具
 * 集成 Supabase Auth，支持匿名用户试用
 */

import { supabase } from '../lib/supabase';

const ANONYMOUS_USER_ID_KEY = 'uniquenames_anonymous_user_id';

/**
 * 获取用户 ID
 * 优先从 Supabase session 获取，否则返回匿名 ID
 */
export async function getUserId(): Promise<string> {
  // 1. 尝试从 Supabase 获取（如果已登录）
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.user) {
    console.log('👤 [UserAuth] 已登录用户:', session.user.id);
    return session.user.id;
  }
  
  // 2. 未登录，返回匿名 ID（用于试用）
  const anonymousId = getOrCreateAnonymousId();
  console.log('👻 [UserAuth] 匿名用户:', anonymousId);
  return anonymousId;
}

/**
 * 获取或创建匿名用户 ID
 */
function getOrCreateAnonymousId(): string {
  let userId = localStorage.getItem(ANONYMOUS_USER_ID_KEY);
  
  if (!userId) {
    // 生成新的匿名 user_id
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 11);
    userId = `anon_${timestamp}_${random}`;
    
    localStorage.setItem(ANONYMOUS_USER_ID_KEY, userId);
    console.log('🆕 [UserAuth] 生成新匿名 ID:', userId);
  }
  
  return userId;
}

/**
 * 获取匿名 ID（用于历史迁移）
 */
export function getAnonymousId(): string | null {
  return localStorage.getItem(ANONYMOUS_USER_ID_KEY);
}

/**
 * 清除匿名 ID（登录后调用，用于迁移后清理）
 */
export function clearAnonymousId(): void {
  localStorage.removeItem(ANONYMOUS_USER_ID_KEY);
  console.log('🧹 [UserAuth] 清除匿名 ID');
}

/**
 * 检查是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session?.user;
}

/**
 * 获取当前 session（同步版本，用于快速检查）
 */
export function getSessionSync(): any {
  // 注意：这是同步方法，可能获取到过期的 session
  // 仅用于 UI 显示，不用于安全验证
  const sessionStr = localStorage.getItem('sb-ydqzkxkosjirqdvgbpid-auth-token');
  if (!sessionStr) return null;
  
  try {
    return JSON.parse(sessionStr);
  } catch {
    return null;
  }
}

