import { Router, Request, Response } from 'express';
import { config } from '../config/env';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
    res.json({
        ok: true,
        version: '2.0.0',
        env: config.nodeEnv,
    });
});

router.get('/models', (_req: Request, res: Response) => {
    res.json({
        models: [
            {
                id: 'llama-3.1-8b-instant',
                name: 'Llama 3.1 8B Instant',
                provider: 'groq',
                default: config.groq.model === 'llama-3.1-8b-instant',
            },
            {
                id: 'llama-3.1-70b-versatile',
                name: 'Llama 3.1 70B Versatile',
                provider: 'groq',
                default: config.groq.model === 'llama-3.1-70b-versatile',
            },
            {
                id: 'mixtral-8x7b-32768',
                name: 'Mixtral 8x7B',
                provider: 'groq',
                default: config.groq.model === 'mixtral-8x7b-32768',
            },
        ],
    });
});

export default router;
