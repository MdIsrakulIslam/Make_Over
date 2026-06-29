import express from 'express';
import { getCart, syncCart, addToCart, updateCartItem, removeFromCart } from '../controllers/cartController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

router.get('/', protect, getCart);
router.post('/sync', protect, syncCart);
router.post('/add', protect, addToCart);
router.put('/:productId', protect, updateCartItem);
router.delete('/:productId', protect, removeFromCart);

export default router;
