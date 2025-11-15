import { describe, test, expect, beforeEach, afterEach } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';
import { getDatabase, closeDatabase } from '../db/init.js';
import { Prompt } from '../models/Prompt.js';

let db;

beforeEach(() => {
  db = getDatabase();
  // 只清空测试数据（ID > 1000）
  db.prepare('DELETE FROM audit_logs WHERE id > 1000').run();
  db.prepare('DELETE FROM prompts WHERE id > 1000').run();
});

afterEach(() => {
  // 不关闭连接，使用单例模式
  // closeDatabase(db);
});

describe('Prompt Management API', () => {
  test('GET /api/admin/prompts 应该返回所有提示词', async () => {
    // 创建测试数据
    Prompt.create(db, {
      name: '测试1',
      version: '1.0',
      tag: 'generation',
      content: '内容1',
      isActive: true,
    });

    const response = await request(app).get('/api/admin/prompts');
    
    expect(response.status).toBe(200);
    expect(response.body.prompts).toBeDefined();
    expect(response.body.prompts.length).toBe(1);
  });

  test('GET /api/admin/prompts/:id 应该返回单个提示词', async () => {
    const id = Prompt.create(db, {
      name: '测试',
      version: '1.0',
      tag: 'generation',
      content: '测试内容',
      isActive: true,
    });

    const response = await request(app).get(`/api/admin/prompts/${id}`);
    
    expect(response.status).toBe(200);
    expect(response.body.prompt).toBeDefined();
    expect(response.body.prompt.name).toBe('测试');
  });

  test('POST /api/admin/prompts 应该创建新提示词', async () => {
    const response = await request(app)
      .post('/api/admin/prompts')
      .send({
        name: '新提示词',
        version: '1.0',
        tag: 'generation',
        content: '新内容',
        defaultModel: 'gpt-4',
        isActive: false,
      });

    expect(response.status).toBe(201);
    expect(response.body.id).toBeGreaterThan(0);
  });

  test('PUT /api/admin/prompts/:id 应该更新提示词', async () => {
    const id = Prompt.create(db, {
      name: '原名',
      version: '1.0',
      tag: 'generation',
      content: '原内容',
      isActive: false,
    });

    const response = await request(app)
      .put(`/api/admin/prompts/${id}`)
      .send({
        name: '新名',
        content: '新内容',
      });

    expect(response.status).toBe(200);
    
    const updated = Prompt.findById(db, id);
    expect(updated.name).toBe('新名');
  });

  test('PUT /api/admin/prompts/:id/activate 应该设置激活版本', async () => {
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

    const response = await request(app)
      .put(`/api/admin/prompts/${id2}/activate`)
      .send({ tag: 'generation' });

    expect(response.status).toBe(200);
    
    const active = Prompt.getActive(db, 'generation');
    expect(active.id).toBe(id2);
  });

  test('DELETE /api/admin/prompts/:id 应该删除提示词', async () => {
    const id = Prompt.create(db, {
      name: '待删除',
      version: '1.0',
      tag: 'generation',
      content: '内容',
      isActive: false,
    });

    const response = await request(app).delete(`/api/admin/prompts/${id}`);
    
    expect(response.status).toBe(200);
    
    const deleted = Prompt.findById(db, id);
    expect(deleted).toBeNull();
  });
});

