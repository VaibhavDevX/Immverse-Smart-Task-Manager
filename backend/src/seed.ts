import { userStore } from './store/userStore.js';
import { taskStore } from './store/taskStore.js';
import { User, Task } from './types/index.js';

let isSeeded = false;

export function seedData(): void {
  if (isSeeded && userStore.count() > 0) return;

  userStore.clear();
  taskStore.clear();

  const user1: User = {
    id: 'usr-alex-001',
    name: 'Alex Morgan',
    email: 'alex.morgan@immverse.ai',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
  };

  const user2: User = {
    id: 'usr-priya-002',
    name: 'Priya Sharma',
    email: 'priya.sharma@immverse.ai',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
  };

  const user3: User = {
    id: 'usr-carlos-003',
    name: 'Carlos Mendez',
    email: 'carlos.mendez@immverse.ai',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  };

  userStore.create(user1);
  userStore.create(user2);
  userStore.create(user3);

  // Tasks
  const task1: Task = {
    id: 'tsk-001',
    title: 'Architecture & In-Memory Store Setup',
    description: 'Design and implement TypeScript data models and store structures.',
    priority: 'High',
    status: 'Done',
    assignedTo: user1.id,
    dependencies: [],
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 4 * 86400000).toISOString(),
  };

  const task2: Task = {
    id: 'tsk-002',
    title: 'User Management & Auth API',
    description: 'Create user creation, retrieval, and mock authentication endpoints.',
    priority: 'High',
    status: 'Done',
    assignedTo: user2.id,
    dependencies: [task1.id],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  };

  const task3: Task = {
    id: 'tsk-003',
    title: 'DFS Dependency Graph Engine',
    description: 'Implement cycle detection and status completion locking algorithm.',
    priority: 'High',
    status: 'Done',
    assignedTo: user3.id,
    dependencies: [task1.id],
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  };

  const task4: Task = {
    id: 'tsk-004',
    title: 'Task REST Endpoints & Controllers',
    description: 'Expose CRUD routes for tasks with dependency verification rules.',
    priority: 'Medium',
    status: 'In Progress',
    assignedTo: user1.id,
    dependencies: [task2.id, task3.id],
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  };

  const task5: Task = {
    id: 'tsk-005',
    title: 'Frontend SaaS Dashboard Layout',
    description: 'Build Next.js responsive sidebar, task cards, and filter toolbar.',
    priority: 'High',
    status: 'To Do',
    assignedTo: user2.id,
    dependencies: [task4.id], // Blocked because task4 is 'In Progress'
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  };

  const task6: Task = {
    id: 'tsk-006',
    title: 'Dependency Graph Visualization',
    description: 'Visual indicator for blocked tasks and dependency chips.',
    priority: 'Low',
    status: 'To Do',
    assignedTo: user3.id,
    dependencies: [task5.id], // Blocked because task5 is 'To Do'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const task7: Task = {
    id: 'tsk-007',
    title: 'Integration Test Suite',
    description: 'Write automated test cases verifying cycle rejection and completion locks.',
    priority: 'Medium',
    status: 'To Do',
    assignedTo: user1.id,
    dependencies: [task4.id], // Blocked because task4 is 'In Progress'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  taskStore.create(task1);
  taskStore.create(task2);
  taskStore.create(task3);
  taskStore.create(task4);
  taskStore.create(task5);
  taskStore.create(task6);
  taskStore.create(task7);

  isSeeded = true;
  console.log(`🌱 Initialized demo dataset with ${userStore.count()} users and ${taskStore.count()} tasks.`);
}
