import { Router } from 'express';
import {
  getTasks,
  getMyTasks,
  getBlockedTasks,
  getTaskById,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from '../controllers/taskController.js';

const router = Router();

router.get('/my', getMyTasks);
router.get('/blocked', getBlockedTasks);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', createTask);
router.put('/:id', updateTask);
router.patch('/:id/complete', completeTask);
router.delete('/:id', deleteTask);

export default router;
