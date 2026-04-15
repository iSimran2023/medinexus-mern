import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import patientRoutes from './routes/patientRoutes';
import doctorRoutes from './routes/doctorRoutes';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

app.get('/', (req, res) => {
  res.send('MediNexus API is running...');
});

// Database Connection
const MONGODB_URI = process.env.MONGODB_URI;

if (process.env.NODE_ENV !== 'production') {
  mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/medinexus')
    .then(() => {
      console.log('Connected to MongoDB');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err);
    });
} else {
  // On Vercel, we connect to DB but don't app.listen (handled by Vercel)
  mongoose.connect(MONGODB_URI as string)
    .catch(err => console.error('DB Error:', err));
}

export default app;

