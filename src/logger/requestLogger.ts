import { Request, Response, NextFunction } from 'express';
import logger from './logger';

const rLogger = logger.child({ context: 'requestLogger' });

/**
 * Express middleware for logging incoming HTTP requests.
 * @module requestLogger
 * @description Logs all incoming requests with method and URL for debugging and monitoring purposes.
 * @example
 * // Basic usage in Express app:
 * import requestLogger from './middleware/requestLogger';
 * app.use(requestLogger);
 */

/**
 * Request logger middleware function.
 * @function
 * @param {Request} req - Express request object
 * @param {Response} res - Express response object
 * @param {NextFunction} next - Express next function
 * @returns {void}
 * @description
 * Logs each incoming request with the following details:
 * - HTTP method (GET, POST, PUT, DELETE, etc.)
 * - Request URL
 *
 * The logger uses a child logger instance with 'requestLogger' context for easy filtering.
 *
 * @example
 * // Sample log output:
 * // [2023-01-01T12:00:00.000Z] INFO (requestLogger): Incoming request: GET /api/users
 */
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    rLogger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
};

export default requestLogger;