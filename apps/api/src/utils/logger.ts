// ============================================================
// Prompt Forge API - Logger
// ============================================================

import pino from 'pino';
import { config } from '../config/env';

export const logger = pino({
    level: config.isProduction ? 'info' : 'debug',
    transport: config.isProduction
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
                colorize: true,
                translateTime: 'SYS:standard',
                ignore: 'pid,hostname',
            },
        },
    base: {
        service: 'prompt-forge-api',
        version: '1.0.0',
    },
});
