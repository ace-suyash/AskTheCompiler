import * as userService from '../services/user.service.js';

export const getProfile = async (req, res, next) => {
  try {
    const data = await userService.getUserProfile(req.params.id);

    const isOwner = req.user && req.user._id.toString() === req.params.id;
    if (!isOwner) {
      delete data.user.email;
    }

    res.json({ success: true, ...data, isOwner: !!isOwner });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req, res, next) => {
  try {
    const result = await userService.deleteUserAccount(req.user._id);

    res.cookie('token', '', {
      httpOnly: true,
      expires: new Date(0),
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
