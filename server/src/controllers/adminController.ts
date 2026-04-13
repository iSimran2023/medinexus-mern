import { Request, Response } from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import Schedule from '../models/Schedule';

export const getStats = async (req: Request, res: Response) => {
  try {
    const doctorCount = await Doctor.countDocuments();
    const patientCount = await Patient.countDocuments();
    const appointmentCount = await Appointment.countDocuments();
    const scheduleCount = await Schedule.countDocuments();

    res.json({
      doctors: doctorCount,
      patients: patientCount,
      appointments: appointmentCount,
      sessions: scheduleCount,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

export const getDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email');
    res.json(doctors);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

export const addDoctor = async (req: Request, res: Response) => {
  try {
    const { name, email, password, nic, tel, specialty } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role: 'doctor',
    });

    const newDoctor = await Doctor.create({
      user: newUser._id,
      nic,
      tel,
      specialty,
    });

    res.status(201).json(newDoctor);
  } catch (err) {
    res.status(500).json({ message: 'Error adding doctor' });
  }
};
