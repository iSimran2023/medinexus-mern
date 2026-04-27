import { Request, Response } from 'express';
import Schedule from '../models/Schedule';
import Appointment from '../models/Appointment';
import Doctor from '../models/Doctor';
import Patient from '../models/Patient';
import { flattenAppointment, flattenDoctor, flattenSchedule, flattenPatient } from '../utils/dataFlatteners';

export const getPatientStats = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const patient = await Patient.findOne({ user: userId });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    const doctorCount = await Doctor.countDocuments();
    
    // Patient's own data
    const myTotalBookings = await Appointment.countDocuments({ patient: patient?._id });
    
    const myActiveBookings = await Appointment.countDocuments({ 
      patient: patient?._id,
      status: 'Pending'
    });
    
    const myTodaySessions = await Appointment.countDocuments({
      patient: patient?._id,
      appointmentTime: { $gte: startOfToday, $lte: endOfToday }
    });

    res.json({
      doctors: doctorCount,
      patients: myTotalBookings,
      appointments: myActiveBookings,
      sessions: myTodaySessions,
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching patient stats' });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const patient = await Patient.findOne({ user: userId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const { scheduleId } = req.query;
    const query: any = { 
      patient: patient._id,
      status: { $ne: 'Cancelled' }
    };
    if (scheduleId) query.schedule = scheduleId;

    // Fetch non-cancelled appointments and sort by newest first
    const bookings = await Appointment.find(query)
      .sort({ createdAt: -1 })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      })
      .populate({
        path: 'schedule',
        populate: { path: 'doctor', populate: { path: 'user', select: 'name' } }
      });

    res.json(bookings.map(flattenAppointment));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching bookings' });
  }
};

export const bookAppointment = async (req: Request, res: Response) => {
  try {
    const { scheduleId, medicalData, priority } = req.body;
    const userId = (req as any).user.id;

    const patient = await Patient.findOne({ user: userId });
    if (!patient) return res.status(404).json({ message: 'Patient not found' });

    const schedule = await Schedule.findById(scheduleId);
    if (!schedule) return res.status(404).json({ message: 'Schedule not found' });

    const existingBooking = await Appointment.findOne({ 
      patient: patient._id, 
      schedule: scheduleId 
    });
    if (existingBooking) {
      return res.status(400).json({ message: 'You have already booked this session' });
    }

    const lastAppointment = await Appointment.findOne({ schedule: scheduleId }).sort({ appointmentNumber: -1 });
    const nextNumber = lastAppointment ? lastAppointment.appointmentNumber + 1 : 1;
    
    const bookingCount = await Appointment.countDocuments({ schedule: scheduleId });
    if (bookingCount >= schedule.maxAppointments) {
      return res.status(400).json({ message: 'Session is full' });
    }

    const appointmentDateTime = new Date(schedule.date);
    const [hours, minutes] = schedule.time.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const newAppointment = await Appointment.create({
      patient: patient._id,
      schedule: scheduleId,
      appointmentNumber: nextNumber,
      medicalData,
      priority: priority || 'Routine',
      status: 'Pending',
      appointmentTime: appointmentDateTime,
    });

    const populated = await newAppointment.populate([
      { path: 'patient', populate: { path: 'user', select: 'name email' } },
      { path: 'schedule', populate: { path: 'doctor', populate: { path: 'user', select: 'name' } } }
    ]);

    res.status(201).json(flattenAppointment(populated));
  } catch (err) {
    res.status(500).json({ message: 'Error booking appointment' });
  }
};

export const getSessions = async (req: Request, res: Response) => {
  try {
    const sessions = await Schedule.find({
      date: { $gte: new Date(new Date().setHours(0,0,0,0)) }
    })
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

export const getAllDoctors = async (req: Request, res: Response) => {
  try {
    const doctors = await Doctor.find().populate('user', 'name email');
    res.json(doctors.map(flattenDoctor));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching doctors' });
  }
};

/** 
 * STEPPER APIS 
 */

// Step 1: Basic Patient Profile
export const getBookingStep1 = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const patient = await Patient.findOne({ user: userId }).populate('user', 'name email');
    if (!patient) return res.status(404).json({ message: 'Patient profile not found' });
    res.json(flattenPatient(patient));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching step 1 data' });
  }
};

const parseHistoryString = (text: string) => {
  if (!text) return {};
  const labels = ['Reason:', 'Diseases:', 'Allergies:', 'Meds:', 'Emergency:', 'Notes:', 'Type:'];
  const result: Record<string, string> = {};
  for (let i = 0; i < labels.length; i++) {
    const currentLabel = labels[i];
    const currentIndex = text.lastIndexOf(currentLabel);
    if (currentIndex === -1) {
      result[currentLabel] = '';
      continue;
    }
    const start = currentIndex + currentLabel.length;
    let end = text.length;
    for (let j = i + 1; j < labels.length; j++) {
      const nextLabelIndex = text.lastIndexOf(labels[j]);
      if (nextLabelIndex !== -1 && nextLabelIndex > currentIndex) {
        if (end === text.length || nextLabelIndex < end) {
          end = nextLabelIndex;
        }
      }
    }
    result[currentLabel] = text.substring(start, end).replace(/\\n/g, '\n').trim();
  }
  return result;
};

