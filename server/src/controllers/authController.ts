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

    // Input validation
    if (!email || !username || !password) {
      throw new ValidationError('Email, username, and password are required');
    }

    // Check if user already exists with email or username
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username.toLowerCase() }
      ]
    });

    if (existingUser) {
      const field = existingUser.email === email.toLowerCase() ? 'email' : 'username';
      throw new ConflictError(`${field.charAt(0).toUpperCase() + field.slice(1)} already registered`);
    }

    // Create new user
    const user = new User({
      email: email.toLowerCase(),
      username: username.toLowerCase(),
      password,
    });

    await user.save();

    // Return success response without password
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

    // Input validation
    if (!loginIdentifier || !password) {
      throw new ValidationError('Login identifier and password are required');
    }

    // Find user by email or username (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: loginIdentifier.toLowerCase() },
        { username: loginIdentifier.toLowerCase() }
      ]
    });

    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Compare passwords
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Get JWT secret from environment
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    // Create JWT payload
    const payload = {
      userId: user._id,
      email: user.email,
      username: user.username,
    };

    // Generate JWT token
    const token = jwt.sign(payload, jwtSecret, {
      expiresIn: '24h', // Token expires in 24 hours
    });

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
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
    // For MVP, we just return a success response
    // The client is responsible for removing the token from storage
    res.status(200).json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error: any) {
    next(error);
  }
}; 