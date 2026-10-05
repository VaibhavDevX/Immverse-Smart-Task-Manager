import { Task } from '../types/index.js';

export interface CircularDependencyCheckResult {
  hasCycle: boolean;
  cyclePath?: string[];
}

/**
  Checks if a task directly or indirectly depends on itself.
 */
export function isSelfDependency(taskId: string, dependencies: string[]): boolean {
  return dependencies.includes(taskId);
}

/**
  Uses Depth-First Search (DFS) to detect if setting `proposedDependencies` for `taskId`
  would create a circular dependency cycle in the task graph.
 
  Edge definition: Task X -> Task Y means Task X depends on Task Y.
  If we start at any task in `proposedDependencies` and can reach `taskId`, a cycle exists.
 */
export function detectCircularDependency(
  taskId: string,
  proposedDependencies: string[],
  allTasksMap: Map<string, Task>
): CircularDependencyCheckResult {
  const visited = new Set<string>();

  for (const depId of proposedDependencies) {
    const path: string[] = [taskId];
    if (dfs(depId, taskId, allTasksMap, visited, path)) {
      return {
        hasCycle: true,
        cyclePath: path,
      };
    }
  }

  return { hasCycle: false };
}

function dfs(
  currentId: string,
  targetId: string,
  allTasksMap: Map<string, Task>,
  visited: Set<string>,
  path: string[]
): boolean {
  path.push(currentId);

  if (currentId === targetId) {
    return true;
  }

  if (visited.has(currentId)) {
    path.pop();
    return false;
  }

  visited.add(currentId);

  const currentTask = allTasksMap.get(currentId);
  if (currentTask && currentTask.dependencies && currentTask.dependencies.length > 0) {
    for (const nextDepId of currentTask.dependencies) {
      if (dfs(nextDepId, targetId, allTasksMap, visited, path)) {
        return true;
      }
    }
  }

  path.pop();
  return false;
}

/**
  Returns list of dependencies that are incomplete (not 'Done') or missing.
 */
export function getIncompleteDependencies(
  dependencies: string[],
  allTasksMap: Map<string, Task>
): { missing: string[]; incomplete: Task[] } {
  const missing: string[] = [];
  const incomplete: Task[] = [];

  for (const depId of dependencies) {
    const depTask = allTasksMap.get(depId);
    if (!depTask) {
      missing.push(depId);
    } else if (depTask.status !== 'Done') {
      incomplete.push(depTask);
    }
  }

  return { missing, incomplete };
}

/**
  Returns list of completed tasks that depend on the given `taskId`.
  Used when trying to revert a 'Done' task back to 'To Do' or 'In Progress'.
 */
export function getCompletedDependents(
  taskId: string,
  allTasksMap: Map<string, Task>
): Task[] {
  const completedDependents: Task[] = [];

  for (const task of allTasksMap.values()) {
    if (task.status === 'Done' && task.dependencies.includes(taskId)) {
      completedDependents.push(task);
    }
  }

  return completedDependents;
}

/**
  Checks if a task is currently blocked.
  A task is blocked if it is not 'Done' AND has at least one incomplete/missing dependency.
 */
export function isTaskBlocked(task: Task, allTasksMap: Map<string, Task>): boolean {
  if (task.status === 'Done') return false;
  if (!task.dependencies || task.dependencies.length === 0) return false;

  const { missing, incomplete } = getIncompleteDependencies(task.dependencies, allTasksMap);
  return missing.length > 0 || incomplete.length > 0;
}
