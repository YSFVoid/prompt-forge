// ============================================================
// Prompt Forge API - Health Routes
// ============================================================

import { Router, Request, Response } from 'express';
import { config } from '../config/env';

const router = Router();

/**
 * GET /v1/health
 * API health check
 */
router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        service: 'prompt-forge-api',
        version: '1.0.0',
        mode: config.publicMode ? 'public' : 'authenticated',
        features: {
            database: config.mongodb.enabled,
            admin: config.admin.enabled,
        },
        timestamp: new Date().toISOString(),
    });
});

/**
 * GET /v1/models
 * List available LLM models
 */
router.get('/models', (_req: Request, res: Response) => {
    res.json({
        models: [
            {
                id: 'llama-3.1-8b-instant',
                name: 'Llama 3.1 8B Instant',
                provider: 'groq',
                default: true,
            },
            {
                id: 'llama-3.1-70b-versatile',
                name: 'Llama 3.1 70B Versatile',
                provider: 'groq',
            },
            {
                id: 'mixtral-8x7b-32768',
                name: 'Mixtral 8x7B',
                provider: 'groq',
            },
        ],
    });
});

export default router;
