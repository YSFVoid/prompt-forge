// ============================================================
// Prompt Forge API - Database Connection
// ============================================================

import mongoose from 'mongoose';
import { config } from '../config/env';
import { logger } from '../utils/logger';

let isConnected = false;

export async function connectDatabase(): Promise<void> {
    if (!config.mongodb.enabled) {
        logger.info('MongoDB disabled, skipping connection');
        return;
    }

    if (isConnected) {
        logger.info('Using existing database connection');
        return;
    }

    try {
        mongoose.set('strictQuery', true);

        await mongoose.connect(config.mongodb.uri, {
            maxPoolSize: 10,
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });

        isConnected = true;
        logger.info('✅ Connected to MongoDB');

        mongoose.connection.on('error', (err) => {
            logger.error({ error: err.message }, 'MongoDB connection error');
        });

        mongoose.connection.on('disconnected', () => {
            isConnected = false;
            logger.warn('MongoDB disconnected');
        });

    } catch (error) {
        logger.error({ error }, '❌ Failed to connect to MongoDB');
        throw error;
    }
}

export async function disconnectDatabase(): Promise<void> {
    if (!isConnected) return;

    await mongoose.disconnect();
    isConnected = false;
    logger.info('Disconnected from MongoDB');
}

export function getConnection() {
    return mongoose.connection;
}
