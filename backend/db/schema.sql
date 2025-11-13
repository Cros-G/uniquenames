-- 提示词表
CREATE TABLE IF NOT EXISTS prompts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name VARCHAR(255) NOT NULL,
  version VARCHAR(50) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  default_model VARCHAR(100),
  is_active BOOLEAN DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name, version)
);

-- 审计日志表
CREATE TABLE IF NOT EXISTS audit_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  model VARCHAR(100) NOT NULL,
  prompt_id INTEGER,
  user_input TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  raw_output TEXT,
  tokens_prompt INTEGER,
  tokens_completion INTEGER,
  tokens_total INTEGER,
  cost_usd DECIMAL(10, 6),
  duration_ms INTEGER,
  success BOOLEAN DEFAULT 1,
  error TEXT,
  FOREIGN KEY (prompt_id) REFERENCES prompts(id)
);

-- 为常用查询创建索引
CREATE INDEX IF NOT EXISTS idx_prompts_tag_active ON prompts(tag, is_active);
CREATE INDEX IF NOT EXISTS idx_audit_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_model ON audit_logs(model);
CREATE INDEX IF NOT EXISTS idx_audit_success ON audit_logs(success);


