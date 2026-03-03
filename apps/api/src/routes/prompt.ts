import { Router, Request, Response } from 'express';
import { promptRequestSchema } from '@prompt-forge/shared';
import { requireApiKey, validateBody } from '../middleware';
import { callGroq, GroqBadResponseError } from '../services/groq';
import { isIdea, detectLanguage } from '../services/ideaDetector';
import { logger } from '../utils/logger';
import { config } from '../config/env';
import { Conversation, Message, PromptOutput } from '../models';

const router = Router();

router.post(
    '/prompt',
    requireApiKey,
    validateBody(promptRequestSchema),
    async (req: Request, res: Response): Promise<void> => {
        const startTime = Date.now();
        const { idea, conversationId, consentToTrain } = req.body;
        const apiKeyDoc = (req as any).apiKeyDoc;

        try {
            const language = detectLanguage(idea);
            const { output, tokensUsed, model } = await callGroq(idea, language);

            const hasPrompts = !!output.master_prompt;
            const type = hasPrompts ? 'prompt' : 'needs_more_info';

            let savedConversationId = conversationId;
            if (config.mongodb.enabled) {
                try {
                    let conv;
                    if (conversationId) {
                        conv = await Conversation.findById(conversationId);
                    }
                    if (!conv) {
                        conv = await Conversation.create({
                            userKeyId: apiKeyDoc?._id,
                            lang: language,
                            consentToTrain: consentToTrain || false,
                        });
                    }
                    savedConversationId = conv._id.toString();

                    await Message.create({
                        conversationId: conv._id,
                        role: 'user',
                        content: idea,
                        lang: language,
                    });

                    if (hasPrompts) {
                        await PromptOutput.create({
                            conversationId: conv._id,
                            ideaSummary: output.idea_summary,
                            masterPrompt: output.master_prompt,
                            variantA: output.variant_a,
                            variantB: output.variant_b,
                            modelUsed: model,
                            usage: { totalTokens: tokensUsed },
                            qualityScore: output.quality_score,
                        });
                    }
                } catch (dbError) {
                    logger.warn({ error: dbError }, 'Failed to persist to DB (non-fatal)');
                }
            }

            res.json({
                success: true,
                type,
                conversationId: savedConversationId,
                ideaSummary: output.idea_summary,
                clarifyingQuestions: output.clarifying_questions,
                masterPrompt: output.master_prompt,
                variantA: output.variant_a,
                variantB: output.variant_b,
                qualityScore: output.quality_score,
                language,
                metadata: {
                    model,
                    tokensUsed,
                    processingTimeMs: Date.now() - startTime,
                },
            });
        } catch (error) {
            if (error instanceof GroqBadResponseError) {
                res.status(502).json({
                    success: false,
                    error: 'groq_bad_response',
                    message: 'Failed to get valid response from AI model',
                });
                return;
            }

            if (error instanceof Error && error.message === 'rate limit') {
                res.status(429).json({
                    success: false,
                    error: 'rate_limited',
                    message: 'AI provider rate limit reached. Please wait.',
                });
                return;
            }

            logger.error({ error }, 'Prompt generation failed');
            res.status(500).json({
                success: false,
                error: 'internal_error',
                message: 'Failed to generate prompt',
            });
        }
    }
);

export default router;
