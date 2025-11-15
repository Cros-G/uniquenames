-- Users 表 - 为后续登录功能做准备
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id VARCHAR(255) UNIQUE NOT NULL,  -- 唯一标识（UUID 或匿名 ID）
  email VARCHAR(255) UNIQUE,              -- 邮箱（可选，登录后填充）
  google_id VARCHAR(255) UNIQUE,          -- Google ID（可选，Google 登录后填充）
  display_name VARCHAR(255),              -- 显示名称
  avatar_url TEXT,                        -- 头像 URL
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_users_user_id ON users(user_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);

