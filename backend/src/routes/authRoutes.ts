import { Router } from 'express';
import { loginUser } from '../controllers/userController.js';

const router = Router();

router.post('/login', loginUser);

export default router;
