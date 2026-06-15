
import * as authService from '../services/auth.service.js';
import { generateTokenAndSetCookie } from '../utils/jwt.utils.js';

export const register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const user = await authService.registerUser({ username, email, password });

    generateTokenAndSetCookie(res, user._id);

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      user,
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

