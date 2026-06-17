
import * as authService from '../services/auth.service.js';
import { generateTokenAndSetCookie } from '../utils/jwt.utils.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const result = await authService.registerUser({ username, email, password });

    // generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true,
      message: result.message
      // user,
    });
  } catch (error) {
    next(error); 
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authService.loginUser({ email, password });

    generateTokenAndSetCookie(res, user._id);

    res.json({
      success: true,
      message: 'Logged in successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = (req, res) => {

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res, next) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const user = await authService.verifyUserOtp({ email, otp });

    generateTokenAndSetCookie(res, user._id);

    res.json({
      success: true,
      message: 'Email verified successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export const resendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    const result = await authService.resendUserOtp({ email });

    res.json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
};