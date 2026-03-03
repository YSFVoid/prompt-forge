const PROMPT_KEYWORDS = [
    'write a prompt',
    'make a prompt',
    'prompt for',
    'create a prompt',
    'system prompt',
    'act as',
    'برومبت',
    'prompt',
];

export function isPromptIntent(message: string): boolean {
    const lower = message.toLowerCase();
    return PROMPT_KEYWORDS.some((kw) => lower.includes(kw));
}
