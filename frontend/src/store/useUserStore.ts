import { create } from 'zustand';
import { User, CreateUserDTO } from '../types';
import { userService } from '../services/userService';

interface UserState {
  currentUser: User | null;
  users: User[];
  isLoading: boolean;
  error: string | null;

  fetchUsers: () => Promise<void>;
  login: (identifier: string) => Promise<User>;
  logout: () => void;
  selectUser: (user: User) => void;
  createUser: (dto: CreateUserDTO) => Promise<User>;
  clearError: () => void;
  initAuth: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  currentUser: null,
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const users = await userService.getUsers();
      set({ users, isLoading: false });

      // If active user is selected, refresh details
      const activeId = typeof window !== 'undefined' ? localStorage.getItem('immverse_active_user_id') : null;
      if (activeId && users.length > 0) {
        const found = users.find((u) => u.id === activeId);
        if (found) {
          set({ currentUser: found });
        } else if (!get().currentUser) {
          set({ currentUser: users[0] });
          localStorage.setItem('immverse_active_user_id', users[0].id);
        }
      } else if (users.length > 0 && !get().currentUser) {
        set({ currentUser: users[0] });
        if (typeof window !== 'undefined') {
          localStorage.setItem('immverse_active_user_id', users[0].id);
        }
      }
    } catch (err: any) {
      set({ error: err.message || 'Failed to load users', isLoading: false });
    }
  },

  initAuth: async () => {
    await get().fetchUsers();
  },

  login: async (identifier: string) => {
    set({ isLoading: true, error: null });
    try {
      const user = await userService.loginUser(identifier);
      set({ currentUser: user, isLoading: false });
      if (typeof window !== 'undefined') {
        localStorage.setItem('immverse_active_user_id', user.id);
      }
      return user;
    } catch (err: any) {
      set({ error: err.message || 'Login failed', isLoading: false });
      throw err;
    }
  },

  selectUser: (user: User) => {
    set({ currentUser: user });
    if (typeof window !== 'undefined') {
      localStorage.setItem('immverse_active_user_id', user.id);
    }
  },

  logout: () => {
    set({ currentUser: null });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('immverse_active_user_id');
    }
  },

  createUser: async (dto: CreateUserDTO) => {
    set({ isLoading: true, error: null });
    try {
      const newUser = await userService.createUser(dto);
      const updatedUsers = [...get().users, newUser];
      set({
        users: updatedUsers,
        currentUser: newUser,
        isLoading: false,
      });
      if (typeof window !== 'undefined') {
        localStorage.setItem('immverse_active_user_id', newUser.id);
      }
      return newUser;
    } catch (err: any) {
      set({ error: err.message || 'Failed to create user', isLoading: false });
      throw err;
    }
  },

  clearError: () => set({ error: null }),
}));
