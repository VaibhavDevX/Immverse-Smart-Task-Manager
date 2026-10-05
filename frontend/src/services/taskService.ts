import { apiClient } from './api';
import { Task, CreateTaskDTO, UpdateTaskDTO, TaskQueryFilters, ApiResponse } from '../types';

export const taskService = {
  async getTasks(filters?: TaskQueryFilters): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks', { params: filters });
    return response.data.data || [];
  },

  async getMyTasks(): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks/my');
    return response.data.data || [];
  },

  async getBlockedTasks(): Promise<Task[]> {
    const response = await apiClient.get<ApiResponse<Task[]>>('/tasks/blocked');
    return response.data.data || [];
  },

  async getTaskById(id: string): Promise<Task> {
    const response = await apiClient.get<ApiResponse<Task>>(`/tasks/${id}`);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Task not found');
    }
    return response.data.data;
  },

  async createTask(dto: CreateTaskDTO): Promise<Task> {
    const response = await apiClient.post<ApiResponse<Task>>('/tasks', dto);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to create task');
    }
    return response.data.data;
  },

  async updateTask(id: string, dto: UpdateTaskDTO): Promise<Task> {
    const response = await apiClient.put<ApiResponse<Task>>(`/tasks/${id}`, dto);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to update task');
    }
    return response.data.data;
  },

  async completeTask(id: string): Promise<Task> {
    const response = await apiClient.patch<ApiResponse<Task>>(`/tasks/${id}/complete`);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to complete task');
    }
    return response.data.data;
  },

  async deleteTask(id: string): Promise<void> {
    await apiClient.delete<ApiResponse>(`/tasks/${id}`);
  },
};
