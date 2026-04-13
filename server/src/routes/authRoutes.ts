import express from 'express';
import { login, registerPatient } from '../controllers/authController';

const router = express.Router();

router.post('/login', login);
router.post('/register', registerPatient);

export default router;
