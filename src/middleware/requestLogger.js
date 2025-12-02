import { logger } from '../utils/logger.js';

export function requestLogger(req, res, next) {
  const start = Date.now();
  const { method, url } = req;

  // Log when the request finishes
  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    const message = `${method} ${url} ${statusCode} - ${duration}ms`;
    
    if (statusCode >= 400) {
      logger.error(message);
    } else {
      logger.info(message);
    }
  });

  next();
}
