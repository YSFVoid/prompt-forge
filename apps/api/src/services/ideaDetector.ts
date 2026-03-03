const EN_IDEA_WORDS = [
    'app', 'website', 'tool', 'system', 'platform', 'service', 'bot',
    'dashboard', 'api', 'game', 'plugin', 'extension', 'script',
    'create', 'build', 'make', 'develop', 'design', 'implement',
    'automate', 'generate', 'track', 'manage', 'monitor', 'analyze',
    'i want', 'i need', 'i would like', 'can you', 'help me',
    'idea for', 'concept for', 'project', 'startup', 'business',
    'mobile', 'web', 'desktop', 'saas', 'ecommerce', 'e-commerce',
    'ai', 'machine learning', 'chatbot', 'workflow', 'automation',
    'prompt for', 'prompt that', 'prompt to', 'write a prompt',
    'generate a prompt', 'craft a prompt',
];

const AR_IDEA_WORDS = [
    'تطبيق', 'موقع', 'نظام', 'منصة', 'خدمة', 'بوت', 'أداة',
    'أريد', 'أحتاج', 'ساعدني', 'فكرة', 'مشروع',
    'إنشاء', 'بناء', 'تصميم', 'تطوير', 'أتمتة',
];

const DA_IDEA_WORDS = [
    'بغيت', 'خصني', 'عاوني', 'فكرة', 'مشروع',
    'تطبيق', 'موقع', 'نظام', 'خدمة', 'بوت',
    'دير', 'صاوب', 'خدم',
];

const GOAL_MARKERS = [
    'that', 'which', 'to', 'for', 'so that', 'in order to',
    'باش', 'بحيث', 'حتى', 'عشان', 'لكي',
];

export function isIdea(text: string): boolean {
    const trimmed = text.trim();
    if (trimmed.length < 15) return false;

    const lower = trimmed.toLowerCase();
    const hasGoalMarker = GOAL_MARKERS.some((m) => lower.includes(m));
    const allKeywords = [...EN_IDEA_WORDS, ...AR_IDEA_WORDS, ...DA_IDEA_WORDS];
    const matchCount = allKeywords.filter((kw) => lower.includes(kw)).length;

    if (hasGoalMarker && matchCount >= 1) return true;
    if (matchCount >= 2) return true;
    if (trimmed.length >= 50 && matchCount >= 1) return true;
    if (trimmed.length >= 100) return true;

    return false;
}

export function detectLanguage(text: string): 'en' | 'ar' | 'darija' {
    const arabicPattern = /[\u0600-\u06FF]/;
    const darijaWords = ['واش', 'كيفاش', 'علاش', 'فين', 'شنو', 'ديال', 'بغيت', 'خصني', 'عاوني'];

    if (arabicPattern.test(text)) {
        const lowerText = text.toLowerCase();
        if (darijaWords.some((word) => lowerText.includes(word))) {
            return 'darija';
        }
        return 'ar';
    }
    return 'en';
}
