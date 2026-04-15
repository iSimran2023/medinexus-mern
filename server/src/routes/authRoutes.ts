import express from 'express';
import { login, registerPatient, checkAuth, updateProfile } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/login', login);
router.post('/register', registerPatient);
router.get('/check', authenticateToken, checkAuth);
router.put('/profile', authenticateToken, updateProfile);

export default router;
