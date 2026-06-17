import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

const otpSchema = new Schema({
  email: {
    type: String,
    required: true,
    index: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600,
  },
});

otpSchema.pre('save', async function () {
  if (!this.isModified('otp')) return;
  
  const salt = await bcrypt.genSalt(12);
  this.otp = await bcrypt.hash(this.otp, salt);
});

otpSchema.methods.verifyOtp = async function (candidate) {
  return bcrypt.compare(candidate, this.otp);
};

const Otp = mongoose.model('Otp', otpSchema);
export default Otp;