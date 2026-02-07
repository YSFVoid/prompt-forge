// ============================================================
// Prompt Forge API - Request Schemas (Zod)
// ============================================================

import { z } from 'zod';

// Prompt generation
export const promptRequestSchema = z.object({
    idea: z.string().min(10).max(5000),
    language: z.enum(['en', 'ar', 'darija']).optional().default('en'),
    sessionId: z.string().optional(),
});
export type PromptRequest = z.infer<typeof promptRequestSchema>;

// Feedback
export const feedbackRequestSchema = z.object({
    promptOutputId: z.string(),
    rating: z.enum(['positive', 'negative']),
    variant: z.enum(['master', 'variantA', 'variantB']).optional(),
    comment: z.string().max(1000).optional(),
});
export type FeedbackRequest = z.infer<typeof feedbackRequestSchema>;

// API Key creation (admin)
export const createApiKeySchema = z.object({
    name: z.string().min(1).max(100),
    permissions: z.array(z.string()).optional().default([]),
    rateLimit: z.number().int().min(1).max(10000).optional().default(100),
    expiresInDays: z.number().int().min(1).max(365).optional(),
});
export type CreateApiKeyRequest = z.infer<typeof createApiKeySchema>;

// Pagination
export const paginationSchema = z.object({
    page: z.coerce.number().int().min(1).optional().default(1),
    limit: z.coerce.number().int().min(1).max(100).optional().default(20),
});
export type PaginationQuery = z.infer<typeof paginationSchema>;

// Conversation query
export const conversationQuerySchema = paginationSchema.extend({
    language: z.enum(['en', 'ar', 'darija']).optional(),
});
export type ConversationQuery = z.infer<typeof conversationQuerySchema>;
