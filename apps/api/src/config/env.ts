// ============================================================
// Prompt Forge API - Environment Configuration
// ============================================================

import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
    PORT: z.string().default('3001').transform(Number),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PUBLIC_MODE: z.string().default('true').transform((v) => v === 'true'),
    MONGODB_URI: z.string().optional(),
    GROQ_API_KEY: z.string().min(1, 'GROQ_API_KEY is required'),
    GROQ_MODEL: z.string().default('llama-3.1-8b-instant'),
    ADMIN_KEY: z.string().optional(),
    CORS_ORIGIN: z.string().default('*'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
    console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
    process.exit(1);
}

export const env = parsed.data;

export const config = {
    port: env.PORT,
    nodeEnv: env.NODE_ENV,
    isProduction: env.NODE_ENV === 'production',
    publicMode: env.PUBLIC_MODE,
    mongodb: {
        uri: env.MONGODB_URI || '',
        enabled: !!env.MONGODB_URI,
    },
    groq: {
        apiKey: env.GROQ_API_KEY,
        model: env.GROQ_MODEL,
    },
    admin: {
        key: env.ADMIN_KEY || '',
        enabled: !!env.ADMIN_KEY,
    },
    cors: {
        origin: env.CORS_ORIGIN,
    },
};
