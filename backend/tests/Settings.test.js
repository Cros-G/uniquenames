import { describe, test, expect, beforeEach } from '@jest/globals';
import { Settings } from '../models/Settings.js';
import { getDatabase } from '../db/init.js';

let db;

beforeEach(() => {
  db = getDatabase();
  // 重置配置为默认值
  db.prepare(`UPDATE settings SET value = '5' WHERE key = 'max_names'`).run();
  db.prepare(`UPDATE settings SET value = '5' WHERE key = 'concurrent_limit'`).run();
});

describe('Settings Model', () => {
  test('应该能获取配置值', () => {
    const maxNames = Settings.get(db, 'max_names');
    expect(maxNames).toBe('5');
  });

  test('应该能获取所有配置', () => {
    const all = Settings.getAll(db);
    expect(all.length).toBeGreaterThanOrEqual(2);
    expect(all.some(s => s.key === 'max_names')).toBe(true);
    expect(all.some(s => s.key === 'concurrent_limit')).toBe(true);
  });

  test('应该能更新配置值', () => {
    Settings.set(db, 'max_names', '10');
    const updated = Settings.get(db, 'max_names');
    expect(updated).toBe('10');
  });

  test('应该能批量更新配置', () => {
    Settings.setMultiple(db, {
      'max_names': '8',
      'concurrent_limit': '3',
    });

    expect(Settings.get(db, 'max_names')).toBe('8');
    expect(Settings.get(db, 'concurrent_limit')).toBe('3');
  });

  test('应该在更新时自动更新 updated_at', () => {
    const before = db.prepare('SELECT updated_at FROM settings WHERE key = ?').get('max_names');
    
    // 等待1秒确保时间变化
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
    return sleep(1000).then(() => {
      Settings.set(db, 'max_names', '7');
      const after = db.prepare('SELECT updated_at FROM settings WHERE key = ?').get('max_names');
      
      expect(after.updated_at).not.toBe(before.updated_at);
    });
  });

  test('获取不存在的key应该返回null', () => {
    const value = Settings.get(db, 'non_existent_key');
    expect(value).toBeNull();
  });

  test('应该能获取配置的元数据', () => {
    const setting = Settings.getWithMeta(db, 'max_names');
    expect(setting).not.toBeNull();
    expect(setting.key).toBe('max_names');
    expect(setting.value).toBe('5');
    expect(setting.description).toBeDefined();
  });
});


