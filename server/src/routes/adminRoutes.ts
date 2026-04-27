import express from 'express';
import { getStats, getDoctors, addDoctor, updateDoctor, deleteDoctor, getSchedules, addSchedule, deleteSchedule, getPatients, getAllAppointments, cancelAppointment } from '../controllers/adminController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

// All admin routes are protected
router.use(authenticateToken);
router.use(authorizeRoles('admin'));

router.get('/stats', getStats);
router.get('/doctors', getDoctors);
router.post('/doctors', addDoctor);
router.put('/doctors/:id', updateDoctor);
router.delete('/doctors/:id', deleteDoctor);

router.get('/schedules', getSchedules);
router.post('/schedules', addSchedule);
router.delete('/schedules/:id', deleteSchedule);

router.get('/patients', getPatients);
router.get('/appointments', getAllAppointments);
router.delete('/appointments/:id', cancelAppointment);

export default router;
