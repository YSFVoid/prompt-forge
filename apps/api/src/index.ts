// ============================================================
// Prompt Forge API - Main Entry Point
// ============================================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

import { config } from './config/env';
import { logger } from './utils/logger';
import { connectDatabase } from './db';
import { publicRouter, healthRouter, adminRouter, feedbackRouter } from './routes';
import { errorHandler, notFoundHandler } from './middleware';

// Create Express app
const app = express();

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', 1);

// Security middleware
app.use(helmet());

// CORS - allow all origins in public mode
app.use(cors({
    origin: config.publicMode ? '*' : config.cors.origin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-API-Key', 'X-Admin-Key'],
    credentials: !config.publicMode,
}));

// Body parsing
app.use(express.json({ limit: '1mb' }));

// Request logging
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

// Global rate limiter
const limiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 60, // 60 requests per minute
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'rate_limited',
        message: 'Too many requests. Please slow down.',
    },
});
app.use(limiter);

// Routes
app.use('/v1/public', publicRouter);
app.use('/v1', healthRouter);
app.use('/v1/admin', adminRouter);
app.use('/v1/feedback', feedbackRouter);

// Root endpoint
app.get('/', (_req, res) => {
    res.json({
        name: 'Prompt Forge API',
        version: '1.0.0',
        description: 'Transform your ideas into powerful AI prompts',
        mode: config.publicMode ? 'public' : 'authenticated',
        endpoints: {
            generatePrompt: 'POST /v1/public/prompt',
            health: 'GET /v1/health',
            models: 'GET /v1/models',
            feedback: 'POST /v1/feedback',
            admin: '/v1/admin/*',
        },
        documentation: 'https://github.com/prompt-forge/api',
    });
});

// 404 handler
app.use(notFoundHandler);

// Error handler
app.use(errorHandler);

// Start server
async function startServer() {
    // Connect to database if configured
    if (config.mongodb.enabled) {
        try {
            await connectDatabase();
        } catch (error) {
            logger.warn('Starting without database connection');
        }
    }

    const PORT = config.port;

    app.listen(PORT, () => {
        logger.info({
            port: PORT,
            mode: config.publicMode ? 'public' : 'authenticated',
            env: config.nodeEnv,
            database: config.mongodb.enabled ? 'enabled' : 'disabled',
        }, `🚀 Prompt Forge API running on http://localhost:${PORT}`);

        console.log(`
╔══════════════════════════════════════════════════════════════╗
║                    🔥 PROMPT FORGE API 🔥                     ║
╠══════════════════════════════════════════════════════════════╣
║  Server running on: http://localhost:${PORT}                    ║
║  Mode: ${config.publicMode ? 'PUBLIC (no auth required)' : 'AUTHENTICATED          '}                    ║
║  Database: ${config.mongodb.enabled ? 'CONNECTED' : 'DISABLED '}                                   ║
║                                                              ║
║  Endpoints:                                                  ║
║    POST /v1/public/prompt  - Generate prompts                ║
║    POST /v1/feedback       - Submit feedback                 ║
║    GET  /v1/health         - Health check                    ║
║    GET  /v1/models         - List models                     ║
║    /v1/admin/*             - Admin endpoints                 ║
╚══════════════════════════════════════════════════════════════╝
    `);
    });
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    logger.info('Shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    logger.info('Shutting down gracefully...');
    process.exit(0);
});
