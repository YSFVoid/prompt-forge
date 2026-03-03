import { Router, Request, Response } from 'express';
import { feedbackRequestSchema } from '@prompt-forge/shared';
import { requireApiKey, validateBody } from '../middleware';
import { Feedback } from '../models';
import { logger } from '../utils/logger';
import { config } from '../config/env';

const router = Router();

router.post(
    '/feedback',
    requireApiKey,
    validateBody(feedbackRequestSchema),
    async (req: Request, res: Response): Promise<void> => {
        const { outputId, rating, note } = req.body;

        if (!config.mongodb.enabled) {
            res.json({ success: true, id: 'no-db' });
            return;
        }

        try {
            const feedback = await Feedback.create({
                outputId,
                rating,
                note,
            });

            logger.info({ outputId, rating }, 'Feedback submitted');

            res.status(201).json({
                success: true,
                id: feedback._id.toString(),
            });
        } catch (error) {
            logger.error({ error }, 'Failed to submit feedback');
            res.status(500).json({
                success: false,
                error: 'internal_error',
                message: 'Failed to submit feedback',
            });
        }
    }
);

export default router;
