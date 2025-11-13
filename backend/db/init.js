import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, 'database.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// 单例数据库连接
let dbInstance = null;

/**
 * 初始化数据库
 * 如果数据库不存在，创建并执行 schema
 */
export function initDatabase() {
  console.log('🗄️  初始化数据库...');
  console.log('📁 数据库路径:', DB_PATH);

  // 创建或打开数据库
  const db = new Database(DB_PATH);
  
  // 读取 schema
  const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
  
  // 执行 schema（创建表和索引）
  db.exec(schema);
  
  console.log('✅ 数据库初始化完成');
  
  return db;
}

/**
 * 获取数据库连接（单例模式）
 */
export function getDatabase() {
  if (!dbInstance) {
    // 如果数据库不存在，先初始化
    if (!fs.existsSync(DB_PATH)) {
      dbInstance = initDatabase();
    } else {
      dbInstance = new Database(DB_PATH);
    }
  }
  
  return dbInstance;
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(db) {
  if (db && db === dbInstance) {
    dbInstance = null;
  }
  if (db) {
    db.close();
    console.log('🔒 数据库连接已关闭');
  }
}