// Step 2: Medical History (Pre-fill from last appointment if exists, or specific appointment if rescheduling)
export const getBookingStep2 = async (req: Request, res: Response) => {
  try {
    const { rescheduleId } = req.query;
    let targetAppointment = null;

    if (rescheduleId) {
      targetAppointment = await Appointment.findById(rescheduleId);
    } else {
      const userId = (req as any).user.id;
      const patient = await Patient.findOne({ user: userId });
      if (patient) {
        targetAppointment = await Appointment.findOne({ patient: patient._id }).sort({ createdAt: -1 });
      }
    }

    const parsed = parseHistoryString(targetAppointment?.medicalData?.history || '');
    
    return res.json({
      symptoms: targetAppointment?.medicalData?.symptoms || '',
      reason: parsed['Reason:'] || '',
      existingDiseases: parsed['Diseases:'] || '',
      allergies: parsed['Allergies:'] || '',
      medications: parsed['Meds:'] || '',
      emergencyContact: parsed['Emergency:'] || '',
      history: parsed['Notes:'] || '',
      appointmentType: parsed['Type:'] || 'In-person',
      priority: targetAppointment?.priority || 'Routine',
      documentName: targetAppointment?.medicalData?.documentName || ''
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching step 2 data' });
  }
};

// Step 3: Session Summary
export const getBookingStep3 = async (req: Request, res: Response) => {
  try {
    const { scheduleId } = req.params;
    const { rescheduleId } = req.query;

    const schedule = await Schedule.findById(scheduleId).populate({
      path: 'doctor',
      populate: { path: 'user', select: 'name' }
    });
    if (!schedule) return res.status(404).json({ message: 'Session not found' });

    let rescheduleData = {};
    if (rescheduleId) {
      const appointment = await Appointment.findById(rescheduleId);
      if (appointment) {
        const parsed = parseHistoryString(appointment.medicalData?.history || '');
        rescheduleData = {
          priority: appointment.priority || 'Routine',
          documentName: appointment.medicalData?.documentName || '',
          appointmentType: parsed['Type:'] || 'In-person'
        };
      }
    }

    res.json({
      ...flattenSchedule(schedule),
      rescheduleData
    });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching step 3 data' });
  }
};

// Original profile for backward compatibility
export const getPatientProfile = async (req: Request, res: Response) => {
  return getBookingStep1(req, res);
};

export const cancelAppointmentPatient = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate('schedule');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const schedule = appointment.schedule as any;
    const appointmentDateTime = new Date(schedule.date);
    // Parse time string (e.g., "10:00") and set it to the date
    const [hours, minutes] = schedule.time.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    const now = new Date();
    const diffInMs = appointmentDateTime.getTime() - now.getTime();
    const diffInHours = diffInMs / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return res.status(400).json({ message: 'Cannot cancel within 1 hour of appointment' });
    }

    appointment.status = 'Cancelled';
    await appointment.save();
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error cancelling appointment' });
  }
};

export const rescheduleAppointment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { scheduleId, medicalData, priority } = req.body;

    const appointment = await Appointment.findById(id);
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });

    const newSchedule = await Schedule.findById(scheduleId);
    if (!newSchedule) return res.status(404).json({ message: 'Schedule not found' });

    const bookingCount = await Appointment.countDocuments({ schedule: scheduleId, status: { $ne: 'Cancelled' } });
    if (bookingCount >= newSchedule.maxAppointments) {
      return res.status(400).json({ message: 'Selected session is full' });
    }

    const lastAppointment = await Appointment.findOne({ schedule: scheduleId }).sort({ appointmentNumber: -1 });
    const nextNumber = lastAppointment ? lastAppointment.appointmentNumber + 1 : 1;

    // 1. Mark the OLD appointment as 'Rescheduled'
    await Appointment.updateOne({ _id: id }, { $set: { status: 'Rescheduled' } });

    const appointmentDateTime = new Date(newSchedule.date);
    const [hours, minutes] = newSchedule.time.split(':');
    appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // 2. Create the NEW appointment as 'Pending'
    const newAppointment = new Appointment({
      patient: appointment.patient,
      schedule: scheduleId,
      appointmentNumber: nextNumber,
      medicalData: medicalData || appointment.medicalData,
      priority: priority || appointment.priority,
      status: 'Pending',
      appointmentTime: appointmentDateTime,
    });
    
    await newAppointment.save();

    res.json({ message: 'Appointment rescheduled successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Error rescheduling appointment' });
  }
};

export const getAppointmentDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appointment = await Appointment.findById(id).populate('schedule');
    if (!appointment) return res.status(404).json({ message: 'Appointment not found' });
    res.json(flattenAppointment(appointment));
  } catch (err) {
    res.status(500).json({ message: 'Error fetching appointment details' });
  }
};
