import mongoose from 'mongoose';

const doctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tel: String,
  specialty: {
    type: String,
    required: true,
  },
  gender: String,
}, {
  timestamps: true,
});

export default mongoose.model('Doctor', doctorSchema);
