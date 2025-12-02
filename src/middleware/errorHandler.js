import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  const statusCode = err.status || 500;
  
  logger.error(`${err.message} \nStack: ${err.stack}`);

  res.status(statusCode).json({
    error: statusCode === 500 ? 'Internal Server Error' : 'Error',
    message: err.message || 'An unexpected error occurred',
  });
}
