/**
 * Narrow Down 功能数据库迁移
 * 添加 settings 表和扩展 audit_logs 表
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { getDatabase, closeDatabase } from './init.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔄 开始 Narrow Down 数据库迁移...\n');

try {
  const db = getDatabase();

  // 1. 创建 settings 表
  console.log('1️⃣ 创建 settings 表...');
  const settingsSchema = fs.readFileSync(
    path.join(__dirname, 'settings-schema.sql'), 
    'utf-8'
  );
  db.exec(settingsSchema);
  console.log('✅ settings 表创建完成');

  // 2. 扩展 audit_logs 表
  console.log('\n2️⃣ 扩展 audit_logs 表...');
  const extendAuditSchema = fs.readFileSync(
    path.join(__dirname, 'extend-audit.sql'), 
    'utf-8'
  );
  
  try {
    db.exec(extendAuditSchema);
    console.log('✅ audit_logs 表扩展完成');
  } catch (error) {
    // 如果字段已存在会报错，忽略
    if (error.message.includes('duplicate column name')) {
      console.log('⚠️  字段已存在，跳过');
    } else {
      throw error;
    }
  }

  // 3. 验证配置
  console.log('\n3️⃣ 验证配置...');
  const settings = db.prepare('SELECT * FROM settings').all();
  console.log('📋 系统配置:');
  settings.forEach(s => {
    console.log(`   ${s.key} = ${s.value} (${s.description})`);
  });

  closeDatabase(db);

  console.log('\n🎉 Narrow Down 数据库迁移完成！');

} catch (error) {
  console.error('\n❌ 迁移失败:', error.message);
  console.error(error.stack);
  process.exit(1);
}


