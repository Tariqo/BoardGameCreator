import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import cookie from 'cookie';
import { User } from '../models/User';

// Extend Express Request to include userId and optional full user
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      user?: any;
    }
  }
}

// ✅ Reads token from HttpOnly cookie, not header
export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const cookies = cookie.parse(req.headers.cookie || '');
  const token = cookies.token;

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Authentication token is required',
    });
    return;
  }

  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET is not defined in environment variables');
  }

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err || typeof decoded !== 'object' || !('userId' in decoded)) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    req.userId = (decoded as JwtPayload).userId;
    next();
  });
};

// ✅ Optional: Attach full user object if needed
export const attachUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated',
      });
    }

    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};
