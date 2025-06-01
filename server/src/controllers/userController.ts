import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError,
  ConflictError,
} from '../utils/errors';

export const getProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      throw new NotFoundError('User not found');
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const updateProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, username, currentPassword, newPassword } = req.body;

    const user = await User.findById(req.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    // Validate and update email
    if (email && email.toLowerCase() !== user.email) {
      const emailExists = await User.findOne({ email: email.toLowerCase() });
      if (emailExists) {
        throw new ConflictError('Email already in use');
      }
      user.email = email.toLowerCase();
    }

    // Validate and update username
    if (username && username.toLowerCase() !== user.username) {
      const usernameExists = await User.findOne({ username: username.toLowerCase() });
      if (usernameExists) {
        throw new ConflictError('Username already in use');
      }
      user.username = username.toLowerCase();
    }

    // Handle password change
    if (currentPassword && newPassword) {
      const isValid = await user.comparePassword(currentPassword);
      if (!isValid) {
        throw new AuthenticationError('Current password is incorrect');
      }
      user.password = newPassword;
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.userId;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(userId).select('username email');
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: {
          username: user.username,
          email: user.email,
        },
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};
