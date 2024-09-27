import winston from 'winston';

// Define log format
const logFormat = winston.format.printf(({ timestamp, level, message, context }) => {
    return `${timestamp} [${level}] [${context}]: ${message}`;
});

/**
 * Create Winston logger instance
 *
 * @returns {Promise<Object>} - The newly created business record.
 */
const logger = winston.createLogger({
    level: 'info', // Default logging level
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.colorize(),
        logFormat
    ),
    transports: [
        new winston.transports.Console(),  // Logs to console
        new winston.transports.File({ filename: 'logs/card-backend/error.log', level: 'error' }),  // Logs errors to error.log
        new winston.transports.File({ filename: 'logs/card-backendcombined.log' })  // Logs everything to combined.log
    ]
});

// Export the logger instance to use in other parts of your application
export default logger;
