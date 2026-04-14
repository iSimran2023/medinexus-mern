import express from 'express';
import { getStats, getDoctors, addDoctor, deleteDoctor } from '../controllers/adminController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// All admin routes are protected
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);
router.delete('/doctors/:id', deleteDoctor);

export default router;
