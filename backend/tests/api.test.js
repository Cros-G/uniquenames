import { describe, test, expect } from '@jest/globals';
import request from 'supertest';
import app from '../server.js';

describe('API Endpoints', () => {
  test('Health check 应该返回 200', async () => {
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body.status).toBe('ok');
  });

  test('POST /api/generate-names 应该拒绝空的context', async () => {
    const response = await request(app)
      .post('/api/generate-names')
      .send({ context: '' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  test('POST /api/generate-names 应该拒绝缺少context', async () => {
    const response = await request(app)
      .post('/api/generate-names')
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Context is required');
  });
  
  // 注意：实际的API调用测试需要在集成测试中进行，避免在单元测试中调用真实API
});

