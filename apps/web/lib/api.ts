const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function getApiKey(): string {
    if (typeof window === 'undefined') return '';
    return localStorage.getItem('pf_api_key') || '';
}

export function setApiKey(key: string) {
    localStorage.setItem('pf_api_key', key);
}

export function getStoredApiKey(): string {
    return getApiKey();
}

async function apiFetch(path: string, options: RequestInit = {}) {
    const apiKey = getApiKey();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (apiKey) {
        headers['x-api-key'] = apiKey;
    }

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    const data = await response.json();

    if (!response.ok) {
        throw new ApiError(data.error || 'unknown_error', data.message || 'Something went wrong', response.status);
    }

    return data;
}

export class ApiError extends Error {
    constructor(
        public code: string,
        message: string,
        public status: number
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

export async function generatePrompt(idea: string, conversationId?: string, consentToTrain = false) {
    return apiFetch('/v1/prompt', {
        method: 'POST',
        body: JSON.stringify({ idea, conversationId, consentToTrain }),
    });
}

export async function submitFeedback(outputId: string, rating: 1 | 0, note?: string) {
    return apiFetch('/v1/feedback', {
        method: 'POST',
        body: JSON.stringify({ outputId, rating, note }),
    });
}

export async function checkHealth() {
    return apiFetch('/v1/health');
}
