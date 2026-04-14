import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';

export const getPatientStats = async (req: Request, res: Response) => {
  try {
    const doctorCount = await Doctor.countDocuments();
    const patientCount = await Patient.countDocuments();
    const appointmentCount = await Appointment.countDocuments({
      date: { $gte: new Date() }
    });
    const todaySessions = await Schedule.countDocuments({
      date: { 
        $gte: new Date(new Date().setHours(0,0,0,0)), 
        $lt: new Date(new Date().setHours(23,59,59,999)) 
      }
    });

    res.json({
      doctors: doctorCount,
      patients: patientCount,
      appointments: appointmentCount,
      sessions: todaySessions,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patient stats' });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const patient = await Patient.findOne({ user: userId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const bookings = await Appointment.find({ patient: patient._id })
      .populate({
        path: 'schedule',
        populate: { path: 'doctor', populate: { path: 'user', select: 'name' } }
      })
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.body;
    const userId = req.user.id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    // Calculate appointment number
    const bookingCount = await Appointment.countDocuments({ schedule: scheduleId });
    if (bookingCount >= schedule.maxAppointments) {
      return res.status(400).json({ message: 'Session is full' });
    }

    const newAppointment = await Appointment.create({
      patient: patient._id,
      schedule: scheduleId,
      appointmentNumber: bookingCount + 1,
    });

    res.status(201).json(newAppointment);
  } catch (err) {
    res.status(500).json({ message: 'Error booking appointment' });
  }
};
