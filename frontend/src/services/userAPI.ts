import type { Activity, UserStats, UserHistoryResponse } from '../types/user';
import { getUserId } from '../utils/userAuth';

const API_BASE = 'http://localhost:3001/api';

/**
 * 初始化用户
 */
export async function initUser(userId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/user/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });
  
  if (!response.ok) {
    throw new Error('Failed to initialize user');
  }
  
  return response.json();
}

/**
 * 获取用户历史
 */
export async function getUserHistory(
  options: {
    limit?: number;
    offset?: number;
    workflowType?: 'generation' | 'narrow_down';
  } = {}
): Promise<UserHistoryResponse> {
  const userId = getUserId();
  
  const params = new URLSearchParams({
    user_id: userId,
    limit: (options.limit || 20).toString(),
    offset: (options.offset || 0).toString(),
  });
  
  if (options.workflowType) {
    params.append('workflow_type', options.workflowType);
  }
  
  const response = await fetch(`${API_BASE}/user/history?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user history');
  }
  
  return response.json();
}

/**
 * 获取用户统计
 */
export async function getUserStats(): Promise<UserStats> {
  const userId = getUserId();
  
  const response = await fetch(`${API_BASE}/user/stats?user_id=${userId}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch user stats');
  }
  
  return response.json();
}

