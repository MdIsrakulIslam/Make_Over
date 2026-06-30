import { Router } from 'express';
import { getWishlist, addToWishlist, removeFromWishlist } from '../controllers/wishlistController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

router.route('/')
  .get(protect, getWishlist)
  .post(protect, addToWishlist);

router.route('/:productId')
  .delete(protect, removeFromWishlist);

export default router;
