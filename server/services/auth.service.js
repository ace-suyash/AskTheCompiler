
import User from '../models/User.models.js';
import { ApiError } from '../utils/ApiError.js';
import { generateAndSendOtp } from './otp.service.js';
import { validateOtp } from './otp.service.js';

export const registerUser = async ({ username, email, password }) => {

  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw new ApiError(400, 'An account with that email already exists');
  }

  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    throw new ApiError(400, 'That username is already taken');
  }

  const user = await User.create({ username, email, password });

  // return await User.findById(user._id).select('-password');
  await generateAndSendOtp(email);
  return { message: 'OTP sent to your email. Please verify to complete registration.' };

};


export const loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }
  if (!user.isVerified) {
    await generateAndSendOtp(user.email);
    throw new ApiError(403, 'Email not verified. A new OTP has been sent to your email.');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return await User.findById(user._id).select('-password');
};

export const verifyUserOtp = async ({ email, otp }) => {
  await validateOtp(email, otp);

  const user = await User.findOneAndUpdate(
    { email: email.toLowerCase() },
    { isVerified: true },
    { new: true }
  ).select('-password');

  if (!user) throw new ApiError(404, 'User not found.');
  return user;
};

export const resendUserOtp = async ({ email }) => {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user)           throw new ApiError(404, 'No account with that email.');
  if (user.isVerified) throw new ApiError(400, 'Account is already verified.');

  await generateAndSendOtp(email);
  return { message: 'OTP resent successfully.' };
};

