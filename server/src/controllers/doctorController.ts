import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';

export const getDoctorStats = async (req: Request, res: Response) => {
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
    res.status(500).json({ message: 'Error fetching doctor stats' });
  }
};

export const getMySessions = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const doctor = await Doctor.findOne({ user: userId });
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    const sessions = await Schedule.find({ doctor: doctor._id })
      .sort({ date: 1 });

    res.json(sessions);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};

export const getMyUpcomingAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const doctor = await Doctor.findOne({ user: userId });
    
    const appointments = await Appointment.find()
      .populate({
        path: 'schedule',
        match: { doctor: doctor?._id },
        populate: { path: 'doctor' }
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    // Filter out appointments where schedule was didn't match doctor
    const filtered = appointments.filter(app => app.schedule !== null);

    res.json(filtered);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

export const cancelAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Appointment.findByIdAndDelete(id);
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
};

export const getMyPatients = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const doctor = await Doctor.findOne({ user: userId });
    
    // Find all appointments for this doctor's schedules
    const appointments = await Appointment.find()
      .populate({
        path: 'schedule',
        match: { doctor: doctor?._id }
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      });

    // Filter appointments belonging to doctor
    const myAppointments = appointments.filter(app => app.schedule !== null);
    
    // Extract unique patients
    const patientsMap = new Map();
    myAppointments.forEach(app => {
      if (app.patient && !patientsMap.has(app.patient._id.toString())) {
        patientsMap.set(app.patient._id.toString(), app.patient);
      }
    });

    res.json(Array.from(patientsMap.values()));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
};
