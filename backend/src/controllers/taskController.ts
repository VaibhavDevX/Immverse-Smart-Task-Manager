import { Request, Response, NextFunction } from 'express';
import { taskService } from '../services/taskService.js';
import { ApiResponse, Priority, Status } from '../types/index.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getTasks(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const { priority, status, assignedTo, search, isBlocked } = req.query;

    const filters = {
      priority: priority as Priority | undefined,
      status: status as Status | undefined,
      assignedTo: assignedTo as string | undefined,
      search: search as string | undefined,
      isBlocked: isBlocked !== undefined ? isBlocked === 'true' : undefined,
    };

    const tasks = taskService.getTasks(filters);
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getMyTasks(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const userId = (req.headers['x-user-id'] || req.query.userId) as string;
    if (!userId) {
      throw new AppError('User ID header (x-user-id) or query parameter (userId) is required', 400, 'MISSING_USER_ID');
    }

    const tasks = taskService.getMyTasks(userId);
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getBlockedTasks(
  _req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const tasks = taskService.getBlockedTasks();
    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
}

export async function getTaskById(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;
    const task = taskService.getTaskById(id);
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

export async function createTask(
  req: Request,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const task = taskService.createTask(req.body);
    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

export async function updateTask(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;
    const task = taskService.updateTask(id, req.body);
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

export async function completeTask(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;
    const task = taskService.completeTask(id);
    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteTask(
  req: Request<{ id: string }>,
  res: Response<ApiResponse>,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id;
    taskService.deleteTask(id);
    res.status(200).json({
      success: true,
      data: { message: `Task '${id}' successfully deleted` },
    });
  } catch (error) {
    next(error);
  }
}
