import type { Activity, UserStats, UserHistoryResponse } from '../types/user';
import { getUserId } from '../utils/userAuth';
import { supabase } from '../lib/supabase';

// 使用相对路径，开发环境通过 Vite proxy，生产环境通过 Nginx
const API_BASE = '/api';

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
 * 获取用户历史（直接从 Supabase 读取）
 */
export async function getUserHistory(
  options: {
    limit?: number;
    offset?: number;
    workflowType?: 'generation' | 'narrow_down';
  } = {}
): Promise<UserHistoryResponse> {
  const userId = await getUserId();
  console.log('📊 [UserAPI] 查询历史，user_id:', userId);
  
  const { limit = 20, offset = 0, workflowType } = options;
  
  // 直接从 Supabase 查询
  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (workflowType) {
    query = query.eq('workflow_type', workflowType);
  }
  
  const { data: rawData, error, count } = await query;
  
  if (error) {
    console.error('❌ [UserAPI] 查询失败:', error);
    throw new Error('Failed to fetch user history');
  }
  
  console.log('✅ [UserAPI] 查询成功，记录数:', rawData?.length || 0);
  
  // 按活动分组
  const activities = groupActivitiesByWorkflow(rawData || []);
  
  return {
    activities,
    total: activities.length,
    limit,
    offset,
  };
}

/**
 * 按 session_id 分组活动（精确分组）
 * 遵循 good_habits.md: 功能明确，边界清晰
 */
function groupActivitiesByWorkflow(rawActivities: any[]): Activity[] {
  const grouped = new Map();
  
  rawActivities.forEach(activity => {
    // 优先按 session_id 分组（新数据）
    // Fallback: 按时间+类型分组（旧数据，向后兼容）
    const groupKey = activity.session_id || `${activity.timestamp.substring(0, 16)}_${activity.workflow_type}`;
    
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        id: activity.id,
        sessionId: activity.session_id || groupKey,
        type: activity.workflow_type,
        timestamp: activity.timestamp,
        userInput: truncateText(activity.user_input, 100),
        steps: [],
        totalTokens: 0,
        totalCost: 0,
        totalDuration: 0,
        namesCount: activity.names_count || 0,
        success: true,
      });
    }
    
    const group = grouped.get(groupKey);
    
    // 添加步骤
    group.steps.push({
      stepName: activity.step_name || 'main',
      model: activity.model,
      tokensPrompt: activity.tokens_prompt || 0,
      tokensCompletion: activity.tokens_completion || 0,
      tokensTotal: activity.tokens_total || 0,
      costUsd: activity.cost_usd || 0,
      durationMs: activity.duration_ms || 0,
    });
    
    // 聚合统计（所有步骤的 token 和费用相加）
    group.totalTokens += (activity.tokens_total || 0);
    group.totalCost += (activity.cost_usd || 0);
    group.totalDuration += (activity.duration_ms || 0);
    group.success = group.success && activity.success;
    
    // 更新 names_count（取最大值）
    if (activity.names_count > group.namesCount) {
      group.namesCount = activity.names_count;
    }
  });
  
  return Array.from(grouped.values());
}

function truncateText(text: string, maxLength: number): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 获取用户统计（直接从 Supabase 查询）
 */
export async function getUserStats(): Promise<UserStats> {
  const userId = await getUserId();
  console.log('📊 [UserAPI] 查询统计，user_id:', userId);
  
  // 直接从 Supabase 聚合查询
  const { data, error } = await supabase
    .from('audit_logs')
    .select('workflow_type, tokens_total, cost_usd, duration_ms')
    .eq('user_id', userId)
    .eq('success', true);
  
  if (error) {
    console.error('❌ [UserAPI] 统计查询失败:', error);
    throw new Error('Failed to fetch user stats');
  }
  
  console.log('✅ [UserAPI] 查询成功，记录数:', data?.length || 0);
  
  // 手动聚合
  const generation = data?.filter(r => r.workflow_type === 'generation') || [];
  const narrowDown = data?.filter(r => r.workflow_type === 'narrow_down') || [];
  
  return {
    generation: {
      count: generation.length,
      total_tokens: generation.reduce((sum, r) => sum + (r.tokens_total || 0), 0),
      total_cost: generation.reduce((sum, r) => sum + (r.cost_usd || 0), 0),
      total_duration: generation.reduce((sum, r) => sum + (r.duration_ms || 0), 0),
    },
    narrow_down: {
      count: narrowDown.length,
      total_tokens: narrowDown.reduce((sum, r) => sum + (r.tokens_total || 0), 0),
      total_cost: narrowDown.reduce((sum, r) => sum + (r.cost_usd || 0), 0),
      total_duration: narrowDown.reduce((sum, r) => sum + (r.duration_ms || 0), 0),
    },
  };
}

