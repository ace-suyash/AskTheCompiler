
import User from '../models/User.js';
import { ApiError } from '../utils/ApiError.js';

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

  return await User.findById(user._id).select('-password');
};


export const loginUser = async ({ email, password }) => {

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new ApiError(401, 'Invalid email or password');
  }

  return await User.findById(user._id).select('-password');
};

