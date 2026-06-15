
import { verifyToken } from '../utils/jwt.utils.js';
import { ApiError } from '../utils/ApiError.js';
import User from '../models/User.models.js';

export const authMiddleware = async (req, res, next) => {
  try {

    const token = req.cookies?.token;

    if (!token) {
      throw new ApiError(401, 'Not authorised — no token provided');
    }

    const decoded = verifyToken(token);

    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      throw new ApiError(401, 'Not authorised — user no longer exists');
    }

    req.user = user;
    next();

  } catch (error) {

    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Not authorised — invalid or expired token'));
    }

    next(error);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {

    const token = req.cookies?.token;
    if (!token) return next();

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.userId).select('-password');
    if (user) req.user = user;

    next();

  } catch {

    next();
  }
};
