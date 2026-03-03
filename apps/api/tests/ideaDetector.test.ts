import { isIdea, detectLanguage } from '../src/services/ideaDetector';

describe('isIdea', () => {
    const positiveIdeas = [
        'I want to build a mobile app that tracks daily water intake',
        'Create a website for managing restaurant reservations online',
        'A tool to automate social media posting and analytics',
        'Build a chatbot that helps users learn programming',
        'I need a dashboard to monitor server performance metrics',
        'Design a platform for freelancers to find projects and manage invoices',
        'An e-commerce website for selling handmade crafts with payment integration',
        'I would like a system that generates weekly reports from database',
        'Write a prompt for a creative story generator that uses multiple genres',
        'Generate a prompt that helps with code review automation',
    ];

    const arabicIdeas = [
        'أريد إنشاء تطبيق لتتبع استهلاك المياه اليومي',
        'تصميم موقع لإدارة حجوزات المطاعم',
        'أحتاج نظام لأتمتة نشر وسائل التواصل الاجتماعي',
        'بناء منصة للمستقلين للبحث عن مشاريع',
    ];

    const darijaIdeas = [
        'بغيت نصاوب تطبيق باش نتبع الماء لي كنشرب كل يوم',
        'خصني موقع باش ندير حجوزات أونلاين',
        'عاوني نصاوب بوت باش يعاون الناس يتعلمو البرمجة',
    ];

    const negativeIdeas = [
        'hello',
        'hi there',
        'what is this?',
        'hmm',
        'ok',
        'thanks',
        'yes',
        'no',
        'test',
        'random text nothing specific',
    ];

    it.each(positiveIdeas)('recognizes English idea: "%s"', (text) => {
        expect(isIdea(text)).toBe(true);
    });

    it.each(arabicIdeas)('recognizes Arabic idea: "%s"', (text) => {
        expect(isIdea(text)).toBe(true);
    });

    it.each(darijaIdeas)('recognizes Darija idea: "%s"', (text) => {
        expect(isIdea(text)).toBe(true);
    });

    it.each(negativeIdeas)('rejects non-idea: "%s"', (text) => {
        expect(isIdea(text)).toBe(false);
    });
});

describe('detectLanguage', () => {
    it('detects English', () => {
        expect(detectLanguage('I want to build an app')).toBe('en');
    });

    it('detects Arabic', () => {
        expect(detectLanguage('أريد إنشاء تطبيق')).toBe('ar');
    });

    it('detects Darija', () => {
        expect(detectLanguage('بغيت نصاوب تطبيق')).toBe('darija');
    });

    it('defaults to English for mixed', () => {
        expect(detectLanguage('Hello world')).toBe('en');
    });
});
