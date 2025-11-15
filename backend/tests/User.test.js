import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import Database from 'better-sqlite3';
import fs from 'fs';
import { User } from '../models/User.js';

describe('User Model', () => {
  let db;

  beforeEach(() => {
    // 使用内存数据库测试
    db = new Database(':memory:');
    
    // 创建 users 表
    db.exec(`
      CREATE TABLE users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id VARCHAR(255) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE,
        google_id VARCHAR(255) UNIQUE,
        display_name VARCHAR(255),
        avatar_url TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        last_login DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // 创建 audit_logs 表
    db.exec(`
      CREATE TABLE audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        model VARCHAR(100) NOT NULL,
        user_id VARCHAR(255),
        user_input TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        raw_output TEXT,
        tokens_prompt INTEGER,
        tokens_completion INTEGER,
        tokens_total INTEGER,
        cost_usd DECIMAL(10, 6),
        duration_ms INTEGER,
        success BOOLEAN DEFAULT 1,
        error TEXT,
        workflow_type VARCHAR(50) DEFAULT 'generation',
        step_name VARCHAR(100),
        names_count INTEGER
      )
    `);
  });

  afterEach(() => {
    db.close();
  });

  test('findOrCreate 应该创建新用户', () => {
    const userId = 'test_user_123';
    const user = User.findOrCreate(db, userId);
    
    expect(user).toBeDefined();
    expect(user.user_id).toBe(userId);
    expect(user.display_name).toContain('User_');
  });

  test('findOrCreate 应该返回已存在的用户', () => {
    const userId = 'test_user_123';
    const user1 = User.findOrCreate(db, userId);
    const user2 = User.findOrCreate(db, userId);
    
    expect(user1.id).toBe(user2.id);
    expect(user1.user_id).toBe(user2.user_id);
  });

  test('findByUserId 应该查找用户', () => {
    const userId = 'test_user_456';
    User.findOrCreate(db, userId);
    
    const user = User.findByUserId(db, userId);
    expect(user).toBeDefined();
    expect(user.user_id).toBe(userId);
  });

  test('findByUserId 对不存在的用户返回 null', () => {
    const user = User.findByUserId(db, 'nonexistent');
    expect(user).toBeNull();
  });

  test('update 应该更新用户信息', () => {
    const userId = 'test_user_789';
    User.findOrCreate(db, userId);
    
    const updated = User.update(db, userId, {
      email: 'test@example.com',
      display_name: 'Test User',
    });
    
    expect(updated.email).toBe('test@example.com');
    expect(updated.display_name).toBe('Test User');
  });

  test('getActivities 应该获取用户的活动历史', () => {
    const userId = 'test_user_activity';
    User.findOrCreate(db, userId);
    
    // 插入测试数据（使用不同时间戳）
    const stmt = db.prepare(`
      INSERT INTO audit_logs (
        timestamp, user_id, model, user_input, system_prompt, 
        tokens_total, workflow_type, success
      ) VALUES (datetime('now', ?), ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run('-2 minutes', userId, 'gpt-4', 'test 1', 'prompt 1', 100, 'generation', 1);
    stmt.run('-1 minutes', userId, 'gpt-4', 'test 2', 'prompt 2', 200, 'narrow_down', 1);
    stmt.run('-1 minutes', 'other_user', 'gpt-4', 'test 3', 'prompt 3', 300, 'generation', 1);
    
    const activities = User.getActivities(db, userId);
    
    expect(activities).toHaveLength(2);
    expect(activities[0].user_input).toBe('test 2'); // 最新的在前
    expect(activities[1].user_input).toBe('test 1');
  });

  test('getActivities 应该支持按类型筛选', () => {
    const userId = 'test_user_filter';
    User.findOrCreate(db, userId);
    
    const stmt = db.prepare(`
      INSERT INTO audit_logs (
        user_id, model, user_input, system_prompt, 
        tokens_total, workflow_type, success
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, 'gpt-4', 'test 1', 'prompt 1', 100, 'generation', 1);
    stmt.run(userId, 'gpt-4', 'test 2', 'prompt 2', 200, 'narrow_down', 1);
    
    const generationOnly = User.getActivities(db, userId, { workflowType: 'generation' });
    
    expect(generationOnly).toHaveLength(1);
    expect(generationOnly[0].workflow_type).toBe('generation');
  });

  test('getActivityStats 应该统计用户活动', () => {
    const userId = 'test_user_stats';
    User.findOrCreate(db, userId);
    
    const stmt = db.prepare(`
      INSERT INTO audit_logs (
        user_id, model, user_input, system_prompt, 
        tokens_total, cost_usd, duration_ms, workflow_type, success
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, 'gpt-4', 'test 1', 'prompt 1', 100, 0.01, 1000, 'generation', 1);
    stmt.run(userId, 'gpt-4', 'test 2', 'prompt 2', 200, 0.02, 2000, 'generation', 1);
    stmt.run(userId, 'gpt-4', 'test 3', 'prompt 3', 300, 0.03, 3000, 'narrow_down', 1);
    
    const stats = User.getActivityStats(db, userId);
    
    expect(stats.generation.count).toBe(2);
    expect(stats.generation.total_tokens).toBe(300);
    expect(stats.narrow_down.count).toBe(1);
    expect(stats.narrow_down.total_tokens).toBe(300);
  });
});

