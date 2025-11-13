import { Prompt } from '../models/Prompt.js';
import { getDatabase } from '../db/init.js';

/**
 * 提示词管理控制器
 */
export const promptController = {
  /**
   * 获取所有提示词
   */
  getAll(req, res) {
    try {
      const db = getDatabase();
      const prompts = Prompt.findAll(db);
      res.json({ prompts });
    } catch (error) {
      console.error('获取提示词失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 获取单个提示词
   */
  getById(req, res) {
    try {
      const db = getDatabase();
      const prompt = Prompt.findById(db, req.params.id);
      
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }
      
      res.json({ prompt });
    } catch (error) {
      console.error('获取提示词失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 获取某标签的激活提示词
   */
  getActive(req, res) {
    try {
      const db = getDatabase();
      const prompt = Prompt.getActive(db, req.params.tag);
      
      if (!prompt) {
        return res.status(404).json({ error: 'No active prompt found for this tag' });
      }
      
      res.json({ prompt });
    } catch (error) {
      console.error('获取激活提示词失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 创建新提示词
   */
  create(req, res) {
    try {
      const { name, version, tag, content, defaultModel, isActive } = req.body;

      // 验证必填字段
      if (!name || !version || !tag || !content) {
        return res.status(400).json({ 
          error: 'Missing required fields: name, version, tag, content' 
        });
      }

      const db = getDatabase();
      const id = Prompt.create(db, {
        name,
        version,
        tag,
        content,
        defaultModel,
        isActive,
      });

      res.status(201).json({ id, message: 'Prompt created successfully' });
    } catch (error) {
      console.error('创建提示词失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 更新提示词
   */
  update(req, res) {
    try {
      const db = getDatabase();
      const id = req.params.id;

      // 检查提示词是否存在
      const existing = Prompt.findById(db, id);
      if (!existing) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      Prompt.update(db, id, req.body);
      
      res.json({ message: 'Prompt updated successfully' });
    } catch (error) {
      console.error('更新提示词失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 设置激活版本
   */
  activate(req, res) {
    try {
      const db = getDatabase();
      const id = req.params.id;
      const { tag } = req.body;

      if (!tag) {
        return res.status(400).json({ error: 'Tag is required' });
      }

      // 检查提示词是否存在
      const prompt = Prompt.findById(db, id);
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      Prompt.setActive(db, id, tag);
      
      res.json({ message: 'Prompt activated successfully' });
    } catch (error) {
      console.error('激活提示词失败:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * 删除提示词
   */
  delete(req, res) {
    try {
      const db = getDatabase();
      const id = req.params.id;

      // 检查提示词是否存在
      const prompt = Prompt.findById(db, id);
      if (!prompt) {
        return res.status(404).json({ error: 'Prompt not found' });
      }

      // 不允许删除激活的提示词
      if (prompt.is_active) {
        return res.status(400).json({ 
          error: 'Cannot delete active prompt. Please activate another version first.' 
        });
      }

      Prompt.delete(db, id);
      
      res.json({ message: 'Prompt deleted successfully' });
    } catch (error) {
      console.error('删除提示词失败:', error);
      res.status(500).json({ error: error.message });
    }
  },
};


