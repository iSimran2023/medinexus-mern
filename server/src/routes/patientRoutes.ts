import express from 'express';
import { getPatientStats, getMyBookings, bookAppointment } from '../controllers/patientController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('patient'));

router.get('/stats', getPatientStats);
router.get('/bookings', getMyBookings);
router.post('/book', bookAppointment);

export default router;
