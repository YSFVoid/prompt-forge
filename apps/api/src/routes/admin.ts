import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import * as argon2 from 'argon2';
import { createApiKeySchema } from '@prompt-forge/shared';
import { requireAdmin, validateBody } from '../middleware';
import { logger } from '../utils/logger';
import { ApiKey, DailyUsage, Conversation, Feedback } from '../models';

const router = Router();

router.use(requireAdmin);

router.post('/keys', validateBody(createApiKeySchema), async (req: Request, res: Response) => {
    try {
        const { name, rateLimitPerMin, quotaPerDay } = req.body;

        const plainKey = `pf_${uuidv4().replace(/-/g, '')}`;
        const keyHash = await argon2.hash(plainKey);
        const keyPrefix = plainKey.substring(0, 8);

        const apiKey = await ApiKey.create({
            name,
            keyHash,
            keyPrefix,
            rateLimitPerMin,
            quotaPerDay,
        });

        logger.info({ keyPrefix }, 'API key created');

        res.status(201).json({
            success: true,
            apiKey: {
                id: apiKey._id,
                name: apiKey.name,
                keyPrefix,
                key: plainKey,
                rateLimitPerMin: apiKey.rateLimitPerMin,
                quotaPerDay: apiKey.quotaPerDay,
            },
        });
    } catch (error) {
        logger.error({ error }, 'Failed to create API key');
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to create API key',
        });
    }
});

router.delete('/keys/:id', async (req: Request, res: Response) => {
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
                message: 'API key not found',
            });
            return;
        }

        logger.info({ keyId: req.params.id }, 'API key revoked');
        res.json({ success: true, message: 'API key revoked' });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to revoke API key',
        });
    }
});

router.get('/usage', async (_req: Request, res: Response) => {
    try {
        const today = new Date().toISOString().split('T')[0];

        const [totalKeys, activeKeys, totalConversations, totalFeedback, todayUsage] =
            await Promise.all([
                ApiKey.countDocuments(),
                ApiKey.countDocuments({ isActive: true }),
                Conversation.countDocuments(),
                Feedback.countDocuments(),
                DailyUsage.aggregate([
                    { $match: { date: today } },
                    { $group: { _id: null, total: { $sum: '$count' } } },
                ]),
            ]);

        res.json({
            success: true,
            stats: {
                apiKeys: { total: totalKeys, active: activeKeys },
                conversations: totalConversations,
                feedback: totalFeedback,
                todayRequests: todayUsage[0]?.total || 0,
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to get stats',
        });
    }
});

export default router;
