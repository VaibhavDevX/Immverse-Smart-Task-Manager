import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { userService } from '../services/userService.js';
import { taskService } from '../services/taskService.js';
import { userStore } from '../store/userStore.js';
import { taskStore } from '../store/taskStore.js';
import { AppError } from '../middleware/errorHandler.js';

describe('Task Service & Dependency Engine Tests', () => {
  let userAId: string;
  let userBId: string;

  beforeEach(() => {
    userStore.clear();
    taskStore.clear();

    const userA = userService.createUser({ name: 'User Alpha', email: 'alpha@test.com' });
    const userB = userService.createUser({ name: 'User Beta', email: 'beta@test.com' });

    userAId = userA.id;
    userBId = userB.id;
  });

  describe('User Management', () => {
    it('should create a user with unique email', () => {
      const user = userService.createUser({ name: 'Charlie', email: 'charlie@test.com' });
      assert.equal(user.name, 'Charlie');
      assert.equal(user.email, 'charlie@test.com');
    });

    it('should reject duplicate email registration', () => {
      assert.throws(
        () => userService.createUser({ name: 'Alpha Copy', email: 'alpha@test.com' }),
        (err: any) => err instanceof AppError && err.code === 'DUPLICATE_EMAIL'
      );
    });

    it('should login existing user by email or ID', () => {
      const userByEmail = userService.loginUser('alpha@test.com');
      assert.equal(userByEmail.id, userAId);

      const userById = userService.loginUser(userAId);
      assert.equal(userById.email, 'alpha@test.com');
    });

    it('should fail login for non-existent user', () => {
      assert.throws(
        () => userService.loginUser('nonexistent@test.com'),
        (err: any) => err instanceof AppError && err.statusCode === 404
      );
    });
  });

  describe('Task Creation & Basic Validation', () => {
    it('should create a task assigned to a valid user', () => {
      const task = taskService.createTask({
        title: 'Initial Setup',
        assignedTo: userAId,
        priority: 'High',
      });

      assert.equal(task.title, 'Initial Setup');
      assert.equal(task.assignedTo, userAId);
      assert.equal(task.status, 'To Do');
      assert.deepEqual(task.dependencies, []);
    });

    it('should reject task creation for non-existent user', () => {
      assert.throws(
        () =>
          taskService.createTask({
            title: 'Orphan Task',
            assignedTo: 'invalid-user-id',
          }),
        (err: any) => err instanceof AppError && err.code === 'USER_NOT_FOUND'
      );
    });

    it('should reject task creation with non-existent dependency IDs', () => {
      assert.throws(
        () =>
          taskService.createTask({
            title: 'Task with ghost dependency',
            assignedTo: userAId,
            dependencies: ['non-existent-task-id'],
          }),
        (err: any) => err instanceof AppError && err.code === 'INVALID_DEPENDENCY'
      );
    });

    it('should reject creating a task as Done when its dependency is incomplete', () => {
      const depTask = taskService.createTask({
        title: 'Prerequisite Task',
        assignedTo: userAId,
        status: 'In Progress',
      });

      assert.throws(
        () =>
          taskService.createTask({
            title: 'Prematurely Completed Task',
            assignedTo: userAId,
            status: 'Done',
            dependencies: [depTask.id],
          }),
        (err: any) => err instanceof AppError && err.code === 'INCOMPLETE_DEPENDENCIES'
      );
    });
  });

  describe('Dependency Graph Rules (Self & Circular Dependency Checks)', () => {
    it('should reject self-dependency during task update', () => {
      const task = taskService.createTask({
        title: 'Self-Ref Task',
        assignedTo: userAId,
      });

      assert.throws(
        () =>
          taskService.updateTask(task.id, {
            dependencies: [task.id],
          }),
        (err: any) => err instanceof AppError && err.code === 'SELF_DEPENDENCY'
      );
    });

    it('should detect and reject direct circular dependency (A -> B -> A)', () => {
      const taskA = taskService.createTask({ title: 'Task A', assignedTo: userAId });
      const taskB = taskService.createTask({
        title: 'Task B',
        assignedTo: userBId,
        dependencies: [taskA.id],
      });

      // Now attempt to make Task A depend on Task B
      assert.throws(
        () =>
          taskService.updateTask(taskA.id, {
            dependencies: [taskB.id],
          }),
        (err: any) => err instanceof AppError && err.code === 'CIRCULAR_DEPENDENCY'
      );
    });

    it('should detect and reject deep circular dependency (A -> B -> C -> A)', () => {
      const taskA = taskService.createTask({ title: 'Task A', assignedTo: userAId });
      const taskB = taskService.createTask({
        title: 'Task B',
        assignedTo: userBId,
        dependencies: [taskA.id],
      });
      const taskC = taskService.createTask({
        title: 'Task C',
        assignedTo: userAId,
        dependencies: [taskB.id],
      });

      // Now attempt to make Task A depend on Task C (A -> C -> B -> A)
      assert.throws(
        () =>
          taskService.updateTask(taskA.id, {
            dependencies: [taskC.id],
          }),
        (err: any) => err instanceof AppError && err.code === 'CIRCULAR_DEPENDENCY'
      );
    });
  });

  describe('Completion Lock & Status Transitions', () => {
    it('should allow marking a task as Done when all dependencies are completed', () => {
      const dep1 = taskService.createTask({ title: 'Dep 1', assignedTo: userAId, status: 'To Do' });
      const dep2 = taskService.createTask({ title: 'Dep 2', assignedTo: userBId, status: 'To Do' });
      const mainTask = taskService.createTask({
        title: 'Main Task',
        assignedTo: userAId,
        dependencies: [dep1.id, dep2.id],
      });

      // Initially cannot complete mainTask
      assert.throws(
        () => taskService.completeTask(mainTask.id),
        (err: any) => err instanceof AppError && err.code === 'INCOMPLETE_DEPENDENCIES'
      );

      // Complete dep1
      taskService.updateTask(dep1.id, { status: 'Done' });

      // Still cannot complete mainTask because dep2 is incomplete
      assert.throws(
        () => taskService.completeTask(mainTask.id),
        (err: any) => err instanceof AppError && err.code === 'INCOMPLETE_DEPENDENCIES'
      );

      // Complete dep2
      taskService.updateTask(dep2.id, { status: 'Done' });

      // Now completing mainTask succeeds!
      const completedMain = taskService.completeTask(mainTask.id);
      assert.equal(completedMain.status, 'Done');
    });

    it('should reject un-completing a task if a completed dependent task relies on it', () => {
      const dep = taskService.createTask({ title: 'Base Dep', assignedTo: userAId });
      taskService.updateTask(dep.id, { status: 'Done' });

      const dependent = taskService.createTask({
        title: 'Dependent Task',
        assignedTo: userBId,
        dependencies: [dep.id],
      });
      taskService.updateTask(dependent.id, { status: 'Done' });

      // Attempting to revert `dep` to 'In Progress' should be blocked because `dependent` is 'Done'
      assert.throws(
        () => taskService.updateTask(dep.id, { status: 'In Progress' }),
        (err: any) => err instanceof AppError && err.code === 'DEPENDENT_TASKS_COMPLETED'
      );
    });
  });

  describe('Task Deletion & Reference Cleanup', () => {
    it('should safely remove deleted task ID from dependencies of other tasks', () => {
      const taskA = taskService.createTask({ title: 'Task A', assignedTo: userAId });
      const taskB = taskService.createTask({
        title: 'Task B',
        assignedTo: userBId,
        dependencies: [taskA.id],
      });

      assert.deepEqual(taskB.dependencies, [taskA.id]);

      // Delete Task A
      taskService.deleteTask(taskA.id);

      // Verify Task A is gone from store
      assert.throws(
        () => taskService.getTaskById(taskA.id),
        (err: any) => err instanceof AppError && err.statusCode === 404
      );

      // Verify Task B no longer holds reference to Task A
      const updatedTaskB = taskService.getTaskById(taskB.id);
      assert.deepEqual(updatedTaskB.dependencies, []);
    });
  });

  describe('Task Filtering & Blocked Tasks Identification', () => {
    it('should correctly identify blocked tasks and filter by status/priority', () => {
      const depIncomplete = taskService.createTask({ title: 'Incomplete Prereq', assignedTo: userAId, status: 'In Progress' });
      const blockedTask = taskService.createTask({
        title: 'Blocked Task',
        assignedTo: userBId,
        priority: 'High',
        dependencies: [depIncomplete.id],
      });

      const blockedList = taskService.getBlockedTasks();
      assert.equal(blockedList.length, 1);
      assert.equal(blockedList[0].id, blockedTask.id);
      assert.equal(blockedList[0].isBlocked, true);

      // Test priority filter
      const highPriorityTasks = taskService.getTasks({ priority: 'High' });
      assert.ok(highPriorityTasks.some((t) => t.id === blockedTask.id));

      // Test search filter
      const searchResults = taskService.getTasks({ search: 'Prereq' });
      assert.equal(searchResults.length, 1);
      assert.equal(searchResults[0].id, depIncomplete.id);
    });
  });
});
