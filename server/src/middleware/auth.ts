import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

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

    jwt.verify(token, jwtSecret, (err: any, decoded: any) => {
      if (err) {
        res.status(401).json({
          success: false,
          message: 'Invalid or expired token',
        });
        return;
      }

      // Attach userId to request object
      req.userId = decoded.userId;
      next();
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
}; 