'use client';

import { useState, useCallback, useEffect } from 'react';
import {
    Wand2, Zap, Copy, Check, ThumbsUp, ThumbsDown,
    History, Key, Shield, Sparkles, ChevronRight, X,
    MessageSquare, Send, AlertCircle
} from 'lucide-react';
import { generatePrompt, submitFeedback, setApiKey, getStoredApiKey, ApiError } from '../lib/api';

// ── Types ──────────────────────────────────────────────────
interface PromptResult {
    type: 'prompt' | 'needs_more_info';
    conversationId?: string;
    ideaSummary: string;
    clarifyingQuestions: string[];
    masterPrompt: string;
    variantA: string;
    variantB: string;
    qualityScore?: number;
    language: string;
    metadata?: { model: string; tokensUsed: number; processingTimeMs: number };
}

interface HistoryItem {
    id: string;
    idea: string;
    masterPrompt: string;
    qualityScore?: number;
    timestamp: number;
}

// ── Main Page ──────────────────────────────────────────────
export default function Home() {
    const [idea, setIdea] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PromptResult | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);
    const [consent, setConsent] = useState(false);
    const [showKeyModal, setShowKeyModal] = useState(false);
    const [apiKeyInput, setApiKeyInput] = useState('');
    const [hasApiKey, setHasApiKey] = useState(false);
    const [history, setHistory] = useState<HistoryItem[]>([]);
    const [feedbackSent, setFeedbackSent] = useState<string | null>(null);
    const [clarifyAnswers, setClarifyAnswers] = useState<string[]>([]);
    const [activeConversationId, setActiveConversationId] = useState<string | undefined>();

    // Load state from localStorage
    useEffect(() => {
        setHasApiKey(!!getStoredApiKey());
        try {
            const saved = localStorage.getItem('pf_history');
            if (saved) setHistory(JSON.parse(saved));
        } catch { }
    }, []);

    // Save history
    const saveHistory = useCallback((items: HistoryItem[]) => {
        const trimmed = items.slice(0, 10);
        setHistory(trimmed);
        localStorage.setItem('pf_history', JSON.stringify(trimmed));
    }, []);

    // Handle prompt submission
    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!idea.trim() || loading) return;

        setLoading(true);
        setError('');
        setResult(null);
        setFeedbackSent(null);
        setClarifyAnswers([]);

        try {
            const data = await generatePrompt(idea.trim(), activeConversationId, consent);
            setResult(data);
            setActiveConversationId(data.conversationId);

            // Add to history if prompt was generated
            if (data.type === 'prompt' && data.masterPrompt) {
                saveHistory([
                    {
                        id: data.conversationId || Date.now().toString(),
                        idea: idea.trim(),
                        masterPrompt: data.masterPrompt,
                        qualityScore: data.qualityScore,
                        timestamp: Date.now(),
                    },
                    ...history,
                ]);
            }
        } catch (err) {
            if (err instanceof ApiError) {
                setError(`${err.message} (${err.code})`);
            } else {
                setError(err instanceof Error ? err.message : 'Something went wrong');
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle clarifying question resubmit
    const handleClarifySubmit = async () => {
        if (!result?.clarifyingQuestions?.length) return;

        const combined = `Original idea: ${idea}\n\nAnswers to clarifying questions:\n${result.clarifyingQuestions
            .map((q, i) => `Q: ${q}\nA: ${clarifyAnswers[i] || 'N/A'}`)
            .join('\n')}`;

        setIdea(combined);
        setLoading(true);
        setError('');
        setResult(null);

        try {
            const data = await generatePrompt(combined, activeConversationId, consent);
            setResult(data);
            setActiveConversationId(data.conversationId);

            if (data.type === 'prompt' && data.masterPrompt) {
                saveHistory([
                    {
                        id: data.conversationId || Date.now().toString(),
                        idea: idea.trim(),
                        masterPrompt: data.masterPrompt,
                        qualityScore: data.qualityScore,
                        timestamp: Date.now(),
                    },
                    ...history,
                ]);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleFeedback = async (rating: 1 | 0) => {
        if (!result?.conversationId) return;
        try {
            await submitFeedback(result.conversationId, rating);
            setFeedbackSent(rating === 1 ? 'positive' : 'negative');
        } catch {
            // Silently fail on feedback
        }
    };

    const handleSaveKey = () => {
        setApiKey(apiKeyInput.trim());
        setHasApiKey(!!apiKeyInput.trim());
        setShowKeyModal(false);
        setApiKeyInput('');
    };

    const loadFromHistory = (item: HistoryItem) => {
        setIdea(item.idea);
        setResult({
            type: 'prompt',
            ideaSummary: '',
            clarifyingQuestions: [],
            masterPrompt: item.masterPrompt,
            variantA: '',
            variantB: '',
            qualityScore: item.qualityScore,
            language: 'en',
        });
    };

    return (
        <div className="min-h-screen flex">
            {/* ── Sidebar ──────────────────────────────── */}
            <aside className="w-64 shrink-0 border-r border-brand-900/30 bg-black/30 backdrop-blur-sm p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-white">Prompt Forge</h1>
                        <p className="text-xs text-brand-400">AI Prompt Generator</p>
                    </div>
                </div>

                <nav className="flex-1 space-y-2">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-900/30 text-brand-300 text-sm font-medium transition-colors hover:bg-brand-900/50">
                        <Sparkles className="w-4 h-4" />
                        Generator
                    </button>
                    <button
                        onClick={() => { }}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 text-sm font-medium transition-colors hover:bg-white/5 hover:text-gray-300"
                    >
                        <History className="w-4 h-4" />
                        History
                    </button>
                </nav>

                {/* Status */}
                <div className="mt-auto pt-6 border-t border-brand-900/30">
                    <div className="flex items-center gap-2 text-xs">
                        <div className={`w-2 h-2 rounded-full ${hasApiKey ? 'bg-green-400' : 'bg-yellow-400'}`} />
                        <span className="text-gray-500">
                            {hasApiKey ? 'API Key Set' : 'No API Key'}
                        </span>
                    </div>
                </div>
            </aside>

            {/* ── Main Area ────────────────────────────── */}
            <main className="flex-1 flex flex-col min-h-screen">
                {/* TopBar */}
                <header className="h-16 border-b border-brand-900/20 bg-black/20 backdrop-blur-sm px-8 flex items-center justify-between shrink-0">
                    <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Zap className="w-5 h-5 text-brand-400" />
                        Prompt Generator
                    </h2>
                    <button
                        onClick={() => setShowKeyModal(true)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-900/30 text-brand-300 text-sm font-medium transition-all hover:bg-brand-900/50 border border-brand-800/30"
                    >
                        <Key className="w-4 h-4" />
                        API Key
                    </button>
                </header>

                {/* Content */}
                <div className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* LEFT: Idea Composer */}
                        <div className="space-y-6 animate-fade-in">
                            <div className="glass-card p-6">
                                <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <MessageSquare className="w-4 h-4" />
                                    Describe Your Idea
                                </h3>
                                <form onSubmit={handleSubmit}>
                                    <textarea
                                        value={idea}
                                        onChange={(e) => setIdea(e.target.value)}
                                        placeholder="e.g., A mobile app that helps users track their daily water intake and sends smart reminders to stay hydrated..."
                                        rows={6}
                                        maxLength={5000}
                                        className="w-full mb-3"
                                    />
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs text-gray-600">{idea.length}/5000</span>
                                            <label className="flex items-center gap-2 text-xs text-gray-500 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={consent}
                                                    onChange={(e) => setConsent(e.target.checked)}
                                                    className="rounded border-brand-800 bg-brand-950 text-brand-500 focus:ring-brand-500"
                                                />
                                                Consent to train
                                            </label>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={!idea.trim() || loading}
                                            className="btn-glow flex items-center gap-2 text-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner" />
                                                    Generating...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Generate
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Error */}
                            {error && (
                                <div className="glass-card p-4 border-red-500/30 bg-red-500/5 animate-slide-up">
                                    <div className="flex items-center gap-2 text-red-400 text-sm">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        {error}
                                    </div>
                                </div>
                            )}

                            {/* Clarifying Questions */}
                            {result?.type === 'needs_more_info' && result.clarifyingQuestions.length > 0 && (
                                <div className="glass-card p-6 animate-slide-up">
                                    <h3 className="text-sm font-semibold text-amber-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                        <ChevronRight className="w-4 h-4" />
                                        Clarifying Questions
                                    </h3>
                                    <p className="text-sm text-gray-400 mb-4">
                                        Please answer these questions to generate a better prompt:
                                    </p>
                                    <div className="space-y-4">
                                        {result.clarifyingQuestions.map((question, index) => (
                                            <div key={index}>
                                                <p className="text-sm text-gray-300 mb-2">
                                                    <span className="text-brand-400 font-semibold">{index + 1}.</span> {question}
                                                </p>
                                                <textarea
                                                    value={clarifyAnswers[index] || ''}
                                                    onChange={(e) => {
                                                        const newAnswers = [...clarifyAnswers];
                                                        newAnswers[index] = e.target.value;
                                                        setClarifyAnswers(newAnswers);
                                                    }}
                                                    placeholder="Your answer..."
                                                    rows={2}
                                                    className="w-full text-sm"
                                                />
                                            </div>
                                        ))}
                                        <button
                                            onClick={handleClarifySubmit}
                                            disabled={loading}
                                            className="btn-glow flex items-center gap-2 text-sm"
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner" />
                                                    Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <Send className="w-4 h-4" />
                                                    Resubmit with Answers
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* RIGHT: Result Card */}
                        <div className="space-y-6 animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            {result?.type === 'prompt' && result.masterPrompt ? (
                                <div className="glass-card p-6 animate-slide-up">
                                    {/* Header with quality score */}
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-semibold text-brand-300 uppercase tracking-wider flex items-center gap-2">
                                            <Sparkles className="w-4 h-4" />
                                            Master Prompt
                                        </h3>
                                        {result.qualityScore != null && result.qualityScore > 0 && (
                                            <span
                                                className={`text-xs font-bold px-3 py-1 rounded-full ${result.qualityScore >= 80
                                                        ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                                                        : result.qualityScore >= 50
                                                            ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                                            : 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                    }`}
                                            >
                                                Quality: {result.qualityScore}%
                                            </span>
                                        )}
                                    </div>

                                    {/* Idea Summary */}
                                    {result.ideaSummary && (
                                        <div className="mb-4 pb-4 border-b border-brand-900/30">
                                            <p className="text-sm text-gray-400 italic">{result.ideaSummary}</p>
                                        </div>
                                    )}

                                    {/* Prompt Content */}
                                    <div className="relative group">
                                        <div className="bg-black/30 rounded-xl p-5 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap max-h-[500px] overflow-y-auto border border-brand-900/20">
                                            {result.masterPrompt}
                                        </div>
                                        <button
                                            onClick={() => copyToClipboard(result.masterPrompt)}
                                            className="absolute top-3 right-3 p-2 rounded-lg bg-brand-900/40 hover:bg-brand-900/70 transition-all opacity-0 group-hover:opacity-100"
                                            title="Copy to clipboard"
                                        >
                                            {copied ? (
                                                <Check className="w-4 h-4 text-green-400" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-brand-300" />
                                            )}
                                        </button>
                                    </div>

                                    {/* Metadata */}
                                    {result.metadata && (
                                        <p className="text-xs text-gray-600 mt-3">
                                            Generated in {result.metadata.processingTimeMs}ms • {result.metadata.model} • {result.metadata.tokensUsed} tokens
                                        </p>
                                    )}

                                    {/* Feedback */}
                                    <div className="mt-4 pt-4 border-t border-brand-900/30 flex items-center gap-3">
                                        <span className="text-xs text-gray-500">Was this helpful?</span>
                                        {feedbackSent ? (
                                            <span className="text-xs text-brand-400 flex items-center gap-1">
                                                <Check className="w-3 h-3" /> Thanks for your feedback!
                                            </span>
                                        ) : (
                                            <>
                                                <button
                                                    onClick={() => handleFeedback(1)}
                                                    className="p-2 rounded-lg hover:bg-green-500/10 transition-colors"
                                                    title="Good"
                                                >
                                                    <ThumbsUp className="w-4 h-4 text-gray-500 hover:text-green-400" />
                                                </button>
                                                <button
                                                    onClick={() => handleFeedback(0)}
                                                    className="p-2 rounded-lg hover:bg-red-500/10 transition-colors"
                                                    title="Bad"
                                                >
                                                    <ThumbsDown className="w-4 h-4 text-gray-500 hover:text-red-400" />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ) : !loading && !result && (
                                <div className="glass-card p-12 text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-brand-900/30 flex items-center justify-center mx-auto mb-4">
                                        <Wand2 className="w-8 h-8 text-brand-500" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-300 mb-2">Ready to Generate</h3>
                                    <p className="text-sm text-gray-500 max-w-sm mx-auto">
                                        Describe your idea in the composer and we'll craft a powerful, detailed prompt for any AI model.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History */}
                    {history.length > 0 && (
                        <div className="max-w-6xl mx-auto mt-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Recent History
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {history.slice(0, 6).map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => loadFromHistory(item)}
                                        className="glass-card p-4 text-left transition-all hover:scale-[1.02]"
                                    >
                                        <p className="text-sm text-gray-300 line-clamp-2 mb-2">{item.idea}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-gray-600">
                                                {new Date(item.timestamp).toLocaleDateString()}
                                            </span>
                                            {item.qualityScore != null && (
                                                <span className="text-xs text-brand-400">{item.qualityScore}%</span>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* ── API Key Modal ────────────────────────── */}
            {showKeyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="glass-card p-8 w-full max-w-md mx-4">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                <Shield className="w-5 h-5 text-brand-400" />
                                API Key
                            </h3>
                            <button
                                onClick={() => setShowKeyModal(false)}
                                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-400 mb-4">
                            Enter your Prompt Forge API key. It will be stored locally in your browser.
                        </p>
                        <input
                            type="password"
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            placeholder="pf_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                            className="w-full px-4 py-3 rounded-xl bg-black/30 border border-brand-900/30 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors mb-4"
                        />
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowKeyModal(false)}
                                className="flex-1 px-4 py-3 rounded-xl border border-brand-900/30 text-gray-400 text-sm font-medium hover:bg-white/5 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveKey}
                                className="flex-1 btn-glow text-sm"
                            >
                                Save Key
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
