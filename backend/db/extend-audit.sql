-- 扩展 audit_logs 表，支持 Narrow Down 工作流

-- 添加新字段
ALTER TABLE audit_logs ADD COLUMN workflow_type VARCHAR(50) DEFAULT 'generation';
-- workflow_type: 'generation' 或 'narrow_down'

ALTER TABLE audit_logs ADD COLUMN step_name VARCHAR(100);
-- step_name: 'list_names', 'isolate', 'information', 'decide', 'story' 或 null

ALTER TABLE audit_logs ADD COLUMN names_count INTEGER;
-- narrow_down 处理的名字数量

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_audit_workflow ON audit_logs(workflow_type);
CREATE INDEX IF NOT EXISTS idx_audit_step ON audit_logs(step_name);


