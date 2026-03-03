import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import mongoose from 'mongoose';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { ApiKey, DailyUsage } from '../models';
import { ERROR_CODES } from '@prompt-forge/shared';

export function errorHandler(
    err: Error,
    _req: Request,
    res: Response,
    _next: NextFunction
): void {
    logger.error({ error: err.message }, 'Unhandled error');
    res.status(500).json({
        success: false,
        error: ERROR_CODES.INTERNAL_ERROR,
        message: 'An unexpected error occurred',
    });
}

export function notFoundHandler(_req: Request, res: Response): void {
    res.status(404).json({
        success: false,
        error: ERROR_CODES.NOT_FOUND,
        message: 'Endpoint not found',
    });
}

export function validateBody(schema: ZodSchema) {
    return (req: Request, res: Response, next: NextFunction): void => {
        try {
            req.body = schema.parse(req.body);
            next();
        } catch (error) {
            if (error instanceof ZodError) {
                res.status(400).json({
                    success: false,
                    error: ERROR_CODES.INVALID_REQUEST,
                    message: error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; '),
                });
                return;
            }
            next(error);
        }
    };
}

export async function requireApiKey(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const apiKey = req.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
        res.status(401).json({
            success: false,
            error: ERROR_CODES.UNAUTHORIZED,
            message: 'Missing x-api-key header',
        });
        return;
    }

    if (!config.mongodb.enabled || mongoose.connection.readyState !== 1) {
        (req as any).apiKeyDoc = null;
        next();
        return;
    }

    try {
        const prefix = apiKey.substring(0, 8);
        const keys = await ApiKey.find({ keyPrefix: prefix, isActive: true });

        let matchedKey = null;
        for (const key of keys) {
            const isValid = await key.validateKey(apiKey);
            if (isValid) {
                matchedKey = key;
                break;
            }
        }

        if (!matchedKey) {
            res.status(401).json({
                success: false,
                error: ERROR_CODES.UNAUTHORIZED,
                message: 'Invalid API key',
            });
            return;
        }

        if (!matchedKey.isActive) {
            res.status(403).json({
                success: false,
                error: ERROR_CODES.FORBIDDEN,
                message: 'API key is inactive',
            });
            return;
        }

        const today = new Date().toISOString().split('T')[0];
        const usage = await DailyUsage.findOne({ apiKeyId: matchedKey._id, date: today });
        const currentCount = usage?.count || 0;

        if (currentCount >= matchedKey.quotaPerDay) {
            res.status(429).json({
                success: false,
                error: ERROR_CODES.QUOTA_EXCEEDED,
                message: `Daily quota of ${matchedKey.quotaPerDay} requests exceeded`,
            });
            return;
        }

        await DailyUsage.findOneAndUpdate(
            { apiKeyId: matchedKey._id, date: today },
            { $inc: { count: 1 } },
            { upsert: true }
        );

        matchedKey.lastUsedAt = new Date();
        await matchedKey.save();

        (req as any).apiKeyDoc = matchedKey;
        next();
    } catch (error) {
        logger.error({ error }, 'API key auth error');
        res.status(500).json({
            success: false,
            error: ERROR_CODES.INTERNAL_ERROR,
            message: 'Authentication error',
        });
    }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    const adminKey = req.headers['x-admin-key'] as string;

    if (!config.admin.enabled) {
        res.status(503).json({
            success: false,
            error: 'admin_disabled',
            message: 'Admin functionality not configured (set ADMIN_KEY)',
        });
        return;
    }

    if (!adminKey || adminKey !== config.admin.key) {
        res.status(401).json({
            success: false,
            error: ERROR_CODES.UNAUTHORIZED,
            message: 'Invalid admin key',
        });
        return;
    }

    next();
}
