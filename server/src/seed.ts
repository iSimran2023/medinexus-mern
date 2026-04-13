import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from './models/User';

dotenv.config();

const seedAdmin = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/medinexus';
    await mongoose.connect(MONGODB_URI);

    const adminExists = await User.findOne({ email: 'admin@medinexus.com' });
    if (adminExists) {
      console.log('Admin already exists');
      process.exit();
    }

    await User.create({
      email: 'admin@medinexus.com',
      password: '123',
      role: 'admin',
      name: 'System Admin',
    });

    console.log('Admin user seeded successfully');
    process.exit();
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

seedAdmin();
