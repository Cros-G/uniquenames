import { AuditLog } from '../models/AuditLog.js';
import { getDatabase } from '../db/init.js';

/**
 * 审计日志控制器
 */
export const auditController = {
  /**
   * 获取所有审计日志（支持筛选和分页）
   */
  getAll(req, res) {
    try {
      const db = getDatabase();
      
      const options = {
        limit: parseInt(req.query.limit) || undefined,
        offset: parseInt(req.query.offset) || undefined,
        model: req.query.model || undefined,
        success: req.query.success !== undefined 
          ? req.query.success === 'true' 
          : undefined,
      };

      const logs = AuditLog.findAll(db, options);
      res.json({ logs });
    } catch (error) {
      console.error('获取审计日志失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 获取单条审计日志
   */
  getById(req, res) {
    try {
      const db = getDatabase();
      const log = AuditLog.findById(db, req.params.id);
      
      if (!log) {
        return res.status(404).json({ error: 'Audit log not found' });
      }
      
      res.json({ log });
    } catch (error) {
      console.error('获取审计日志失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 获取统计信息
   */
  getStats(req, res) {
    try {
      const db = getDatabase();
      const stats = AuditLog.getStats(db);
      const statsByModel = AuditLog.getStatsByModel(db);
      
      res.json({ stats, statsByModel });
    } catch (error) {
      console.error('获取统计信息失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 清空所有审计日志
   */
  clear(req, res) {
    try {
      const db = getDatabase();
      AuditLog.clear(db);
      
      res.json({ message: 'All audit logs cleared' });
    } catch (error) {
      console.error('清空审计日志失败:', error);
      res.status(500).json({ error: error.message });
    }
  },
};


