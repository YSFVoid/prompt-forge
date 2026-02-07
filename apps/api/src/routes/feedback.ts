// ============================================================
// Prompt Forge API - Feedback Routes
// ============================================================

import { Router, Request, Response } from 'express';
import { logger } from '../utils/logger';
import { validateBody } from '../middleware';
import { feedbackRequestSchema } from '../schemas';
import { Feedback, PromptOutput } from '../models';

const router = Router();

// Submit feedback
router.post('/', validateBody(feedbackRequestSchema), async (req: Request, res: Response) => {
    try {
        const { promptOutputId, rating, variant, comment } = req.body;

        // Verify prompt output exists
        const output = await PromptOutput.findById(promptOutputId);
        if (!output) {
            res.status(404).json({
                success: false,
                error: 'not_found',
                message: 'Prompt output not found'
            });
            return;
        }

        const feedback = new Feedback({
            promptOutputId,
            rating,
            variant,
            comment
        });

        await feedback.save();

        logger.info({ rating, promptOutputId }, 'Feedback submitted');

        res.status(201).json({
            success: true,
            feedback: {
                id: feedback._id,
                rating: feedback.rating,
                createdAt: feedback.createdAt
            }
        });
    } catch (error) {
        logger.error({ error }, 'Failed to submit feedback');
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to submit feedback'
        });
    }
});

// Get feedback stats (public)
router.get('/stats', async (_req: Request, res: Response) => {
    try {
        const [positive, negative] = await Promise.all([
            Feedback.countDocuments({ rating: 'positive' }),
            Feedback.countDocuments({ rating: 'negative' })
        ]);

        const total = positive + negative;
        const satisfactionRate = total > 0 ? (positive / total) * 100 : 0;

        res.json({
            success: true,
            stats: {
                total,
                positive,
                negative,
                satisfactionRate: Math.round(satisfactionRate * 10) / 10
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to get feedback stats'
        });
    }
});

export default router;
