// ============================================================
// Prompt Forge - Shared Types
// ============================================================

// Language Support
export type SupportedLanguage = 'en' | 'ar' | 'darija';

// API Request/Response Types
export interface PromptRequest {
    idea: string;
    conversationId?: string;
    consentToTrain?: boolean;
    outputFormat?: 'json' | 'text' | 'both';
}

export interface PromptResponse {
    success: boolean;
    conversationId?: string;
    ideaSummary: string;
    clarifyingQuestions: string[];
    masterPrompt: string;
    variantA: string;
    variantB: string;
    language: SupportedLanguage;
    metadata?: {
        ideaScore?: number;
        qualityScore?: number;
        modelUsed?: string;
        tokensUsed?: number;
        processingTimeMs?: number;
    };
}

export interface FeedbackRequest {
    promptOutputId: string;
    rating: 'positive' | 'negative';
    selectedVariant?: 'master' | 'a' | 'b';
    note?: string;
}

export interface HealthResponse {
    status: 'healthy' | 'degraded' | 'unhealthy';
    service: string;
    version: string;
    mode?: string;
    timestamp: string;
    services?: {
        database?: boolean;
        engine?: boolean;
        groq?: boolean;
    };
}

export interface ErrorResponse {
    error: string;
    message: string;
    status?: number;
}

// LLM Output Structure
export interface LLMOutput {
    idea_summary: string;
    clarifying_questions: string[];
    master_prompt: string;
    variant_a: string;
    variant_b: string;
}

// Constants
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'ar', 'darija'];

export const ERROR_CODES = {
    INVALID_REQUEST: 'invalid_request',
    UNAUTHORIZED: 'unauthorized',
    RATE_LIMITED: 'rate_limited',
    QUOTA_EXCEEDED: 'quota_exceeded',
    INTERNAL_ERROR: 'internal_error',
    SERVICE_UNAVAILABLE: 'service_unavailable',
} as const;

export const RATE_LIMITS = {
    GLOBAL_RPM: 100,
    PER_KEY_RPM: 30,
    DAILY_QUOTA_DEFAULT: 500,
} as const;
