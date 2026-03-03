import { z } from 'zod';

export type SupportedLanguage = 'en' | 'ar' | 'darija';
export const SUPPORTED_LANGUAGES: SupportedLanguage[] = ['en', 'ar', 'darija'];

export const llmOutputSchema = z.object({
    idea_summary: z.string().default(''),
    clarifying_questions: z.array(z.string()).default([]),
    master_prompt: z.string().default(''),
    variant_a: z.string().default(''),
    variant_b: z.string().default(''),
    quality_score: z.number().min(0).max(100).optional(),
});
export type LLMOutput = z.infer<typeof llmOutputSchema>;

export const promptRequestSchema = z.object({
    idea: z.string().min(1, 'Idea is required').max(5000),
    conversationId: z.string().optional(),
    consentToTrain: z.boolean().optional().default(false),
});
export type PromptRequest = z.infer<typeof promptRequestSchema>;

export const feedbackRequestSchema = z.object({
    outputId: z.string().min(1),
    rating: z.union([z.literal(1), z.literal(0)]),
    note: z.string().max(1000).optional(),
});
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

export const createApiKeySchema = z.object({
    name: z.string().min(1).max(100),
    rateLimitPerMin: z.number().int().min(1).max(1000).optional().default(30),
    quotaPerDay: z.number().int().min(1).max(100000).optional().default(500),
});
export type CreateApiKeyRequest = z.infer<typeof createApiKeySchema>;

export interface PromptResponse {
    success: boolean;
    type: 'prompt' | 'needs_more_info';
    conversationId?: string;
    ideaSummary: string;
    clarifyingQuestions: string[];
    masterPrompt: string;
    variantA: string;
    variantB: string;
    qualityScore?: number;
    language: SupportedLanguage;
    metadata?: {
        model: string;
        tokensUsed: number;
        processingTimeMs: number;
    };
}

export interface FeedbackResponse {
    success: boolean;
    id: string;
}

export interface HealthResponse {
    ok: boolean;
    version: string;
    env: string;
}

export interface ErrorResponse {
    success: false;
    error: string;
    message: string;
}

export const ERROR_CODES = {
    INVALID_REQUEST: 'invalid_request',
    UNAUTHORIZED: 'unauthorized',
    FORBIDDEN: 'forbidden',
    RATE_LIMITED: 'rate_limited',
    QUOTA_EXCEEDED: 'quota_exceeded',
    GROQ_BAD_RESPONSE: 'groq_bad_response',
    INTERNAL_ERROR: 'internal_error',
    NOT_FOUND: 'not_found',
} as const;

export const DEFAULTS = {
    RATE_LIMIT_PER_MIN: 30,
    QUOTA_PER_DAY: 500,
} as const;
