'use client';

import { useState } from 'react';
import { Sparkles, Copy, Check, Wand2, Zap, ArrowRight } from 'lucide-react';

import { PromptResponse } from '@prompt-forge/shared';


export default function Home() {
    const [idea, setIdea] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<PromptResponse | null>(null);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'master' | 'variantA' | 'variantB'>('master');
    const [copied, setCopied] = useState(false);

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idea.trim() || loading) return;

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const response = await fetch(`${API_URL}/v1/public/prompt`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idea: idea.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to generate prompt');
            }

            setResult(data);
            setActiveTab('master');
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

    const getCurrentPrompt = () => {
        if (!result) return '';
        switch (activeTab) {
            case 'master': return result.masterPrompt;
            case 'variantA': return result.variantA;
            case 'variantB': return result.variantB;
            default: return result.masterPrompt;
        }
    };

    return (
        <div className="min-h-screen px-4 py-12">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Wand2 className="w-10 h-10 text-purple-400" />
                        <h1 className="text-5xl font-bold text-gradient">Prompt Forge</h1>
                    </div>
                    <p className="text-xl text-gray-400 max-w-2xl mx-auto">
                        Transform your ideas into powerful, detailed prompts that work with any AI model
                    </p>
                </header>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="mb-10">
                    <div className="glass-card p-6">
                        <label className="block text-sm font-medium text-gray-300 mb-3">
                            <Sparkles className="w-4 h-4 inline mr-2" />
                            Describe your idea
                        </label>
                        <textarea
                            value={idea}
                            onChange={(e) => setIdea(e.target.value)}
                            placeholder="e.g., A mobile app that helps users track their daily water intake and sends reminders to stay hydrated..."
                            rows={4}
                            className="w-full mb-4"
                            maxLength={5000}
                        />
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">
                                {idea.length}/5000 characters
                            </span>
                            <button
                                type="submit"
                                disabled={!idea.trim() || loading}
                                className="btn-glow flex items-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <span className="spinner" />
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <Zap className="w-5 h-5" />
                                        Generate Prompts
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>

                {/* Error Message */}
                {error && (
                    <div className="glass-card p-4 mb-8 border-red-500/30 bg-red-500/10">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Results */}
                {result && result.masterPrompt && (
                    <div className="glass-card p-6">
                        {/* Summary */}
                        <div className="mb-6 pb-6 border-b border-purple-500/20">
                            <h2 className="text-lg font-semibold text-purple-300 mb-2">
                                Idea Summary
                            </h2>
                            <p className="text-gray-300">{result.ideaSummary}</p>
                            {result.metadata && (
                                <p className="text-xs text-gray-500 mt-2">
                                    Generated in {result.metadata.processingTimeMs}ms using {result.metadata.modelUsed}
                                </p>
                            )}
                        </div>

                        {/* Tabs */}
                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => setActiveTab('master')}
                                className={`tab-button ${activeTab === 'master' ? 'active' : ''}`}
                            >
                                Master Prompt
                            </button>
                            <button
                                onClick={() => setActiveTab('variantA')}
                                className={`tab-button ${activeTab === 'variantA' ? 'active' : ''}`}
                            >
                                Variant A (Concise)
                            </button>
                            <button
                                onClick={() => setActiveTab('variantB')}
                                className={`tab-button ${activeTab === 'variantB' ? 'active' : ''}`}
                            >
                                Variant B (Advanced)
                            </button>
                        </div>

                        {/* Prompt Display */}
                        <div className="relative">
                            <div className="code-block min-h-[200px]">
                                {getCurrentPrompt()}
                            </div>
                            <button
                                onClick={() => copyToClipboard(getCurrentPrompt())}
                                className="absolute top-3 right-3 p-2 rounded-lg bg-purple-500/20 hover:bg-purple-500/40 transition-colors"
                                title="Copy to clipboard"
                            >
                                {copied ? (
                                    <Check className="w-5 h-5 text-green-400" />
                                ) : (
                                    <Copy className="w-5 h-5 text-purple-300" />
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {/* Clarifying Questions */}
                {result && result.clarifyingQuestions && result.clarifyingQuestions.length > 0 && !result.masterPrompt && (
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-purple-300 mb-4 flex items-center gap-2">
                            <ArrowRight className="w-5 h-5" />
                            Clarifying Questions
                        </h2>
                        <p className="text-gray-400 mb-4">
                            Please provide more details by answering these questions:
                        </p>
                        <ul className="space-y-3">
                            {result.clarifyingQuestions.map((question, index) => (
                                <li key={index} className="flex gap-3 text-gray-300">
                                    <span className="text-purple-400 font-semibold">{index + 1}.</span>
                                    {question}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Footer */}
                <footer className="text-center mt-12 text-gray-500 text-sm">
                    <p>Powered by Groq • Built with Next.js & Express</p>
                </footer>
            </div>
        </div>
    );
}
