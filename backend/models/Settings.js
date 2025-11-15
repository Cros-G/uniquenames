/**
 * Settings 模型 - 系统配置管理
 */

export const Settings = {
  /**
   * 获取配置值
   * @returns {string|null} 配置值，如果不存在返回null
   */
  get(db, key) {
    const stmt = db.prepare('SELECT value FROM settings WHERE key = ?');
    const result = stmt.get(key);
    return result ? result.value : null;
  },

  /**
   * 获取配置（包含元数据）
   */
  getWithMeta(db, key) {
    const stmt = db.prepare('SELECT * FROM settings WHERE key = ?');
    return stmt.get(key) || null;
  },

  /**
   * 获取所有配置
   */
  getAll(db) {
    const stmt = db.prepare('SELECT * FROM settings ORDER BY key');
    return stmt.all();
  },

  /**
   * 设置配置值
   */
  set(db, key, value) {
    const stmt = db.prepare(`
      UPDATE settings 
      SET value = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE key = ?
    `);
    return stmt.run(value, key);
  },

  /**
   * 批量设置配置
   */
  setMultiple(db, configs) {
    const transaction = db.transaction(() => {
      const stmt = db.prepare(`
        UPDATE settings 
        SET value = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE key = ?
      `);

      for (const [key, value] of Object.entries(configs)) {
        stmt.run(value, key);
      }
    });

    transaction();
  },

  /**
   * 创建新配置（如果不存在）
   */
  create(db, key, value, description = null) {
    const stmt = db.prepare(`
      INSERT OR IGNORE INTO settings (key, value, description)
      VALUES (?, ?, ?)
    `);
    return stmt.run(key, value, description);
  },

  /**
   * 删除配置
   */
  delete(db, key) {
    const stmt = db.prepare('DELETE FROM settings WHERE key = ?');
    return stmt.run(key);
  },
};


