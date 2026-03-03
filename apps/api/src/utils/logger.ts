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
                translateTime: 'SYS:HH:MM:ss',
                ignore: 'pid,hostname',
            },
        },
});
