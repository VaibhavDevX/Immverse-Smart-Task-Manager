import { create } from 'zustand';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskQueryFilters } from '../types';
import { taskService } from '../services/taskService';

interface TaskState {
  tasks: Task[];
  myTasks: Task[];
  blockedTasks: Task[];
  filters: TaskQueryFilters;
  isLoading: boolean;
  error: string | null;
  toast: { message: string; type: 'success' | 'error' } | null;

  fetchTasks: (filters?: TaskQueryFilters) => Promise<void>;
  fetchMyTasks: () => Promise<void>;
  fetchBlockedTasks: () => Promise<void>;
  refreshAll: () => Promise<void>;
  
  createTask: (dto: CreateTaskDTO) => Promise<Task>;
  updateTask: (id: string, dto: UpdateTaskDTO) => Promise<Task>;
  completeTask: (id: string) => Promise<Task>;
  deleteTask: (id: string) => Promise<void>;

  setFilters: (newFilters: Partial<TaskQueryFilters>) => void;
  resetFilters: () => void;
  clearError: () => void;
  showToast: (message: string, type: 'success' | 'error') => void;
  hideToast: () => void;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  myTasks: [],
  blockedTasks: [],
  filters: {},
  isLoading: false,
  error: null,
  toast: null,

  fetchTasks: async (filters?: TaskQueryFilters) => {
    set({ isLoading: true, error: null });
    try {
      const activeFilters = filters !== undefined ? filters : get().filters;
      const tasks = await taskService.getTasks(activeFilters);
      set({ tasks, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch tasks', isLoading: false });
    }
  },

  fetchMyTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const myTasks = await taskService.getMyTasks();
      set({ myTasks, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch my tasks', isLoading: false });
    }
  },

  fetchBlockedTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      const blockedTasks = await taskService.getBlockedTasks();
      set({ blockedTasks, isLoading: false });
    } catch (err: any) {
      set({ error: err.message || 'Failed to fetch blocked tasks', isLoading: false });
    }
  },

  refreshAll: async () => {
    await Promise.all([
      get().fetchTasks(),
      get().fetchMyTasks().catch(() => {}),
      get().fetchBlockedTasks().catch(() => {}),
    ]);
  },

  createTask: async (dto: CreateTaskDTO) => {
    set({ isLoading: true, error: null });
    try {
      const newTask = await taskService.createTask(dto);
      get().showToast(`Task '${newTask.title}' created successfully!`, 'success');
      await get().refreshAll();
      return newTask;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create task', isLoading: false });
      get().showToast(err.message || 'Failed to create task', 'error');
      throw err;
    }
  },

  updateTask: async (id: string, dto: UpdateTaskDTO) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTask = await taskService.updateTask(id, dto);
      get().showToast(`Task '${updatedTask.title}' updated successfully!`, 'success');
      await get().refreshAll();
      return updatedTask;
    } catch (err: any) {
      set({ error: err.message || 'Failed to update task', isLoading: false });
      get().showToast(err.message || 'Failed to update task', 'error');
      throw err;
    }
  },

  completeTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const completedTask = await taskService.completeTask(id);
      get().showToast(`Task '${completedTask.title}' completed! 🎉`, 'success');
      await get().refreshAll();
      return completedTask;
    } catch (err: any) {
      set({ error: err.message || 'Failed to complete task', isLoading: false });
      get().showToast(err.message || 'Failed to complete task', 'error');
      throw err;
    }
  },

  deleteTask: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await taskService.deleteTask(id);
      get().showToast('Task deleted successfully', 'success');
      await get().refreshAll();
    } catch (err: any) {
      set({ error: err.message || 'Failed to delete task', isLoading: false });
      get().showToast(err.message || 'Failed to delete task', 'error');
      throw err;
    }
  },

  setFilters: (newFilters: Partial<TaskQueryFilters>) => {
    const updatedFilters = { ...get().filters, ...newFilters };
    set({ filters: updatedFilters });
    get().fetchTasks(updatedFilters);
  },

  resetFilters: () => {
    set({ filters: {} });
    get().fetchTasks({});
  },

  clearError: () => set({ error: null }),

  showToast: (message: string, type: 'success' | 'error') => {
    set({ toast: { message, type } });
    setTimeout(() => {
      set({ toast: null });
    }, 4500);
  },

  hideToast: () => set({ toast: null }),
}));
