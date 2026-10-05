import { v4 as uuidv4 } from 'uuid';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskQueryFilters } from '../types/index.js';
import { taskStore } from '../store/taskStore.js';
import { userStore } from '../store/userStore.js';
import { AppError } from '../middleware/errorHandler.js';
import {
  isSelfDependency,
  detectCircularDependency,
  getIncompleteDependencies,
  getCompletedDependents,
  isTaskBlocked,
} from '../utils/dependencyGraph.js';

export class TaskService {
  public createTask(dto: CreateTaskDTO): Task {
    if (!dto.title || dto.title.trim().length === 0) {
      throw new AppError('Task title is required', 400, 'INVALID_TITLE');
    }

    if (!dto.assignedTo || dto.assignedTo.trim().length === 0) {
      throw new AppError('Assigned user ID is required', 400, 'INVALID_ASSIGNED_USER');
    }

    const assignedUser = userStore.getById(dto.assignedTo);
    if (!assignedUser) {
      throw new AppError(`Assigned user with ID '${dto.assignedTo}' does not exist`, 400, 'USER_NOT_FOUND');
    }

    const priority = dto.priority || 'Medium';
    const status = dto.status || 'To Do';
    const rawDependencies = dto.dependencies || [];

    // Deduplicate dependencies
    const dependencies = Array.from(new Set(rawDependencies));

    // Validate dependency existence
    const allTasksMap = new Map(taskStore.getAll().map((t) => [t.id, t]));
    const { missing, incomplete } = getIncompleteDependencies(dependencies, allTasksMap);

    if (missing.length > 0) {
      throw new AppError(
        `Cannot create task. The following dependency task IDs do not exist: [${missing.join(', ')}]`,
        400,
        'INVALID_DEPENDENCY'
      );
    }

    // Completion Lock: If initial status is 'Done', all dependencies must be 'Done'
    if (status === 'Done' && incomplete.length > 0) {
      const titles = incomplete.map((t) => `'${t.title}' (${t.status})`).join(', ');
      throw new AppError(
        `Cannot create task as 'Done' because the following dependency task(s) are incomplete: ${titles}`,
        400,
        'INCOMPLETE_DEPENDENCIES'
      );
    }

    const newTask: Task = {
      id: uuidv4(),
      title: dto.title.trim(),
      description: dto.description?.trim() || '',
      priority,
      status,
      assignedTo: dto.assignedTo,
      dependencies,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return taskStore.create(newTask);
  }

  public getTasks(filters?: TaskQueryFilters): (Task & { isBlocked: boolean })[] {
    let tasks = taskStore.getAll();
    const allTasksMap = new Map(tasks.map((t) => [t.id, t]));

    if (filters) {
      if (filters.priority) {
        tasks = tasks.filter((t) => t.priority === filters.priority);
      }
      if (filters.status) {
        tasks = tasks.filter((t) => t.status === filters.status);
      }
      if (filters.assignedTo) {
        tasks = tasks.filter((t) => t.assignedTo === filters.assignedTo);
      }
      if (filters.search && filters.search.trim().length > 0) {
        const query = filters.search.toLowerCase().trim();
        tasks = tasks.filter(
          (t) => t.title.toLowerCase().includes(query) || t.description.toLowerCase().includes(query)
        );
      }
      if (filters.isBlocked !== undefined) {
        tasks = tasks.filter((t) => isTaskBlocked(t, allTasksMap) === filters.isBlocked);
      }
    }

    return tasks.map((task) => ({
      ...task,
      isBlocked: isTaskBlocked(task, allTasksMap),
    }));
  }

  public getTaskById(id: string): Task & { isBlocked: boolean } {
    const task = taskStore.getById(id);
    if (!task) {
      throw new AppError(`Task with ID '${id}' not found`, 404, 'TASK_NOT_FOUND');
    }
    const allTasksMap = new Map(taskStore.getAll().map((t) => [t.id, t]));
    return {
      ...task,
      isBlocked: isTaskBlocked(task, allTasksMap),
    };
  }

  public getMyTasks(userId: string): (Task & { isBlocked: boolean })[] {
    const user = userStore.getById(userId);
    if (!user) {
      throw new AppError(`User with ID '${userId}' not found`, 404, 'USER_NOT_FOUND');
    }
    return this.getTasks({ assignedTo: userId });
  }

  public getBlockedTasks(): (Task & { isBlocked: boolean })[] {
    return this.getTasks({ isBlocked: true });
  }

  public updateTask(id: string, dto: UpdateTaskDTO): Task & { isBlocked: boolean } {
    const existingTask = taskStore.getById(id);
    if (!existingTask) {
      throw new AppError(`Task with ID '${id}' not found`, 404, 'TASK_NOT_FOUND');
    }

    if (dto.assignedTo) {
      const user = userStore.getById(dto.assignedTo);
      if (!user) {
        throw new AppError(`Assigned user with ID '${dto.assignedTo}' does not exist`, 400, 'USER_NOT_FOUND');
      }
    }

    const proposedDependencies =
      dto.dependencies !== undefined
        ? Array.from(new Set(dto.dependencies))
        : existingTask.dependencies;

    const proposedStatus = dto.status !== undefined ? dto.status : existingTask.status;

    // Rule 1: Self-dependency validation
    if (isSelfDependency(id, proposedDependencies)) {
      throw new AppError('A task cannot depend on itself', 400, 'SELF_DEPENDENCY');
    }

    const allTasksMap = new Map(taskStore.getAll().map((t) => [t.id, t]));

    // Rule 2: Validate all proposed dependencies exist
    const { missing, incomplete } = getIncompleteDependencies(proposedDependencies, allTasksMap);
    if (missing.length > 0) {
      throw new AppError(
        `The following dependency task IDs do not exist: [${missing.join(', ')}]`,
        400,
        'INVALID_DEPENDENCY'
      );
    }

    // Rule 3: DFS Circular Dependency Detection
    const cycleResult = detectCircularDependency(id, proposedDependencies, allTasksMap);
    if (cycleResult.hasCycle && cycleResult.cyclePath) {
      const pathTitles = cycleResult.cyclePath
        .map((taskId) => {
          const t = allTasksMap.get(taskId);
          return t ? `'${t.title}'` : taskId;
        })
        .join(' ➔ ');
      throw new AppError(
        `Circular dependency detected: ${pathTitles}`,
        400,
        'CIRCULAR_DEPENDENCY'
      );
    }

    // Rule 4: Completion Lock - Cannot transition to 'Done' if any dependencies are incomplete
    if (proposedStatus === 'Done' && existingTask.status !== 'Done' && incomplete.length > 0) {
      const titles = incomplete.map((t) => `'${t.title}' (${t.status})`).join(', ');
      throw new AppError(
        `Cannot mark task as Done because the following dependency task(s) are incomplete: ${titles}`,
        400,
        'INCOMPLETE_DEPENDENCIES'
      );
    }

    // Rule 5: Un-completion Protection - Cannot revert a 'Done' task to incomplete if dependent tasks are completed
    if (existingTask.status === 'Done' && proposedStatus !== 'Done') {
      const completedDependents = getCompletedDependents(id, allTasksMap);
      if (completedDependents.length > 0) {
        const titles = completedDependents.map((t) => `'${t.title}'`).join(', ');
        throw new AppError(
          `Cannot mark task as incomplete because dependent completed task(s) rely on it: ${titles}. Uncomplete dependent task(s) first.`,
          400,
          'DEPENDENT_TASKS_COMPLETED'
        );
      }
    }

    const updatedTask = taskStore.update(id, {
      title: dto.title !== undefined ? dto.title.trim() : existingTask.title,
      description: dto.description !== undefined ? dto.description.trim() : existingTask.description,
      priority: dto.priority || existingTask.priority,
      status: proposedStatus,
      assignedTo: dto.assignedTo || existingTask.assignedTo,
      dependencies: proposedDependencies,
    });

    if (!updatedTask) {
      throw new AppError(`Failed to update task '${id}'`, 500, 'UPDATE_FAILED');
    }

    const updatedTasksMap = new Map(taskStore.getAll().map((t) => [t.id, t]));
    return {
      ...updatedTask,
      isBlocked: isTaskBlocked(updatedTask, updatedTasksMap),
    };
  }

  public completeTask(id: string): Task & { isBlocked: boolean } {
    return this.updateTask(id, { status: 'Done' });
  }

  public deleteTask(id: string): void {
    const existing = taskStore.getById(id);
    if (!existing) {
      throw new AppError(`Task with ID '${id}' not found`, 404, 'TASK_NOT_FOUND');
    }
    taskStore.delete(id);
  }
}

export const taskService = new TaskService();
