import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  // If headers sent, delegate to default handler
  if (res.headersSent) {
    return next(err);
  }

  // Use custom status if set on error object, otherwise 500
  const statusCode = err.status || 500;
  
  // Log error using Winston
  logger.error(`${err.message} \nStack: ${err.stack}`);

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: err.message || 'An unexpected error occurred',
  });
}
