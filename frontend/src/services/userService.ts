import { apiClient } from './api';
import { User, CreateUserDTO, ApiResponse } from '../types';

export const userService = {
  async getUsers(): Promise<User[]> {
    const response = await apiClient.get<ApiResponse<User[]>>('/users');
    return response.data.data || [];
  },

  async createUser(dto: CreateUserDTO): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/users', dto);
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to create user');
    }
    return response.data.data;
  },

  async loginUser(identifier: string): Promise<User> {
    const response = await apiClient.post<ApiResponse<User>>('/auth/login', { identifier });
    if (!response.data.data) {
      throw new Error(response.data.error || 'Failed to login user');
    }
    return response.data.data;
  },
};
