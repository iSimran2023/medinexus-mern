import express from 'express';
import { getStats, getDoctors, addDoctor, deleteDoctor, getSchedules, addSchedule, deleteSchedule, getPatients, getAllAppointments } from '../controllers/adminController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// All admin routes are protected
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);
router.delete('/doctors/:id', deleteDoctor);

router.get('/schedules', getSchedules);
router.post('/schedules', addSchedule);
router.delete('/schedules/:id', deleteSchedule);

router.get('/patients', getPatients);
router.get('/appointments', getAllAppointments);

export default router;
