import { Router } from 'express';
import {
  deleteProduct, getProducts, postProducts, updateProduct,
} from '../controllers/product';
import { validateProduct } from '../middlewares/validation';
import { authenticateToken } from '../middlewares/auth';

const router = Router();

router.get('/', getProducts);
router.post('/', authenticateToken, validateProduct, postProducts);
router.patch('/:productId', authenticateToken, updateProduct);
router.delete('/:productId', authenticateToken, deleteProduct);

export default router;
