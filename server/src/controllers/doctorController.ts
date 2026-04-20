import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { flattenAppointment, flattenPatient, flattenSchedule } from '../utils/dataFlatteners';

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
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .sort({ date: 1 });

    res.json(sessions.map(flattenSchedule));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching sessions' });
  }
};

export const getMyUpcomingAppointments = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.query; // Optional filter by status
    const doctor = await Doctor.findOne({ user: userId });
    
    const query: any = { status: { $ne: 'Cancelled' } };
    if (status) query.status = status;

    const appointments = await Appointment.find(query)
      .populate({
        path: 'schedule',
        match: { doctor: doctor?._id },
        populate: { 
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        }
      })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      })
      .sort({ createdAt: -1 });

    // Filter out appointments where schedule didn't match doctor
    let filtered = appointments.filter(app => app.schedule !== null);

    // Sort by Priority (Emergency > Routine) and then by appointment number (FCFS)
    const priorityWeight: { [key: string]: number } = {
      'Emergency': 2,
      'Routine': 1
    };

    filtered = filtered.sort((a, b) => {
      // Primary sort: Priority weight (descending)
      const pA = priorityWeight[a.priority as string] || 0;
      const pB = priorityWeight[b.priority as string] || 0;
      if (pA !== pB) return pB - pA;
      
      // Secondary sort: Appointment number (ascending)
      return a.appointmentNumber - b.appointmentNumber;
    });

    res.json(filtered.map(flattenAppointment));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};

export const markAppointmentReviewed = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { prescription } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      id,
      { status: 'Reviewed', prescription },
      { new: true }
    );
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    
    // Populate for flattened response
    await appointment.populate([
      {
        path: 'schedule',
        populate: { 
          path: 'doctor',
          populate: { path: 'user', select: 'name' }
        }
      },
      {
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      }
    ]);

    res.json({ message: 'Appointment marked as reviewed', appointment: flattenAppointment(appointment) });
  } catch (err) {
    res.status(500).json({ message: 'Error updating appointment status' });
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

    res.json(Array.from(patientsMap.values()).map(flattenPatient));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patients' });
  }
};

export const updateServingToken = async (req: Request, res: Response) => {
  try {
    const { scheduleId, tokenNumber } = req.body;
    const schedule = await Schedule.findByIdAndUpdate(
      scheduleId,
      { currentlyServingToken: tokenNumber },
      { new: true }
    );
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });
    res.json({ message: 'Serving token updated', currentlyServingToken: schedule.currentlyServingToken });
  } catch (err) {
    res.status(500).json({ message: 'Error updating serving token' });
  }
};
