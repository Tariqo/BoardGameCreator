import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

// Extend Express Request to include userId
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
