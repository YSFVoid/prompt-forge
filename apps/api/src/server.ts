import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase } from './db';
import { healthRouter, promptRouter, feedbackRouter, adminRouter } from './routes';
import { errorHandler, notFoundHandler } from './middleware';

const app = express();

app.set('trust proxy', 1);
app.use(helmet());

app.use(
    cors({
        origin: config.cors.origin === '*' ? '*' : config.cors.origin.split(','),
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'x-admin-key'],
        credentials: config.cors.origin !== '*',
    })
);

app.use(express.json({ limit: '1mb' }));

app.use((req, res, next) => {
    const startTime = Date.now();
    res.on('finish', () => {
        logger.info({
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: Date.now() - startTime,
        });
    });
    next();
});

const limiter = rateLimit({
    windowMs: 60 * 1000,
    max: 60,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'rate_limited',
        message: 'Too many requests. Please slow down.',
    },
});
app.use(limiter);

app.use('/v1', healthRouter);
app.use('/v1', promptRouter);
app.use('/v1', feedbackRouter);
app.use('/v1/admin', adminRouter);

app.get('/', (_req, res) => {
    res.json({
        name: 'Prompt Forge API',
        version: '2.0.0',
        description: 'Transform your ideas into powerful AI prompts',
        endpoints: {
            prompt: 'POST /v1/prompt',
            feedback: 'POST /v1/feedback',
            health: 'GET /v1/health',
            models: 'GET /v1/models',
            admin: '/v1/admin/*',
        },
    });
});

app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
    if (config.mongodb.enabled) {
        try {
            await connectDatabase();
        } catch {
            logger.warn('Starting without database connection');
        }
    }

    const PORT = config.port;
    app.listen(PORT, () => {
        logger.info(
            { port: PORT, env: config.nodeEnv, db: config.mongodb.enabled },
            `🔥 Prompt Forge API v2 running on http://localhost:${PORT}`
        );
    });
}

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

process.on('SIGTERM', () => {
    logger.info('Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    process.exit(0);
});

export { app };
