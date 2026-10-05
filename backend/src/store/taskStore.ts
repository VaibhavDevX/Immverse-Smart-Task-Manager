import { Task } from '../types/index.js';

class TaskStore {
  private tasks: Map<string, Task> = new Map();

  public getAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  public getById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  public create(task: Task): Task {
    this.tasks.set(task.id, task);
    return task;
  }

  public update(id: string, updatedFields: Partial<Task>): Task | undefined {
    const existing = this.tasks.get(id);
    if (!existing) return undefined;

    const updatedTask: Task = {
      ...existing,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    };

    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  public delete(id: string): boolean {
    const deleted = this.tasks.delete(id);
    if (deleted) {
      // Clean up references: remove deleted task ID from dependencies of all other tasks
      for (const task of this.tasks.values()) {
        if (task.dependencies.includes(id)) {
          task.dependencies = task.dependencies.filter((depId) => depId !== id);
          task.updatedAt = new Date().toISOString();
        }
      }
    }
    return deleted;
  }

  public clear(): void {
    this.tasks.clear();
  }

  public count(): number {
    return this.tasks.size;
  }
}

export const taskStore = new TaskStore();
