import { supabase } from '../lib/supabase.js';

/**
 * SupabaseAuditLog 模型 - Supabase 审计日志管理
 * 遵循 good_habits.md: 职责单一，错误处理完善
 */

export const SupabaseAuditLog = {
  /**
   * 创建审计日志到 Supabase
   * @param {object} data - 审计日志数据
   * @returns {Promise<string|null>} 记录 ID 或 null（失败时）
   */
  async create(data) {
    if (!supabase) {
      console.warn('⚠️ [SupabaseAuditLog] Supabase 未配置，跳过写入');
      return null;
    }

    try {
      const { data: result, error } = await supabase
        .from('audit_logs')
        .insert({
          timestamp: new Date().toISOString(),
          model: data.model,
          prompt_id: data.promptId || null,
          user_id: data.userId || null,
          user_input: data.userInput,
          system_prompt: data.systemPrompt,
          raw_output: data.rawOutput || null,
          tokens_prompt: data.tokensPrompt || null,
          tokens_completion: data.tokensCompletion || null,
          tokens_total: data.tokensTotal || null,
          cost_usd: data.costUsd || null,
          duration_ms: data.durationMs,
          success: data.success,
          error: data.error || null,
          workflow_type: data.workflowType || 'generation',
          step_name: data.stepName || null,
          names_count: data.namesCount || null,
          session_id: data.sessionId || null,
        })
        .select()
        .single();

      if (error) {
        console.error('❌ [SupabaseAuditLog] 写入失败:', error);
        return null;
      }

      console.log('✅ [SupabaseAuditLog] 写入成功, ID:', result.id);
      return result.id;
    } catch (error) {
      console.error('❌ [SupabaseAuditLog] 异常:', error);
      return null;
    }
  },

  /**
   * 查询用户的审计日志
   * @param {string} userId - 用户 ID
   * @param {object} options - 查询选项
   * @returns {Promise<array>} 审计日志列表
   */
  async findByUserId(userId, options = {}) {
    if (!supabase) {
      console.warn('⚠️ [SupabaseAuditLog] Supabase 未配置');
      return [];
    }

    try {
      const { limit = 20, offset = 0, workflowType = null } = options;

      let query = supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false })
        .range(offset, offset + limit - 1);

      if (workflowType) {
        query = query.eq('workflow_type', workflowType);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ [SupabaseAuditLog] 查询失败:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('❌ [SupabaseAuditLog] 查询异常:', error);
      return [];
    }
  },

  /**
   * 批量插入（用于迁移）
   * @param {array} records - 记录数组
   * @returns {Promise<number>} 成功插入的数量
   */
  async batchInsert(records) {
    if (!supabase) {
      console.warn('⚠️ [SupabaseAuditLog] Supabase 未配置');
      return 0;
    }

    try {
      const { data, error } = await supabase
        .from('audit_logs')
        .insert(records)
        .select();

      if (error) {
        console.error('❌ [SupabaseAuditLog] 批量插入失败:', error);
        return 0;
      }

      console.log('✅ [SupabaseAuditLog] 批量插入成功:', data?.length || 0);
      return data?.length || 0;
    } catch (error) {
      console.error('❌ [SupabaseAuditLog] 批量插入异常:', error);
      return 0;
    }
  },
};

