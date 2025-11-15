import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import { Prompt } from '../models/Prompt.js';
import { getDatabase, closeDatabase } from '../db/init.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let db;
const TEST_DB_PATH = path.join(__dirname, '..', 'db', 'test.db');

beforeEach(() => {
  // 创建/获取测试数据库
  db = getDatabase();
  
  // 只清空测试数据（ID > 1000 的是测试数据，真实数据ID < 1000）
  db.prepare('DELETE FROM audit_logs WHERE id > 1000').run();
  db.prepare('DELETE FROM prompts WHERE id > 1000').run();
});

afterEach(() => {
  // 不关闭连接，使用单例模式
  // closeDatabase(db);
});

describe('Prompt Model', () => {
  test('应该能创建新提示词', () => {
    const id = Prompt.create(db, {
      name: '测试提示词',
      version: '1.0',
      tag: 'generation',
      content: '测试内容',
      defaultModel: 'anthropic/claude-3.5-sonnet',
      isActive: true,
    });

    expect(id).toBeGreaterThan(0);
  });

  test('应该能查询所有提示词', () => {
    // 创建两个提示词
    Prompt.create(db, {
      name: '提示词1',
      version: '1.0',
      tag: 'generation',
      content: '内容1',
      isActive: true,
    });
    
    Prompt.create(db, {
      name: '提示词2',
      version: '1.0',
      tag: 'selection',
      content: '内容2',
      isActive: true,
    });

    const all = Prompt.findAll(db);
    expect(all.length).toBe(2);
  });

  test('应该能按标签查询提示词', () => {
    Prompt.create(db, {
      name: '生成提示词',
      version: '1.0',
      tag: 'generation',
      content: '生成内容',
      isActive: true,
    });
    
    Prompt.create(db, {
      name: '选择提示词',
      version: '1.0',
      tag: 'selection',
      content: '选择内容',
      isActive: true,
    });

    const generationPrompts = Prompt.findByTag(db, 'generation');
    expect(generationPrompts.length).toBe(1);
    expect(generationPrompts[0].name).toBe('生成提示词');
  });

  test('应该能获取激活的提示词', () => {
    Prompt.create(db, {
      name: '旧版本',
      version: '1.0',
      tag: 'generation',
      content: '旧内容',
      isActive: false,
    });
    
    Prompt.create(db, {
      name: '新版本',
      version: '2.0',
      tag: 'generation',
      content: '新内容',
      isActive: true,
    });

    const active = Prompt.getActive(db, 'generation');
    expect(active).not.toBeNull();
    expect(active.name).toBe('新版本');
    expect(active.is_active).toBe(1);
  });

  test('应该能设置激活版本（同时取消其他）', () => {
    const id1 = Prompt.create(db, {
      name: '版本1',
      version: '1.0',
      tag: 'generation',
      content: '内容1',
      isActive: true,
    });
    
    const id2 = Prompt.create(db, {
      name: '版本2',
      version: '2.0',
      tag: 'generation',
      content: '内容2',
      isActive: false,
    });

    // 激活版本2
    Prompt.setActive(db, id2, 'generation');

    // 验证版本2被激活
    const prompt2 = Prompt.findById(db, id2);
    expect(prompt2.is_active).toBe(1);

    // 验证版本1被取消激活
    const prompt1 = Prompt.findById(db, id1);
    expect(prompt1.is_active).toBe(0);
  });

  test('应该能更新提示词', () => {
    const id = Prompt.create(db, {
      name: '原名称',
      version: '1.0',
      tag: 'generation',
      content: '原内容',
    });

    Prompt.update(db, id, {
      name: '新名称',
      content: '新内容',
    });

    const updated = Prompt.findById(db, id);
    expect(updated.name).toBe('新名称');
    expect(updated.content).toBe('新内容');
  });

  test('应该能删除提示词', () => {
    const id = Prompt.create(db, {
      name: '待删除',
      version: '1.0',
      tag: 'generation',
      content: '内容',
    });

    Prompt.delete(db, id);

    const deleted = Prompt.findById(db, id);
    expect(deleted).toBeNull();
  });
});

