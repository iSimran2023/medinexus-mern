import mongoose from 'mongoose';

const patientSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  address: String,
  dob: Date,
  tel: String,
}, {
  timestamps: true,
});

export default mongoose.model('Patient', patientSchema);
