-- ============================================
-- 添加 session_id 字段到 audit_logs
-- 用于关联同一次活动的所有步骤
-- 在 Supabase Dashboard → SQL Editor 执行
-- ============================================

-- 1. 添加 session_id 字段
ALTER TABLE audit_logs ADD COLUMN IF NOT EXISTS session_id VARCHAR(255);

-- 2. 创建索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_audit_session_id ON audit_logs(session_id);

-- 3. 验证
-- 查看表结构
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'audit_logs' 
  AND column_name = 'session_id';

-- 查看索引
SELECT indexname, indexdef 
FROM pg_indexes 
WHERE tablename = 'audit_logs' 
  AND indexname = 'idx_audit_session_id';

