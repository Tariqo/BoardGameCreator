import { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { Error as MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';
import jwt from 'jsonwebtoken';
import {
  AppError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  handleMongooseValidationError,
  handleMongoDuplicateKeyError,
  handleJWTError,
  handleBcryptError,
} from '../utils/errors';

export const errorHandler: ErrorRequestHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', {
    name: err.name,
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });

  // Handle known error types
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Handle Mongoose validation errors
  if (err instanceof MongooseError.ValidationError) {
    const error = handleMongooseValidationError(err);
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Handle MongoDB duplicate key errors
  if (err instanceof MongoError && err.code === 11000) {
    const error = handleMongoDuplicateKeyError(err);
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Handle JWT errors
  if (err instanceof jwt.JsonWebTokenError) {
    const error = handleJWTError(err);
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Handle bcrypt errors
  if (err.name === 'BcryptError') {
    const error = handleBcryptError(err);
    res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
    return;
  }

  // Handle unknown errors
  const isDevelopment = process.env.NODE_ENV === 'development';
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(isDevelopment && { error: err.message }),
  });
}; 