import express from 'express';
import { getStats, getDoctors, addDoctor } from '../controllers/adminController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// All admin routes are protected
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);

export default router;
