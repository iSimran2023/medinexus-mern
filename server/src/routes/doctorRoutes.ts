import express from 'express';
import { getDoctorStats, getMySessions, getMyUpcomingAppointments, cancelAppointment, getMyPatients, markAppointmentReviewed, updateServingToken, markAttendance } from '../controllers/doctorController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('doctor'));

router.get('/stats', getDoctorStats);
router.get('/sessions', getMySessions);
router.get('/appointments', getMyUpcomingAppointments);
router.delete('/appointments/:id', cancelAppointment);
router.get('/patients', getMyPatients);
router.put('/appointments/:id/review', markAppointmentReviewed);
router.put('/appointments/:id/attendance', markAttendance);
router.put('/sessions/serving-token', updateServingToken);

export default router;
