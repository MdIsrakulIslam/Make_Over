import { Router } from 'express';
import { getDashboardAnalytics } from '../controllers/analyticsController';
import { protect } from '../middleware/authMiddleware';

const router = Router();

// We might want to protect this route later with 'protect' and 'admin' middleware
router.get('/dashboard', protect, getDashboardAnalytics);

export default router;
