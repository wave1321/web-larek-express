import { Router } from 'express';
import postOrder from '../controllers/order';

const router = Router();

router.post('/', postOrder);

export default router;
