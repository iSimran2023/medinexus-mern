import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import Patient from '../models/Patient';
import Doctor from '../models/Doctor';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user || !(await (user as any).comparePassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, name: user.name, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

export const registerPatient = async (req: Request, res: Response) => {
  try {
    const { email, password, name, address, nic, dob, tel } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = await User.create({
      email,
      password,
      role: 'patient',
      name,
    });

    await Patient.create({
      user: newUser._id,
      address,
      nic,
      dob,
      tel,
    });

    res.status(201).json({ message: 'Patient registered successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};
