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
  scheduledDate: {
    type: Date,
    required: true,
  },
  scheduledTime: {
    type: String,
    required: true,
  },
  maxPatients: {
    type: Number,
    required: true,
    default: 1,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Schedule', scheduleSchema);
