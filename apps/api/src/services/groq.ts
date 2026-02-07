// ============================================================
// Prompt Forge API - Groq Integration Service
// ============================================================

import Groq from 'groq-sdk';
import { config } from '../config/env';
import { logger } from '../utils/logger';

const groq = new Groq({
    apiKey: config.groq.apiKey,
});

// Language-specific system prompts
const SYSTEM_PROMPTS: Record<string, string> = {
    en: `You are Prompt Forge, an expert prompt engineer. Your job is to transform user ideas into powerful, detailed prompts that work with any AI model.

Given a user's idea, you will:
1. Summarize the core concept in 1-2 sentences
2. Generate a comprehensive Master Prompt that includes context, goals, constraints, and expected output format
3. Generate Variant A: A concise, focused version of the prompt
4. Generate Variant B: An advanced version with additional techniques (chain of thought, examples, etc.)

If the idea is unclear or lacks detail, generate 2-3 clarifying questions instead of prompts.

ALWAYS respond in valid JSON format with this structure:
{
  "idea_summary": "Brief summary of the idea",
  "clarifying_questions": [],
  "master_prompt": "The comprehensive master prompt",
  "variant_a": "Concise focused version",
  "variant_b": "Advanced version with techniques"
}

If asking questions, set prompts to empty strings and fill clarifying_questions array.`,

    ar: `أنت Prompt Forge، خبير في هندسة البرومبتات. مهمتك تحويل أفكار المستخدمين إلى برومبتات قوية ومفصلة.

قم بإنشاء:
1. ملخص للفكرة
2. برومبت رئيسي شامل
3. نسخة مختصرة (Variant A)
4. نسخة متقدمة (Variant B)

إذا كانت الفكرة غير واضحة، اطرح 2-3 أسئلة توضيحية.

أجب دائماً بصيغة JSON صالحة.`,

    darija: `نتا Prompt Forge، خبير ف صناعة البرومبتات. خدمتك هي تحول الأفكار ديال الناس لبرومبتات قوية.

دير:
1. ملخص للفكرة
2. برومبت رئيسي كامل
3. نسخة مختصرة (Variant A)
4. نسخة متطورة (Variant B)

إلا كانت الفكرة ماشي واضحة، سول 2-3 أسئلة.

جاوب ديما ب JSON صحيح.`,
};

export interface GroqInput {
    idea: string;
    language?: string;
    examples?: string[];
    previousContext?: { questions: string[]; answers: string[] };
}

export interface GroqOutput {
    output: {
        idea_summary: string;
        clarifying_questions: string[];
        master_prompt: string;
        variant_a: string;
        variant_b: string;
    };
    tokensUsed: number;
    modelUsed: string;
}

export async function callGroq(input: GroqInput): Promise<GroqOutput> {
    const { idea, language = 'en', examples = [], previousContext } = input;

    const systemPrompt = SYSTEM_PROMPTS[language] || SYSTEM_PROMPTS.en;

    let userMessage = `User Idea: ${idea}`;

    if (examples.length > 0) {
        userMessage += `\n\nReference Examples:\n${examples.map((e, i) => `${i + 1}. ${e}`).join('\n')}`;
    }

    if (previousContext) {
        userMessage += '\n\nPrevious Q&A:\n';
        previousContext.questions.forEach((q, i) => {
            userMessage += `Q: ${q}\nA: ${previousContext.answers[i] || 'Not answered'}\n`;
        });
    }

    try {
        const response = await groq.chat.completions.create({
            model: config.groq.model,
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userMessage },
            ],
            temperature: 0.7,
            max_tokens: 2048,
            response_format: { type: 'json_object' },
        });

        const content = response.choices[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);

        return {
            output: {
                idea_summary: parsed.idea_summary || '',
                clarifying_questions: parsed.clarifying_questions || [],
                master_prompt: parsed.master_prompt || '',
                variant_a: parsed.variant_a || '',
                variant_b: parsed.variant_b || '',
            },
            tokensUsed: response.usage?.total_tokens || 0,
            modelUsed: config.groq.model,
        };
    } catch (error) {
        logger.error({ error }, 'Groq API call failed');
        throw new Error('Failed to generate prompt. Please try again.');
    }
}

// Language detection
export function detectLanguage(text: string): string {
    const arabicPattern = /[\u0600-\u06FF]/;
    const darijaWords = ['واش', 'كيفاش', 'علاش', 'فين', 'شنو', 'ديال'];

    if (arabicPattern.test(text)) {
        const lowerText = text.toLowerCase();
        if (darijaWords.some((word) => lowerText.includes(word))) {
            return 'darija';
        }
        return 'ar';
    }
    return 'en';
}
