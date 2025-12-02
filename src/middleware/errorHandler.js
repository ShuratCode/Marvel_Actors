import { logger } from '../utils/logger.js';
import { AppError, NotFoundError } from '../utils/AppError.js';

export const notFoundHandler = (req, res, next) => {
  next(new NotFoundError(`Not Found - ${req.originalUrl}`));
};

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or other unknown error: don't leak details
    logger.error(`ERROR 💥: ${err.message}\nStack: ${err.stack}`);

    res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!',
    });
  }
};

export function errorHandler(err, req, res, next) {
  if (res.headersSent) {
    return next(err);
  }

  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  
  // Log the error
  if (err.statusCode === 500) {
    logger.error(`${err.message} \nStack: ${err.stack}`);
  } else {
    logger.warn(`${err.message}`);
  }

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else {
    sendErrorProd(err, res);
  }
}
