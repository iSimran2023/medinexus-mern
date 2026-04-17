import express from 'express';
import { getPatientStats, getMyBookings, bookAppointment, getSessions, getAllDoctors } from '../controllers/patientController';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import { upload } from '../utils/upload';

const router = express.Router();

router.use(authenticateToken);
router.use(authorizeRoles('patient'));

router.get('/stats', getPatientStats);
router.get('/bookings', getMyBookings);
router.get('/sessions', getSessions);
router.get('/doctors', getAllDoctors);
router.post('/book', bookAppointment);

router.post('/upload', upload.single('document'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  res.json({ filename: req.file.filename });
});

export default router;
