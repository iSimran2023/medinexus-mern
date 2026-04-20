import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true,
  },
  schedule: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true,
  },
  appointmentNumber: {
    type: Number,
    required: true,
  },
  appointmentDate: {
    type: Date,
    default: Date.now,
  },
  medicalData: {
    symptoms: String,
    history: String,
    documentName: String,
  },
  prescription: {
    diagnosis: String,
    medications: [String],
    notes: String,
  },
  priority: {
    type: String,
    enum: ['Routine', 'Emergency'],
    default: 'Routine',
  },
  status: {
    type: String,
    enum: ['Pending', 'Reviewed', 'Cancelled', 'Rescheduled'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

export default mongoose.model('Appointment', appointmentSchema);
