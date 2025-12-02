import { describe, it, expect, jest } from '@jest/globals';
import { errorHandler } from '../../src/middleware/errorHandler.js';

describe('Error Handler Middleware', () => {
  it('should handle standard errors and return 500', () => {
    const err = new Error('Something went wrong');
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();

    // Mock console.error to avoid noise in tests
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });

    consoleSpy.mockRestore();
  });

  it('should handle errors with custom status codes', () => {
    const err = new Error('Not Found');
    err.status = 404;
    
    const req = {};
    const res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const next = jest.fn();
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Error', 
      message: 'Not Found',
    });
    
    consoleSpy.mockRestore();
  });
});

