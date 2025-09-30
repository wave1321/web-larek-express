import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  logout,
  refreshAccessToken,
} from '../controllers/auth';
import { authenticateToken } from '../middlewares/auth';
import { validateRegister, validateLogin } from '../middlewares/validation';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/token', refreshAccessToken);
router.get('/logout', logout);
router.get('/user', authenticateToken, getCurrentUser);

export default router;
