const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

const CHAT_SYSTEM = `You are Prompt Forge, a helpful general assistant.
Default language is English. If the user writes in Arabic or Darija, respond in the same language.
Be concise and helpful.
You MUST respond in strict JSON ONLY:
{"type":"chat","message":"your response here"}
No markdown fences, no extra text. Only the JSON object.`;

const PROMPT_SYSTEM = `You are Prompt Forge, an expert prompt engineer.
Your job is to create high-quality AI prompts from user requests.
Include: role, context, goals, constraints, output format, and "ask questions if missing info".
Default language is English. If the user writes Arabic/Darija, respond similarly.
You MUST respond in strict JSON ONLY:
{"type":"prompt_pack","master_prompt":"...","variant_a":"...","variant_b":"..."}
master_prompt = comprehensive, detailed prompt usable with ANY AI model.
variant_a = concise focused version.
variant_b = advanced version with chain-of-thought and examples.
No markdown fences, no extra text. Only the JSON object.`;

interface GroqMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

interface GroqResponse {
    type: 'chat';
    message: string;
} | {
    type: 'prompt_pack';
    master_prompt: string;
    variant_a: string;
    variant_b: string;
}

export async function callGroq(
    messages: GroqMessage[],
    isPromptMode: boolean
): Promise<GroqResponse> {
    const systemPrompt = isPromptMode ? PROMPT_SYSTEM : CHAT_SYSTEM;

    const body = {
        model: GROQ_MODEL,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 2048,
        response_format: { type: 'json_object' },
    };

    let result = await attemptCall(body);
    if (!result) {
        result = await attemptCall(body);
    }
    if (!result) {
        return { type: 'chat', message: 'Sorry, I had trouble generating a response. Please try again.' };
    }
    return result;
}

async function attemptCall(body: object): Promise<GroqResponse | null> {
    try {
        const res = await fetch(GROQ_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${GROQ_API_KEY}`,
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) return null;

        const data = (await res.json()) as any;
        const content = data.choices?.[0]?.message?.content || '{}';
        const parsed = JSON.parse(content);

        if (parsed.type === 'prompt_pack' && parsed.master_prompt) return parsed;
        if (parsed.type === 'chat' && parsed.message) return parsed;
        if (parsed.message) return { type: 'chat', message: parsed.message };
        if (parsed.master_prompt) return { type: 'prompt_pack', master_prompt: parsed.master_prompt, variant_a: parsed.variant_a || '', variant_b: parsed.variant_b || '' };

        return null;
    } catch {
        return null;
    }
}
