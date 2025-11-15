import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.db');

/**
 * 数据库迁移：添加 session_id 字段
 * 用于关联同一次活动的所有步骤
 */
function migrate() {
  console.log('🔄 开始迁移：添加 session_id 字段...');
  
  const db = new Database(DB_PATH);
  
  try {
    // 1. 检查是否已有 session_id 字段
    const columns = db.prepare('PRAGMA table_info(audit_logs)').all();
    const hasSessionId = columns.some(col => col.name === 'session_id');
    
    if (hasSessionId) {
      console.log('✅ audit_logs 表已有 session_id 字段，跳过');
    } else {
      console.log('📝 添加 session_id 字段到 audit_logs...');
      db.exec('ALTER TABLE audit_logs ADD COLUMN session_id VARCHAR(255)');
      console.log('✅ session_id 字段添加成功');
    }
    
    // 2. 创建索引
    console.log('📝 创建 session_id 索引...');
    db.exec('CREATE INDEX IF NOT EXISTS idx_audit_session_id ON audit_logs(session_id)');
    console.log('✅ 索引创建成功');
    
    // 3. 验证
    const updatedColumns = db.prepare('PRAGMA table_info(audit_logs)').all();
    const sessionIdField = updatedColumns.find(col => col.name === 'session_id');
    
    console.log('\n📊 迁移结果验证：');
    console.log('audit_logs 字段数:', updatedColumns.length);
    if (sessionIdField) {
      console.log('✅ session_id 字段存在:', sessionIdField);
    }
    
    // 4. 验证索引
    const indexes = db.prepare("SELECT name FROM sqlite_master WHERE type='index' AND tbl_name='audit_logs'").all();
    console.log('索引列表:', indexes.map(i => i.name).join(', '));
    
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

