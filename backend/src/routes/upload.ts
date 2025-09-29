import { Router } from 'express';
import { uploadFile } from '../controllers/upload';
import fileMiddleware from '../middlewares/file';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.post('/', authenticateToken, fileMiddleware.single('file'), uploadFile);

export default router;
