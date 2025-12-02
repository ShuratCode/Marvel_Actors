import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { errorHandler } from '../../src/middleware/errorHandler.js';
import { AppError } from '../../src/utils/AppError.js';
import { logger } from '../../src/utils/logger.js';

// Mock the logger
jest.mock('../../src/utils/logger.js', () => ({
  logger: {
    error: jest.fn(),
    warn: jest.fn(),
  },
}));

describe('Error Handler Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      headersSent: false,
    };
    next = jest.fn();
    jest.clearAllMocks();
    process.env.NODE_ENV = 'test'; // Ensure we are in test mode (prod-like behavior)
  });

  it('should handle operational errors and return specific message', () => {
    const err = new AppError('Invalid input', 400);
    
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      status: 'fail',
      message: 'Invalid input',
    });
    expect(logger.warn).toHaveBeenCalledWith('Invalid input');
  });

  it('should handle programming errors (non-operational) and return generic 500 in prod/test', () => {
    const err = new Error('Database connection failed');
    
    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 'error',
      message: 'Something went very wrong!',
    });
    // Should verify logger.error was called with stack
    expect(logger.error).toHaveBeenCalled();
  });

  it('should call next if headers are already sent', () => {
    res.headersSent = true;
    const err = new Error('Error');
    
    errorHandler(err, req, res, next);

    expect(next).toHaveBeenCalledWith(err);
    expect(res.status).not.toHaveBeenCalled();
  });
});
