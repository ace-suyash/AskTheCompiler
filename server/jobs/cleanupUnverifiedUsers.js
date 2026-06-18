import User from '../models/User.models.js';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const cleanupUnverifiedUsers = async () => {
  const cutoff = new Date(Date.now() - SEVEN_DAYS_MS);

  const result = await User.deleteMany({
    isVerified: false,
    createdAt: { $lt: cutoff },
  });

  if (result.deletedCount > 0) {
    console.log(
      `[cleanup] Removed ${result.deletedCount} unverified user(s) older than 7 days`
    );
  }

  return result.deletedCount;
};