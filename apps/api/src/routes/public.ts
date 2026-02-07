// ============================================================
// Prompt Forge API - Public Prompt Route (No Auth)
// ============================================================

import { Router, Request, Response } from 'express';
import { callGroq, detectLanguage } from '../services/groq';
import { PromptResponse, SupportedLanguage } from '@prompt-forge/shared';

import { logger } from '../utils/logger';

const router = Router();

/**
 * POST /v1/public/prompt
 * Generate prompts from an idea - no authentication required
 */
router.post('/prompt', async (req: Request, res: Response): Promise<void> => {
    const startTime = Date.now();
    const { idea } = req.body;

    // Validate input
    if (!idea || typeof idea !== 'string' || idea.trim().length === 0) {
        res.status(400).json({
            success: false,
            error: 'invalid_request',
            message: 'Please provide an "idea" field in the request body',
        });
        return;
    }

    if (idea.length > 5000) {
        res.status(400).json({
            success: false,
            error: 'invalid_request',
            message: 'Idea must be 5000 characters or less',
        });
        return;
    }

    try {
        // Detect language
        const language = detectLanguage(idea);

        // Generate prompts via Groq
        const { output, tokensUsed, modelUsed } = await callGroq({
            idea: idea.trim(),
            language,
        });

        // Build response
        const response: PromptResponse = {
            success: true,
            ideaSummary: output.idea_summary,
            clarifyingQuestions: output.clarifying_questions,
            masterPrompt: output.master_prompt,
            variantA: output.variant_a,
            variantB: output.variant_b,
            language: language as SupportedLanguage,
            metadata: {
                modelUsed,
                tokensUsed,
                processingTimeMs: Date.now() - startTime,
            },
        };

        res.json(response);

        logger.info({
            duration: Date.now() - startTime,
            tokensUsed,
            hasPrompts: !!output.master_prompt,
            language,
        }, 'Prompt generated successfully');

    } catch (error) {
        logger.error({ error }, 'Prompt generation failed');

        if (error instanceof Error && error.message.includes('rate limit')) {
            res.status(429).json({
                success: false,
                error: 'rate_limited',
                message: 'Too many requests. Please wait a moment and try again.',
            });
            return;
        }

        res.status(500).json({
            success: false,
            error: 'internal_error',
            message: 'Failed to generate prompt. Please try again.',
        });
    }
});

/**
 * GET /v1/public/health
 * Health check endpoint
 */
router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        service: 'prompt-forge-api',
        mode: 'public',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
    });
});

export default router;
