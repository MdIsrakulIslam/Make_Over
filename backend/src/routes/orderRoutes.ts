import { Router } from 'express';
import { trackOrder } from '../controllers/orderController';

const router = Router();

router.post('/track', trackOrder);

export default router;
