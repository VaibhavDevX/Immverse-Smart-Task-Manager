import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';

describe('API Routes Integration Tests', () => {
  let createdUserId: string;
  let task1Id: string;
  let task2Id: string;

  it('GET /api/health - should return server health status', async () => {
    const res = await request(app).get('/api/health');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, undefined); // raw health object
    assert.equal(res.body.status, 'ok');
  });

  it('GET /api/users - should return seeded users', async () => {
    const res = await request(app).get('/api/users');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
    assert.ok(res.body.data.length >= 3);
  });

  it('POST /api/users - should create a new user', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ name: 'Integration User', email: 'integration@test.com' });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.name, 'Integration User');
    createdUserId = res.body.data.id;
  });

  it('POST /api/auth/login - should log in user by email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'integration@test.com' });

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.id, createdUserId);
  });

  it('POST /api/tasks - should create a task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Integration Parent Task',
        description: 'Testing API endpoints',
        priority: 'High',
        assignedTo: createdUserId,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    assert.equal(res.body.data.title, 'Integration Parent Task');
    task1Id = res.body.data.id;
  });

  it('POST /api/tasks - should create a dependent task', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Integration Child Task',
        assignedTo: createdUserId,
        dependencies: [task1Id],
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.success, true);
    task2Id = res.body.data.id;
  });

  it('PATCH /api/tasks/:id/complete - should fail when dependency is incomplete', async () => {
    const res = await request(app).patch(`/api/tasks/${task2Id}/complete`);
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
    assert.equal(res.body.code, 'INCOMPLETE_DEPENDENCIES');
  });

  it('PATCH /api/tasks/:id/complete - should succeed after completing dependency', async () => {
    // Complete parent task
    const res1 = await request(app).patch(`/api/tasks/${task1Id}/complete`);
    assert.equal(res1.status, 200);

    // Complete child task
    const res2 = await request(app).patch(`/api/tasks/${task2Id}/complete`);
    assert.equal(res2.status, 200);
    assert.equal(res2.body.data.status, 'Done');
  });

  it('GET /api/tasks/my - should return user tasks via x-user-id header', async () => {
    const res = await request(app)
      .get('/api/tasks/my')
      .set('x-user-id', createdUserId);

    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(res.body.data.length >= 2);
  });

  it('GET /api/tasks/blocked - should return blocked tasks list', async () => {
    const res = await request(app).get('/api/tasks/blocked');
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
    assert.ok(Array.isArray(res.body.data));
  });

  it('DELETE /api/tasks/:id - should delete a task and respond with 200', async () => {
    const res = await request(app).delete(`/api/tasks/${task2Id}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.success, true);
  });
});
