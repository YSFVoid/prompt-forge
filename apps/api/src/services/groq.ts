import { config } from '../config/env';
import { logger } from '../utils/logger';
import { llmOutputSchema, type LLMOutput } from '@prompt-forge/shared';

const SYSTEM_PROMPT_EN = `You are PROMPT-FORGE AI. Your ONLY job is to generate prompts from user ideas.
You NEVER solve or implement the idea yourself. You ONLY create prompts that other AIs can use.

## RULES:
1. If the user's message is NOT a clear idea (too vague, random greeting, or single word):
   - Return 2-4 clarifying questions to understand the idea better
   - Leave all prompt fields as empty strings
   - Set quality_score to 0

2. If the user's message IS a clear idea:
   - Write a concise idea_summary (1-2 sentences)
   - Generate master_prompt: a comprehensive, detailed prompt usable with ANY AI model
   - Generate variant_a: concise focused version
   - Generate variant_b: advanced version with chain-of-thought, examples
   - Set quality_score (0-100) based on how well-defined the idea was
   - Leave clarifying_questions as empty array

## OUTPUT FORMAT (strict JSON):
{
  "idea_summary": "string",
  "clarifying_questions": ["string"],
  "master_prompt": "string",
  "variant_a": "string",
  "variant_b": "string",
  "quality_score": 0
}

IMPORTANT: Return ONLY valid JSON. No markdown, no code fences, no extra text.`;

const SYSTEM_PROMPT_AR = `أنت PROMPT-FORGE AI. مهمتك الوحيدة هي توليد بروامبتات من أفكار المستخدمين.
لا تحل أو تنفذ الفكرة أبداً. أنت فقط تصنع بروامبتات يمكن لذكاءات صناعية أخرى استخدامها.

## القواعد:
1. إذا لم تكن رسالة المستخدم فكرة واضحة: أرجع 2-4 أسئلة توضيحية.
2. إذا كانت فكرة واضحة: أنشئ ملخص الفكرة + البروامبت الرئيسي + البديل أ + البديل ب.

أرجع JSON صالح فقط بنفس الهيكل.`;

const SYSTEM_PROMPT_DARIJA = `نتا PROMPT-FORGE AI. الخدمة ديالك الوحيدة هي توليد بروامبتات من أفكار الناس.
ما تحل أو تنفذ الفكرة أبداً. نتا غير كتصاوب بروامبتات لي غادي تستخدمهم ذكاءات صناعية أخرى.

## القواعد:
1. إلا ماكانتش رسالة المستخدم فكرة واضحة: رجع 2-4 أسئلة باش تفهم.
2. إلا كانت فكرة واضحة: صاوب ملخص + البروامبت الرئيسي + البديل أ + البديل ب.

رجع JSON صحيح فقط.`;

function getSystemPrompt(lang: string): string {
    if (lang === 'darija') return SYSTEM_PROMPT_DARIJA;
    if (lang === 'ar') return SYSTEM_PROMPT_AR;
    return SYSTEM_PROMPT_EN;
}

export interface GroqCallResult {
    output: LLMOutput;
    tokensUsed: number;
    model: string;
}

interface GroqApiResponse {
    choices: { message: { content: string } }[];
    usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    model?: string;
}

export async function callGroq(
    idea: string,
    language: string,
    previousContext?: { questions: string[]; answers: string[] }
): Promise<GroqCallResult> {
    let userMessage = idea;

    if (previousContext && previousContext.questions.length > 0) {
        userMessage += '\n\nPrevious clarifying Q&A:\n';
        previousContext.questions.forEach((q, i) => {
            userMessage += `Q: ${q}\nA: ${previousContext.answers[i] || 'Not answered'}\n`;
        });
    }

    const body = {
        model: config.groq.model,
        messages: [
            { role: 'system', content: getSystemPrompt(language) },
            { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
    };

    let parsed = await attemptGroqCall(body);

    if (!parsed) {
        logger.warn('First Groq parse failed, attempting repair retry');
        parsed = await attemptGroqCall(body);
    }

    if (!parsed) {
        throw new GroqBadResponseError('Failed to get valid JSON from Groq after retry');
    }

    return parsed;
}

async function attemptGroqCall(body: object): Promise<GroqCallResult | null> {
    try {
        const response = await fetch(config.groq.baseUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.groq.apiKey}`,
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            logger.error({ status: response.status, body: errorText }, 'Groq API error');

            if (response.status === 429) {
                throw new Error('rate limit');
            }
            throw new GroqBadResponseError(`Groq returned ${response.status}`);
        }

        const data = (await response.json()) as GroqApiResponse;
        const content = data.choices?.[0]?.message?.content || '{}';

        const rawParsed = JSON.parse(content);
        const validated = llmOutputSchema.safeParse(rawParsed);

        if (!validated.success) {
            logger.warn({ errors: validated.error.issues }, 'LLM output validation failed');
            return null;
        }

        return {
            output: validated.data,
            tokensUsed: data.usage?.total_tokens || 0,
            model: data.model || config.groq.model,
        };
    } catch (error) {
        if (error instanceof GroqBadResponseError || (error instanceof Error && error.message === 'rate limit')) {
            throw error;
        }
        logger.error({ error }, 'Groq call failed');
        return null;
    }
}

export class GroqBadResponseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'GroqBadResponseError';
    }
}
