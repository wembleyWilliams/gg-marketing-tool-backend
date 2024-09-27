import { Request, Response, NextFunction } from 'express';
import logger from './logger';

const rLogger = logger.child({context:'requestLogger'})
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    rLogger.info(`Incoming request: ${req.method} ${req.url}`);
    next();
};

export default requestLogger;
