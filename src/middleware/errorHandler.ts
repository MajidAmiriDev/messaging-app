import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    logger.error(`Error occurred: ${err.message}`);
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env.NODE_ENV === 'production' ? null : err.stack
    });
};