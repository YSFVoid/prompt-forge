// ============================================================
// Prompt Forge API - Error Handler Middleware
// ============================================================

import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    logger.error({ error: err.message, stack: err.stack }, 'Unhandled error');

    res.status(500).json({
        success: false,
        error: 'internal_error',
        message: 'An unexpected error occurred'
    });
}

export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: 'not_found',
        message: 'Endpoint not found'
    });
}
