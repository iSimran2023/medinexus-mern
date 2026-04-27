import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config();

import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import patientRoutes from './routes/patientRoutes';
import doctorRoutes from './routes/doctorRoutes';
import { startAttendanceCronJob } from './jobs/attendanceJob';

startAttendanceCronJob();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve uploads statically - ESSENTIAL for viewing receipts/documents
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Database Connection Logic with Middleware for Vercel/Serverless support
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medinexus';

// Middleware to ensure DB is connected before any API call (Good for serverless)
app.use(async (req, res, next) => {
  if (req.path.startsWith('/api')) {
    if (mongoose.connection.readyState !== 1) {
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

// Root endpoint
app.get('/', (req, res) => {
  res.send('MediNexus API is running...');
});

// Catch-all for 404s
app.use((req, res) => {
  console.log(`404 - Not Found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: `Route ${req.originalUrl} not found on this server.` });
});

// Start the server for local development
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  
  // Initial connection
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ Initial MongoDB connection successful'))
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      console.error('Action Required: Whitelist your IP in MongoDB Atlas dashboard.');
    });
}

export default app;
