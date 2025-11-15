import { User } from '../models/User.js';
import { SupabaseAuditLog } from '../models/SupabaseAuditLog.js';
import { getDatabase } from '../db/init.js';

/**
 * 用户控制器
 */

/**
 * POST /api/user/init
 * 初始化或获取用户
 */
export async function initUser(req, res) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少 user_id' });
    }
    
    const db = getDatabase();
    const user = User.findOrCreate(db, userId);
    
    res.json({
      user_id: user.user_id,
      display_name: user.display_name,
      created_at: user.created_at,
    });
  } catch (error) {
    console.error('❌ [userController] initUser 失败:', error);
    res.status(500).json({ error: '用户初始化失败' });
  }
}

/**
 * GET /api/user/history
 * 获取用户的活动历史
 */
export async function getUserHistory(req, res) {
  try {
    const userId = req.headers['x-user-id'] || req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少 user_id' });
    }
    
    const db = getDatabase();
    const limit = parseInt(req.query.limit) || 20;
    const offset = parseInt(req.query.offset) || 0;
    const workflowType = req.query.workflow_type || null;
    
    // 获取原始活动记录
    const rawActivities = User.getActivities(db, userId, {
      limit,
      offset,
      workflowType,
    });
    
    // 按 workflow 分组（同一时间窗口内的步骤属于同一活动）
    const activities = groupActivitiesByWorkflow(rawActivities);
    
    // 获取总数
    const totalStmt = db.prepare(`
      SELECT COUNT(DISTINCT 
        strftime('%Y-%m-%d %H:%M', timestamp) || '_' || workflow_type
      ) as total
      FROM audit_logs
      WHERE user_id = ?
      ${workflowType ? 'AND workflow_type = ?' : ''}
    `);
    
    const params = [userId];
    if (workflowType) params.push(workflowType);
    
    const { total } = totalStmt.get(...params);
    
    res.json({
      activities,
      total,
      limit,
      offset,
    });
  } catch (error) {
    console.error('❌ [userController] getUserHistory 失败:', error);
    res.status(500).json({ error: '获取历史记录失败' });
  }
}

/**
 * GET /api/user/stats
 * 获取用户的统计信息
 */
export async function getUserStats(req, res) {
  try {
    const userId = req.headers['x-user-id'] || req.query.user_id;
    
    if (!userId) {
      return res.status(400).json({ error: '缺少 user_id' });
    }
    
    const db = getDatabase();
    const stats = User.getActivityStats(db, userId);
    
    res.json(stats);
  } catch (error) {
    console.error('❌ [userController] getUserStats 失败:', error);
    res.status(500).json({ error: '获取统计信息失败' });
  }
}

/**
 * 辅助函数：将原始活动记录按 workflow 分组
 * 同一分钟内的相同 workflow_type 视为一次活动
 */
function groupActivitiesByWorkflow(rawActivities) {
  const grouped = new Map();
  
  rawActivities.forEach(activity => {
    // 生成活动分组 key: timestamp (分钟精度) + workflow_type
    const timeKey = activity.timestamp.substring(0, 16); // YYYY-MM-DD HH:MM
    const groupKey = `${timeKey}_${activity.workflow_type}`;
    
    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        id: activity.id, // 使用第一条记录的 ID
        type: activity.workflow_type,
        timestamp: activity.timestamp,
        userInput: truncateText(activity.user_input, 100), // 截断显示
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
    
    // 聚合统计
    group.totalTokens += (activity.tokens_total || 0);
    group.totalCost += (activity.cost_usd || 0);
    group.totalDuration += (activity.duration_ms || 0);
    group.success = group.success && activity.success;
  });
  
  return Array.from(grouped.values());
}

/**
 * POST /api/user/migrate
 * 迁移匿名用户的历史记录
 */
export async function migrateAnonymousHistory(req, res) {
  try {
    const { anonymousUserId, supabaseUserId } = req.body;
    
    if (!anonymousUserId || !supabaseUserId) {
      return res.status(400).json({ error: '缺少必要参数' });
    }
    
    console.log('🔄 [Migration] 开始迁移历史...');
    console.log('👻 [Migration] 匿名 ID:', anonymousUserId);
    console.log('👤 [Migration] Supabase ID:', supabaseUserId);
    
    const db = getDatabase();
    
    // 1. 查询匿名用户的所有记录
    const anonymousRecords = db.prepare(`
      SELECT * FROM audit_logs WHERE user_id = ?
    `).all(anonymousUserId);
    
    console.log('📊 [Migration] 找到', anonymousRecords.length, '条匿名记录');
    
    if (anonymousRecords.length === 0) {
      return res.json({ migrated: 0, message: '无需迁移' });
    }
    
    // 2. 更新 SQLite 中的 user_id
    const updateStmt = db.prepare(`
      UPDATE audit_logs SET user_id = ? WHERE user_id = ?
    `);
    
    const updateResult = updateStmt.run(supabaseUserId, anonymousUserId);
    console.log('✅ [Migration] SQLite 更新成功:', updateResult.changes, '条记录');
    
    // 3. 批量写入 Supabase
    const supabaseRecords = anonymousRecords.map(record => ({
      timestamp: record.timestamp,
      model: record.model,
      prompt_id: record.prompt_id,
      user_id: supabaseUserId, // 使用新的 Supabase user_id
      user_input: record.user_input,
      system_prompt: record.system_prompt,
      raw_output: record.raw_output,
      tokens_prompt: record.tokens_prompt,
      tokens_completion: record.tokens_completion,
      tokens_total: record.tokens_total,
      cost_usd: record.cost_usd,
      duration_ms: record.duration_ms,
      success: record.success,
      error: record.error,
      workflow_type: record.workflow_type,
      step_name: record.step_name,
      names_count: record.names_count,
    }));
    
    const supabaseCount = await SupabaseAuditLog.batchInsert(supabaseRecords);
    console.log('☁️ [Migration] Supabase 同步成功:', supabaseCount, '条记录');
    
    res.json({
      migrated: updateResult.changes,
      synced: supabaseCount,
      message: `成功迁移 ${updateResult.changes} 条记录`,
    });
  } catch (error) {
    console.error('❌ [Migration] 迁移失败:', error);
    res.status(500).json({ error: '迁移失败', details: error.message });
  }
}

/**
 * 辅助函数：截断文本
 */
function truncateText(text, maxLength) {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

