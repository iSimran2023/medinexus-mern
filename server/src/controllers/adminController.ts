import { Request, Response } from 'express';
import User from '../models/User';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import Appointment from '../models/Appointment';
import Schedule from '../models/Schedule';
import { flattenAppointment, flattenDoctor, flattenPatient, flattenSchedule } from '../utils/dataFlatteners';

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
    res.json(doctors.map(flattenDoctor));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

export const addDoctor = async (req: Request, res: Response) => {
  try {
    const { name, email, password, tel, specialty, gender } = req.body;

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
      tel,
      specialty,
      gender,
    });

    const populated = await newDoctor.populate('user', 'name email');
    res.status(201).json(flattenDoctor(populated));
  } catch (err) {
    res.status(500).json({ message: 'Error adding doctor' });
  }
};

export const updateDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, email, tel, specialty, gender } = req.body;

    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Update User details
    await User.findByIdAndUpdate(doctor.user, { name, email });

    // Update Doctor details
    const updatedDoctor = await Doctor.findByIdAndUpdate(
      id,
      { tel, specialty, gender },
      { new: true }
    ).populate('user', 'name email');

    res.json(flattenDoctor(updatedDoctor));
  } catch (err) {
    res.status(500).json({ message: 'Error updating doctor' });
  }
};

export const deleteDoctor = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const doctor = await Doctor.findById(id);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    await User.findByIdAndDelete(doctor.user);
    await Doctor.findByIdAndDelete(id);

    res.json({ message: 'Doctor deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting doctor' });
  }
};

export const getSchedules = async (req: Request, res: Response) => {
  try {
    const schedules = await Schedule.find().populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });
    res.json(schedules.map(flattenSchedule));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching schedules' });
  }
};

export const addSchedule = async (req: Request, res: Response) => {
  try {
    const { title, docid, date, time, nop } = req.body;
    const newSchedule = await Schedule.create({
      title,
      doctor: docid,
      date,
      time,
      maxAppointments: nop,
    });
    const populated = await newSchedule.populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });
    res.status(201).json(flattenSchedule(populated));
  } catch (err) {
    res.status(500).json({ message: 'Error adding schedule' });
  }
};

export const deleteSchedule = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Schedule.findByIdAndDelete(id);
    res.json({ message: 'Schedule deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting schedule' });
  }
};

export const getPatients = async (req: Request, res: Response) => {
  try {
    const patients = await Patient.find().populate('user', 'name email');
    res.json(patients.map(flattenPatient));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
};

export const getAllAppointments = async (req: Request, res: Response) => {
  try {
    const appointments = await Appointment.find()
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name' }
      })
      .populate({
        path: 'schedule',
        populate: { path: 'doctor', populate: { path: 'user', select: 'name' } }
      })
      .sort({ createdAt: -1 });
    res.json(appointments.map(flattenAppointment));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};
export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Appointment deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error deleting appointment' });
  }
};
