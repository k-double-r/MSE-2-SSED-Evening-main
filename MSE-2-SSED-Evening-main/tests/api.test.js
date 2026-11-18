import request from 'supertest';
//const request = require('supertest');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const api = request(BASE_URL);
const email = `student-${Date.now()}@example.com`;
const password = 'student123';
let token;
let taskId;

describe('TaskFlow deployed API', () => {
  test('TC01: health endpoint confirms API, PostgreSQL and Redis', async () => {
    const response = await api.get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({ status: 'ok', postgres: 'ok', redis: 'ok' });
  });

  test('TC02: register a user', async () => {
    const response = await api.post('/api/auth/register').send({ name: 'Docker Student', email, password });
    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe(email);
  });

  test('TC03: reject duplicate email', async () => {
    const response = await api.post('/api/auth/register').send({ name: 'Duplicate', email, password });
    expect(response.status).toBe(409);
  });

  test('TC04: login and receive token', async () => {
    const response = await api.post('/api/auth/login').send({ email, password });
    expect(response.status).toBe(200);
    expect(response.body.token).toBeTruthy();
    token = response.body.token;
  });

  test('TC05: reject unauthenticated task request', async () => {
    const response = await api.get('/api/tasks');
    expect(response.status).toBe(401);
  });

  test('TC06: create a task', async () => {
    const response = await api.post('/api/tasks').set('Authorization', `Bearer ${token}`)
      .send({ title: 'Complete Docker practical', description: 'Build and publish images' });
    expect(response.status).toBe(201);
    taskId = response.body.task.id;
  });

  test('TC07: list tasks and populate cache', async () => {
    const response = await api.get('/api/tasks').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.tasks.some(task => task.id === taskId)).toBe(true);
    expect(['postgres', 'redis-cache']).toContain(response.body.source);
  });

  test('TC08: subsequent list can be served from Redis', async () => {
    const response = await api.get('/api/tasks').set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body.source).toBe('redis-cache');
  });

  test('TC09: update task status and invalidate cache', async () => {
    const response = await api.patch(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`)
      .send({ status: 'Completed' });
    expect(response.status).toBe(200);
    expect(response.body.task.status).toBe('Completed');
  });

  test('TC10: reject invalid task status', async () => {
    const response = await api.patch(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`)
      .send({ status: 'Unknown' });
    expect(response.status).toBe(400);
  });

  test('TC11: delete task', async () => {
    const response = await api.delete(`/api/tasks/${taskId}`).set('Authorization', `Bearer ${token}`);
    expect(response.status).toBe(200);
  });

  test('TC12: deleted task is no longer in list', async () => {
    const response = await api.get('/api/tasks').set('Authorization', `Bearer ${token}`);
    expect(response.body.tasks.some(task => task.id === taskId)).toBe(false);
  });
});
