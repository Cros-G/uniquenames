import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.db');
const USERS_SCHEMA_PATH = path.join(__dirname, 'users-schema.sql');

/**
 * 数据库迁移：添加 user_id 字段和 users 表
 */
function migrate() {
  console.log('🔄 开始数据库迁移：添加用户支持...');
  
  const db = new Database(DB_PATH);
  
  try {
    // 1. 检查 audit_logs 是否已有 user_id 字段
    const columns = db.prepare('PRAGMA table_info(audit_logs)').all();
    const hasUserId = columns.some(col => col.name === 'user_id');
    
    if (hasUserId) {
      console.log('✅ audit_logs 表已有 user_id 字段，跳过');
    } else {
      console.log('📝 添加 user_id 字段到 audit_logs...');
      db.exec('ALTER TABLE audit_logs ADD COLUMN user_id VARCHAR(255)');
      console.log('✅ user_id 字段添加成功');
    }
    
    // 2. 为 user_id 创建索引
    console.log('📝 创建索引...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_audit_user_id ON audit_logs(user_id)');
    console.log('✅ 索引创建成功');
    
    // 3. 创建 users 表
    console.log('📝 创建 users 表...');
    const usersSchema = fs.readFileSync(USERS_SCHEMA_PATH, 'utf-8');
    db.exec(usersSchema);
    console.log('✅ users 表创建成功');
    
    // 4. 验证
    const auditColumns = db.prepare('PRAGMA table_info(audit_logs)').all();
    const usersColumns = db.prepare('PRAGMA table_info(users)').all();
    
    console.log('\n📊 迁移结果验证：');
    console.log('audit_logs 字段数:', auditColumns.length);
    console.log('users 字段数:', usersColumns.length);
    
    const userIdField = auditColumns.find(col => col.name === 'user_id');
    if (userIdField) {
      console.log('✅ user_id 字段存在:', userIdField);
    }
    
    console.log('\n🎉 数据库迁移完成！');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
    throw error;
  } finally {
    db.close();
  }
}

// 执行迁移
migrate();

