import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  nic: String,
  tel: String,
  specialty: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

export default mongoose.model('Doctor', doctorSchema);
