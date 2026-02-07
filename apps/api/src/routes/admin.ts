// ============================================================
// Prompt Forge API - Admin Routes
// ============================================================

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import { validateBody } from '../middleware';
import { createApiKeySchema } from '../schemas';
import { ApiKey, Feedback, Conversation, Message } from '../models';

const router = Router();

// Admin authentication middleware
function requireAdmin(req: Request, res: Response, next: Function) {
    const adminKey = req.headers['x-admin-key'] as string;

    if (!config.admin.enabled) {
        res.status(503).json({
            success: false,
            error: 'admin_disabled',
            message: 'Admin functionality is disabled'
        });
        return;
    }

    if (!adminKey || adminKey !== config.admin.key) {
        res.status(401).json({
            success: false,
            error: 'unauthorized',
            message: 'Invalid admin key'
        });
        return;
    }

    next();
}

// Apply admin auth to all routes
router.use(requireAdmin);

// Create API key
router.post('/api-keys', validateBody(createApiKeySchema), async (req: Request, res: Response) => {
    try {
        const { name, permissions, rateLimit, expiresInDays } = req.body;

        // Generate key
        const plainKey = `pf_${uuidv4().replace(/-/g, '')}`;
        const keyHash = await argon2.hash(plainKey);
        const keyPrefix = plainKey.substring(0, 8);

        const apiKey = new ApiKey({
            name,
            keyHash,
            keyPrefix,
            permissions,
            rateLimit,
            expiresAt: expiresInDays
                ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
                : undefined,
        });

        await apiKey.save();

        logger.info({ keyPrefix }, 'API key created');

        res.status(201).json({
            success: true,
            apiKey: {
                id: apiKey._id,
                name: apiKey.name,
                keyPrefix: apiKey.keyPrefix,
                key: plainKey, // Only returned once!
                rateLimit: apiKey.rateLimit,
                expiresAt: apiKey.expiresAt,
            }
        });
    } catch (error) {
        logger.error({ error }, 'Failed to create API key');
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to create API key'
        });
    }
});

// List API keys
router.get('/api-keys', async (_req: Request, res: Response) => {
    try {
        const keys = await ApiKey.find({}, '-keyHash').sort({ createdAt: -1 });

        res.json({
            success: true,
            apiKeys: keys
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to list API keys'
        });
    }
});

// Revoke API key
router.delete('/api-keys/:id', async (req: Request, res: Response) => {
    try {
        const result = await ApiKey.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!result) {
            res.status(404).json({
                success: false,
                error: 'not_found',
                message: 'API key not found'
            });
            return;
        }

        logger.info({ keyId: req.params.id }, 'API key revoked');

        res.json({
            success: true,
            message: 'API key revoked'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to revoke API key'
        });
    }
});

// Get stats
router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const [
            totalConversations,
            totalMessages,
            totalFeedback,
            positiveFeedback,
            activeKeys
        ] = await Promise.all([
            Conversation.countDocuments(),
            Message.countDocuments(),
            Feedback.countDocuments(),
            Feedback.countDocuments({ rating: 'positive' }),
            ApiKey.countDocuments({ isActive: true })
        ]);

        res.json({
            success: true,
            stats: {
                conversations: totalConversations,
                messages: totalMessages,
                feedback: {
                    total: totalFeedback,
                    positive: positiveFeedback,
                    negative: totalFeedback - positiveFeedback
                },
                apiKeys: activeKeys
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to get stats'
        });
    }
});

// Export training data
router.get('/export/training-data', async (_req: Request, res: Response) => {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: 'promptoutputs',
                    localField: 'promptOutputId',
                    foreignField: '_id',
                    as: 'output'
                }
            },
            { $unwind: '$output' },
            {
                $lookup: {
                    from: 'messages',
                    localField: 'output.messageId',
                    foreignField: '_id',
                    as: 'message'
                }
            },
            { $unwind: '$message' },
            {
                $project: {
                    idea: '$message.content',
                    prompt: '$output.masterPrompt',
                    rating: '$rating',
                    variant: '$variant',
                    createdAt: '$createdAt'
                }
            }
        ];

        const data = await Feedback.aggregate(pipeline);

        res.json({
            success: true,
            count: data.length,
            data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to export training data'
        });
    }
});

export default router;
