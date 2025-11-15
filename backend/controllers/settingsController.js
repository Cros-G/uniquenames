import { Settings } from '../models/Settings.js';
import { getDatabase } from '../db/init.js';

/**
 * 系统配置控制器
 */
export const settingsController = {
  /**
   * 获取所有配置
   */
  getAll(req, res) {
    try {
      const db = getDatabase();
      const settings = Settings.getAll(db);
      res.json({ settings });
    } catch (error) {
      console.error('获取配置失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 更新配置
   */
  update(req, res) {
    try {
      const db = getDatabase();
      const configs = req.body;

      Settings.setMultiple(db, configs);
      
      res.json({ message: 'Settings updated successfully' });
    } catch (error) {
      console.error('更新配置失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 重置为默认配置
   */
  reset(req, res) {
    try {
      const db = getDatabase();
      
      Settings.set(db, 'max_names', '5');
      Settings.set(db, 'concurrent_limit', '5');
      
      res.json({ message: 'Settings reset to default' });
    } catch (error) {
      console.error('重置配置失败:', error);
      res.status(500).json({ error: error.message });
    }
  },
};



