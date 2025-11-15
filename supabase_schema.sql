-- ============================================
-- Supabase 数据库表结构
-- 在 Supabase Dashboard → SQL Editor 中执行
-- ============================================

-- 1. audit_logs 表（用户活动历史）
CREATE TABLE IF NOT EXISTS audit_logs (
  id BIGSERIAL PRIMARY KEY,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  model VARCHAR(100) NOT NULL,
  prompt_id INTEGER,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,  -- 关联 Supabase Auth
  user_input TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  raw_output TEXT,
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  tokens_total INTEGER,
  cost_usd DECIMAL(10, 6),
  duration_ms INTEGER,
  success BOOLEAN DEFAULT true,
  error TEXT,
  workflow_type VARCHAR(50) DEFAULT 'generation',
  step_name VARCHAR(100),
  names_count INTEGER
);

-- 2. 索引（提升查询性能）
CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_workflow ON audit_logs(workflow_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_workflow ON audit_logs(user_id, workflow_type);
CREATE INDEX IF NOT EXISTS idx_audit_user_timestamp ON audit_logs(user_id, timestamp DESC);

-- 3. Row Level Security (RLS) - 用户只能看自己的记录
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- 策略1：用户可以查看自己的审计日志
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- 策略2：系统可以插入审计日志（通过 service_role）
CREATE POLICY "System can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- 策略3：用户可以删除自己的审计日志（可选）
CREATE POLICY "Users can delete own audit logs"
  ON audit_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 验证
-- ============================================

-- 查看表结构
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'audit_logs';

-- 查看索引
-- SELECT indexname, indexdef 
-- FROM pg_indexes 
-- WHERE tablename = 'audit_logs';

-- 查看 RLS 策略
-- SELECT * FROM pg_policies WHERE tablename = 'audit_logs';

