import dotenv from 'dotenv';
dotenv.config();

export const config = {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
    isProduction: process.env.NODE_ENV === 'production',

    mongodb: {
        uri: process.env.MONGODB_URI || '',
        enabled: !!process.env.MONGODB_URI,
    },

    groq: {
        apiKey: process.env.GROQ_API_KEY || '',
        model: process.env.DEFAULT_MODEL || 'llama-3.1-8b-instant',
        baseUrl: 'https://api.groq.com/openai/v1/chat/completions',
    },

    admin: {
        key: process.env.ADMIN_KEY || '',
        enabled: !!process.env.ADMIN_KEY,
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },

    rateLimit: {
        defaultPerMin: 30,
        defaultQuotaPerDay: 500,
    },
};
