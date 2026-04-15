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

// Database Connection variable
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware to ensure DB is connected before any API call
app.use(async (req, res, next) => {
  // If we are hitting an API route, ensure DB is up
  if (req.path.startsWith('/api')) {
    if (mongoose.connection.readyState !== 1) {
      if (!MONGODB_URI) {
        return res.status(500).json({ error: 'MONGODB_URI is not defined in environment variables' });
      }
      try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB via Middleware');
        next();
      } catch (err) {
        console.error('Database connection failed:', err);
        return res.status(500).json({ error: 'Database connection failed' });
      }
    } else {
      next();
    }
  } else {
    next();
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/doctor', doctorRoutes);

app.get('/', (req, res) => {
  res.send('MediNexus API is running...');
});

// Local Server Start (Only if not on Vercel)
if (process.env.NODE_ENV !== 'production') {
  mongoose.connect(MONGODB_URI || 'mongodb://localhost:27017/medinexus')
    .then(() => {
      console.log('Connected to MongoDB (Local)');
      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    })
    .catch((err) => {
      console.error('Local MongoDB connection error:', err);
    });
}

export default app;
