import { Error as MongooseError } from 'mongoose';
import { MongoError } from 'mongodb';
import jwt from 'jsonwebtoken';

// Custom error class for application-specific errors
export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error types
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string) {
    super(message, 401);
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string) {
    super(message, 403);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404);
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

// Error handler for Mongoose validation errors
export const handleMongooseValidationError = (error: MongooseError.ValidationError): AppError => {
  const messages = Object.values(error.errors).map(err => err.message);
  return new ValidationError(messages.join(', '));
};

// Error handler for MongoDB duplicate key errors
export const handleMongoDuplicateKeyError = (error: MongoError): AppError => {
  // Cast to any to access keyPattern which exists on the error object
  const mongoError = error as any;
  const field = Object.keys(mongoError.keyPattern)[0];
  return new ConflictError(`${field.charAt(0).toUpperCase() + field.slice(1)} already exists`);
};

// Error handler for JWT errors
export const handleJWTError = (error: jwt.JsonWebTokenError): AppError => {
  if (error instanceof jwt.TokenExpiredError) {
    return new AuthenticationError('Token has expired');
  }
  return new AuthenticationError('Invalid token');
};

// Error handler for bcrypt errors
export const handleBcryptError = (error: Error): AppError => {
  return new ValidationError('Error processing password');
}; 