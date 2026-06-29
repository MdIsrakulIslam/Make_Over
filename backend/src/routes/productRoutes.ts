import { Router } from 'express';
import { getProducts, getProductById, createProduct, deleteProduct, updateProduct, createProductReview, getAllReviews } from '../controllers/productController';

const router = Router();

router.get('/', getProducts);
router.get('/reviews', getAllReviews); // MUST BE BEFORE /:id to avoid matching id="reviews"
router.get('/:id', getProductById);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.delete('/:id', deleteProduct);
router.post('/:id/reviews', createProductReview);

export default router;
