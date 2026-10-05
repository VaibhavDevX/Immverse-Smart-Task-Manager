import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../app.js';
import { userStore } from '../store/userStore.js';
import { taskStore } from '../store/taskStore.js';
import { seedData } from '../seed.js';

describe('Comprehensive End-to-End Workflow & API Test Suite', () => {
  beforeEach(() => {
    // Reset and seed data before test suites
    seedData();
  });

  describe('1. Environment Verification & Health Check', () => {
    it('GET /api/health should respond HTTP 200 OK with server status', async () => {
      const res = await request(app).get('/api/health');
      assert.equal(res.status, 200);
      assert.equal(res.body.status, 'ok');
      assert.ok(res.body.message.includes('Immverse Smart Task Manager API Server'));
    });
  });

  describe('2. User Management & Mock Authentication Workflows', () => {
    it('GET /api/users - should retrieve seeded users directory', async () => {
      const res = await request(app).get('/api/users');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 3);
    });

    it('POST /api/users - should create a new user with name & email', async () => {
      const res = await request(app).post('/api/users').send({
        name: 'Samantha Vance',
        email: 'samantha.vance@immverse.ai',
      });
      assert.equal(res.status, 201);
      assert.equal(res.body.success, true);
      assert.equal(res.body.data.name, 'Samantha Vance');
      assert.equal(res.body.data.email, 'samantha.vance@immverse.ai');
    });

    it('POST /api/users - should reject duplicate email registration', async () => {
      const res = await request(app).post('/api/users').send({
        name: 'Alex Duplicate',
        email: 'alex.morgan@immverse.ai', // Seeded user email
      });
      assert.equal(res.status, 409);
      assert.equal(res.body.success, false);
      assert.equal(res.body.code, 'DUPLICATE_EMAIL');
    });

    it('POST /api/auth/login - should log in user using email or ID', async () => {
      // Login by email
      const res1 = await request(app).post('/api/auth/login').send({
        email: 'alex.morgan@immverse.ai',
      });
      assert.equal(res1.status, 200);
      assert.equal(res1.body.success, true);
      assert.equal(res1.body.data.name, 'Alex Morgan');

      // Login by ID
      const res2 = await request(app).post('/api/auth/login').send({
        userId: 'usr-priya-002',
      });
      assert.equal(res2.status, 200);
      assert.equal(res2.body.data.name, 'Priya Sharma');
    });
  });

  describe('3. Task CRUD & Query Filtering Workflows', () => {
    it('GET /api/tasks - should retrieve all tasks and filter by priority, status, search', async () => {
      const resAll = await request(app).get('/api/tasks');
      assert.equal(resAll.status, 200);
      assert.equal(resAll.body.success, true);
      assert.ok(resAll.body.data.length >= 7);

      // Filter by Priority=High
      const resHigh = await request(app).get('/api/tasks?priority=High');
      assert.equal(resHigh.status, 200);
      assert.ok(resHigh.body.data.every((t: any) => t.priority === 'High'));

      // Filter by Status=In Progress
      const resInProgress = await request(app).get('/api/tasks?status=In Progress');
      assert.equal(resInProgress.status, 200);
      assert.ok(resInProgress.body.data.every((t: any) => t.status === 'In Progress'));

      // Search Query filter
      const resSearch = await request(app).get('/api/tasks?search=Graph');
      assert.equal(resSearch.status, 200);
      assert.ok(resSearch.body.data.some((t: any) => t.title.includes('Graph')));
    });

    it('GET /api/tasks/my - should retrieve tasks assigned to active user via x-user-id header', async () => {
      const res = await request(app).get('/api/tasks/my').set('x-user-id', 'usr-alex-001');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(res.body.data.every((t: any) => t.assignedTo === 'usr-alex-001'));
    });

    it('POST /api/tasks & PUT /api/tasks/:id & DELETE /api/tasks/:id - Task lifecycle', async () => {
      // 1. Create task
      const createRes = await request(app).post('/api/tasks').send({
        title: 'New Feature Lifecycle Task',
        description: 'Testing create, edit, delete flow',
        priority: 'Medium',
        status: 'To Do',
        assignedTo: 'usr-alex-001',
      });
      assert.equal(createRes.status, 201);
      const taskId = createRes.body.data.id;

      // 2. Edit task
      const updateRes = await request(app).put(`/api/tasks/${taskId}`).send({
        title: 'Updated Feature Lifecycle Task',
        priority: 'High',
        status: 'In Progress',
      });
      assert.equal(updateRes.status, 200);
      assert.equal(updateRes.body.data.title, 'Updated Feature Lifecycle Task');
      assert.equal(updateRes.body.data.priority, 'High');

      // 3. Delete task
      const deleteRes = await request(app).delete(`/api/tasks/${taskId}`);
      assert.equal(deleteRes.status, 200);

      // Verify task is removed
      const getRes = await request(app).get(`/api/tasks/${taskId}`);
      assert.equal(getRes.status, 404);
    });
  });

  describe('4. Dependency Graph Engine & Blocked Tasks Validation', () => {
    it('GET /api/tasks/blocked - should list tasks with incomplete dependencies', async () => {
      const res = await request(app).get('/api/tasks/blocked');
      assert.equal(res.status, 200);
      assert.equal(res.body.success, true);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.some((t: any) => t.id === 'tsk-005')); // tsk-005 depends on tsk-004 (In Progress)
    });

    it('Attempting to complete a task with incomplete dependencies should be REJECTED', async () => {
      // tsk-005 depends on tsk-004 which is 'In Progress'
      const res = await request(app).patch('/api/tasks/tsk-005/complete');
      assert.equal(res.status, 400);
      assert.equal(res.body.success, false);
      assert.equal(res.body.code, 'INCOMPLETE_DEPENDENCIES');
      assert.ok(res.body.error.includes('incomplete'));
    });

    it('Completing prerequisite task allows dependent task to be completed', async () => {
      // Complete tsk-004 first
      const completePrereqRes = await request(app).patch('/api/tasks/tsk-004/complete');
      assert.equal(completePrereqRes.status, 200);
      assert.equal(completePrereqRes.body.data.status, 'Done');

      // Now complete tsk-005 (which depends on tsk-004) -> SUCCEEDS!
      const completeDependentRes = await request(app).patch('/api/tasks/tsk-005/complete');
      assert.equal(completeDependentRes.status, 200);
      assert.equal(completeDependentRes.body.data.status, 'Done');
    });

    it('Self-dependency and Circular dependency attempts must be REJECTED', async () => {
      // Self dependency rejection
      const selfDepRes = await request(app).put('/api/tasks/tsk-001').send({
        dependencies: ['tsk-001'],
      });
      assert.equal(selfDepRes.status, 400);
      assert.equal(selfDepRes.body.code, 'SELF_DEPENDENCY');

      // Direct Circular Dependency rejection (tsk-001 -> tsk-002 -> tsk-001)
      const cycleRes = await request(app).put('/api/tasks/tsk-001').send({
        dependencies: ['tsk-002'], // tsk-002 already depends on tsk-001
      });
      assert.equal(cycleRes.status, 400);
      assert.equal(cycleRes.body.code, 'CIRCULAR_DEPENDENCY');
      assert.ok(cycleRes.body.error.includes('Circular dependency detected'));
    });

    it('Deleting a prerequisite task cleanly removes its ID from dependent task dependencies array', async () => {
      // tsk-002 depends on tsk-001
      const getTask2Before = await request(app).get('/api/tasks/tsk-002');
      assert.ok(getTask2Before.body.data.dependencies.includes('tsk-001'));

      // Delete tsk-001
      const deleteRes = await request(app).delete('/api/tasks/tsk-001');
      assert.equal(deleteRes.status, 200);

      // Verify tsk-002 dependencies array no longer contains tsk-001
      const getTask2After = await request(app).get('/api/tasks/tsk-002');
      assert.equal(getTask2After.body.data.dependencies.includes('tsk-001'), false);
    });
  });
});
