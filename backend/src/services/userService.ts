import { v4 as uuidv4 } from 'uuid';
import { User, CreateUserDTO } from '../types/index.js';
import { userStore } from '../store/userStore.js';
import { AppError } from '../middleware/errorHandler.js';

export class UserService {
  public createUser(dto: CreateUserDTO): User {
    if (!dto.name || dto.name.trim().length === 0) {
      throw new AppError('Name is required', 400, 'INVALID_NAME');
    }

    if (!dto.email || dto.email.trim().length === 0) {
      throw new AppError('Email is required', 400, 'INVALID_EMAIL');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(dto.email.trim())) {
      throw new AppError('Invalid email format', 400, 'INVALID_EMAIL_FORMAT');
    }

    const existingUser = userStore.getByEmail(dto.email);
    if (existingUser) {
      throw new AppError('A user with this email already exists', 409, 'DUPLICATE_EMAIL');
    }

    const newUser: User = {
      id: uuidv4(),
      name: dto.name.trim(),
      email: dto.email.trim().toLowerCase(),
      avatar: dto.avatar?.trim() || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dto.name.trim())}`,
      createdAt: new Date().toISOString(),
    };

    return userStore.create(newUser);
  }

  public getAllUsers(): User[] {
    return userStore.getAll();
  }

  public getUserById(id: string): User {
    const user = userStore.getById(id);
    if (!user) {
      throw new AppError(`User with ID '${id}' not found`, 404, 'USER_NOT_FOUND');
    }
    return user;
  }

  public loginUser(identifier: string): User {
    if (!identifier || identifier.trim().length === 0) {
      throw new AppError('Email or User ID is required to login', 400, 'INVALID_IDENTIFIER');
    }

    const trimmed = identifier.trim();

    // First try lookup by ID
    let user = userStore.getById(trimmed);

    // Then try lookup by Email
    if (!user) {
      user = userStore.getByEmail(trimmed);
    }

    if (!user) {
      throw new AppError(`No user found matching '${trimmed}'`, 404, 'USER_NOT_FOUND');
    }

    return user;
  }
}

export const userService = new UserService();
