import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  maxAppointments: {
    type: Number,
    required: true,
    default: 1,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Schedule', scheduleSchema);
