-- 系统配置表
CREATE TABLE IF NOT EXISTS settings (
  key VARCHAR(100) PRIMARY KEY,
  value TEXT NOT NULL,
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 插入默认配置
INSERT OR IGNORE INTO settings (key, value, description) VALUES
  ('max_names', '5', '名字数量上限（Narrow Down功能）'),
  ('concurrent_limit', '5', 'API并发调用数限制');

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);


