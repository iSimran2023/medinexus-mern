import express from 'express';
import { 
  getPatientStats, 
  getMyBookings, 
  bookAppointment, 
  getSessions, 
  getAllDoctors, 
  getPatientProfile,
  getBookingStep1,
  getBookingStep2,
  getBookingStep3,
  cancelAppointmentPatient,
  rescheduleAppointment,
  getAppointmentDetails
} from '../controllers/patientController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('patient'));

router.get('/stats', getPatientStats);
router.get('/profile', getPatientProfile);
router.get('/bookings', getMyBookings);
router.get('/sessions', getSessions);
router.get('/doctors', getAllDoctors);
router.post('/book', bookAppointment);
router.put('/appointments/:id/cancel', cancelAppointmentPatient);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.get('/appointments/:id', getAppointmentDetails);

// Stepper Specific APIs
router.get('/booking/step1', getBookingStep1);
router.get('/booking/step2', getBookingStep2);
router.get('/booking/step3/:scheduleId', getBookingStep3);

router.post('/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename });
});

export default router;
