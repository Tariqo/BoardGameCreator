// server/src/controllers/authController.ts
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import jwt from 'jsonwebtoken';
import {
  ValidationError,
  AuthenticationError,
  ConflictError,
} from '../utils/errors';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, username, password } = req.body;

    if (!email || !username || !password) {
      throw new ValidationError('Email, username, and password are required');
    }

    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() },
      ],
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      throw new ConflictError(`${field.charAt(0).toUpperCase() + field.slice(1)} already registered`);
    }

    const user = new User({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        email: user.email,
        username: user.username,
        id: user._id,
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { loginIdentifier, password } = req.body;

    if (!loginIdentifier || !password) {
      throw new ValidationError('Login identifier and password are required');
    }

    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { username: loginIdentifier.toLowerCase() },
      ],
    });

    if (!user || !(await user.comparePassword(password))) {
      throw new AuthenticationError('Invalid credentials');
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) throw new Error('JWT_SECRET is not defined');

    const token = jwt.sign(
      { userId: user._id, email: user.email, username: user.username },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // ✅ Send token as a secure HttpOnly cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: false, // true in production with HTTPS
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
        },
      },
    });
  } catch (error: any) {
    next(error);
  }
};

export const logout = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // ✅ Clear token cookie
    res.clearCookie('token').status(200).json({
      success: true,
      message: 'Logout successful',
    });
  } catch (error: any) {
    next(error);
  }
};
