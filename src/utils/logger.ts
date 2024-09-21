import { createLogger, format, transports } from 'winston';

// Create logger instance
const logger = createLogger({
    level: 'info', // Default log level
    format: format.combine(
        format.timestamp(),
        format.json(), // Log format in JSON
    ),
    transports: [
        new transports.Console({ // Log to console
            format: format.combine(format.colorize(), format.simple())
        }),
        new transports.File({ filename: 'logs/error.log', level: 'error' }), // Log only errors to error.log
        new transports.File({ filename: 'logs/combined.log' }), // Log all levels to combined.log
    ],
});

// Export logger
export default logger;