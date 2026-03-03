import mongoose from 'mongoose';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export async function connectDatabase(): Promise<void> {
    if (!config.mongodb.enabled) {
        logger.info('MongoDB not configured, running without database');
        return;
    }

    try {
        await mongoose.connect(config.mongodb.uri);
        logger.info('Connected to MongoDB');
    } catch (error) {
        logger.error({ error }, 'Failed to connect to MongoDB');
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    await mongoose.disconnect();
}
