import express from 'express';
import { getPatientStats, getMyBookings, bookAppointment, getSessions, getAllDoctors } from '../controllers/patientController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('patient'));

router.get('/stats', getPatientStats);
router.get('/bookings', getMyBookings);
router.get('/sessions', getSessions);
router.get('/doctors', getAllDoctors);
router.post('/book', bookAppointment);

export default router;
