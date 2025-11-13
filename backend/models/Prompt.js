/**
 * Prompt 模型 - 提示词管理
 */

export const Prompt = {
  /**
   * 创建新提示词
   */
  create(db, data) {
    const stmt = db.prepare(`
      INSERT INTO prompts (name, version, tag, content, default_model, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.name,
      data.version,
      data.tag,
      data.content,
      data.defaultModel || null,
      data.isActive ? 1 : 0
    );

    return result.lastInsertRowid;
  },

  /**
   * 查询所有提示词
   */
  findAll(db) {
    const stmt = db.prepare('SELECT * FROM prompts ORDER BY created_at DESC');
    return stmt.all();
  },

  /**
   * 根据ID查询提示词
   */
  findById(db, id) {
    const stmt = db.prepare('SELECT * FROM prompts WHERE id = ?');
    return stmt.get(id) || null;
  },

  /**
   * 根据标签查询提示词
   */
  findByTag(db, tag) {
    const stmt = db.prepare('SELECT * FROM prompts WHERE tag = ? ORDER BY created_at DESC');
    return stmt.all(tag);
  },

  /**
   * 获取某标签下的激活版本
   */
  getActive(db, tag) {
    const stmt = db.prepare('SELECT * FROM prompts WHERE tag = ? AND is_active = 1');
    return stmt.get(tag) || null;
  },

  /**
   * 设置激活版本（事务处理，同时取消该标签下其他版本）
   */
  setActive(db, id, tag) {
    const transaction = db.transaction(() => {
      // 1. 取消该标签下所有提示词的激活状态
      const deactivateStmt = db.prepare('UPDATE prompts SET is_active = 0 WHERE tag = ?');
      deactivateStmt.run(tag);

      // 2. 激活目标提示词
      const activateStmt = db.prepare('UPDATE prompts SET is_active = 1, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
      activateStmt.run(id);
    });

    transaction();
  },

  /**
   * 更新提示词
   */
  update(db, id, data) {
    const fields = [];
    const values = [];

    if (data.name !== undefined) {
      fields.push('name = ?');
      values.push(data.name);
    }
    if (data.version !== undefined) {
      fields.push('version = ?');
      values.push(data.version);
    }
    if (data.tag !== undefined) {
      fields.push('tag = ?');
      values.push(data.tag);
    }
    if (data.content !== undefined) {
      fields.push('content = ?');
      values.push(data.content);
    }
    if (data.defaultModel !== undefined) {
      fields.push('default_model = ?');
      values.push(data.defaultModel);
    }
    if (data.isActive !== undefined) {
      fields.push('is_active = ?');
      values.push(data.isActive ? 1 : 0);
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    const stmt = db.prepare(`
      UPDATE prompts 
      SET ${fields.join(', ')}
      WHERE id = ?
    `);

    return stmt.run(...values);
  },

  /**
   * 删除提示词
   */
  delete(db, id) {
    const stmt = db.prepare('DELETE FROM prompts WHERE id = ?');
    return stmt.run(id);
  },
};


