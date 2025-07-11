import winston from 'winston';

/**
 * Custom log message formatter for Winston
 * @function logFormat
 * @param {Object} logObject - The log entry object
 * @param {string} logObject.timestamp - ISO timestamp of the log
 * @param {string} logObject.level - Log level (error, warn, info, etc.)
 * @param {string} logObject.message - The log message content
 * @param {string} [logObject.context] - Optional context for the log
 * @returns {string} Formatted log string
 * @example
 * // Sample output:
 * // "2023-01-01T12:00:00.000Z [info] [app]: Server started on port 3000"
 */
const logFormat = winston.format.printf(({ timestamp, level, message, context }) => {
    return `${timestamp} [${level}] [${context}]: ${message}`;
});

/**
 * Winston logger configuration and instance
 * @module logger
 * @description Centralized logging utility for the application with:
 * - Custom log formatting
 * - Multiple transport targets (console, files)
 * - Configurable log levels
 *
 * @property {string} level='info' - Default logging threshold (logs info and above)
 * @property {Object} format - Combined Winston formatters:
 *   - Timestamp
 *   - Colorized output (for console)
 *   - Custom log format
 * @property {Array} transports - Log output destinations:
 *   - Console (all levels)
 *   - Error log file (errors only)
 *   - Combined log file (all levels)
 *
 * @example
 * // Basic usage:
 * import logger from './logger';
 * logger.info('Application started', { context: 'server' });
 *
 * @example
 * // With error logging:
 * try {
 *   // Some operation
 * } catch (err) {
 *   logger.error('Operation failed', { context: 'database', error: err });
 * }
 */
const logger = winston.createLogger({
    level: 'info', // Default logging level
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormat
    ),
    transports: [
        // Console transport for development
        new winston.transports.Console({
            handleExceptions: true,
            handleRejections: true
        }),

        // Error log file (errors only)
        new winston.transports.File({
            filename: 'logs/card-backend/error.log',
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        }),

        // Combined log file (all levels)
        new winston.transports.File({
            filename: 'logs/card-backend/combined.log',
            maxsize: 5242880, // 5MB
            maxFiles: 5
        })
    ]
});

export default logger;