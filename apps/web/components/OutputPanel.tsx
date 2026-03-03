'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, ThumbsUp, ThumbsDown, Wand2, MessageSquare } from 'lucide-react';
import Skeleton from './Skeleton';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    type: 'chat' | 'prompt_pack';
    masterPrompt?: string;
    variantA?: string;
    variantB?: string;
}

interface OutputPanelProps {
    messages: ChatMessage[];
    loading: boolean;
}

export default function OutputPanel({ messages, loading }: OutputPanelProps) {
    if (messages.length === 0 && !loading) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="glass-card p-10 text-center flex flex-col items-center justify-center min-h-[300px]"
            >
                <div className="w-14 h-14 rounded-2xl bg-surface border border-surface-border flex items-center justify-center mb-4">
                    <Wand2 className="w-6 h-6 text-brand-500" />
                </div>
                <h3 className="text-base font-semibold text-brand-200 mb-1">Ready to Chat</h3>
                <p className="text-sm text-brand-400/60 max-w-xs">
                    Send a message to start a conversation, or switch to Prompt Mode for prompt engineering.
                </p>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="glass-card p-5 min-h-[300px] max-h-[600px] overflow-y-auto flex flex-col gap-3"
        >
            <AnimatePresence mode="popLayout">
                {messages.map((msg, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                    >
                        {msg.role === 'user' ? (
                            <UserBubble content={msg.content} />
                        ) : msg.type === 'prompt_pack' ? (
                            <PromptPackCard
                                masterPrompt={msg.masterPrompt || ''}
                                variantA={msg.variantA || ''}
                                variantB={msg.variantB || ''}
                            />
                        ) : (
                            <AssistantBubble content={msg.content} />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-4 w-2/3" />
                </motion.div>
            )}
        </motion.div>
    );
}

function UserBubble({ content }: { content: string }) {
    return (
        <div className="flex justify-end">
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-br-md bg-brand-500/15 border border-brand-500/20 text-sm text-brand-100">
                {content}
            </div>
        </div>
    );
}

function AssistantBubble({ content }: { content: string }) {
    return (
        <div className="flex justify-start">
            <div className="max-w-[80%] px-4 py-2.5 rounded-2xl rounded-bl-md bg-surface border border-surface-border text-sm text-brand-200 whitespace-pre-wrap">
                {content}
            </div>
        </div>
    );
}

function PromptPackCard({
    masterPrompt,
    variantA,
    variantB,
}: {
    masterPrompt: string;
    variantA: string;
    variantB: string;
}) {
    const [tab, setTab] = useState<'master' | 'a' | 'b'>('master');
    const [copied, setCopied] = useState(false);

    const tabs = [
        { key: 'master' as const, label: 'Master' },
        { key: 'a' as const, label: 'Variant A' },
        { key: 'b' as const, label: 'Variant B' },
    ];

    const content = tab === 'master' ? masterPrompt : tab === 'a' ? variantA : variantB;

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="w-full rounded-2xl border border-brand-500/20 bg-brand-500/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 border-b border-surface-border">
                <Wand2 className="w-3.5 h-3.5 text-brand-400" />
                <span className="text-xs font-semibold text-brand-300 uppercase tracking-wider">Prompt Pack</span>
            </div>

            <div className="flex gap-1 px-4 pt-3 pb-2">
                {tabs.map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key)}
                        className={`relative px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${tab === t.key ? 'text-brand-100' : 'text-brand-400/50 hover:text-brand-400'
                            }`}
                    >
                        {t.label}
                        {tab === t.key && (
                            <motion.div
                                layoutId="prompt-tab"
                                className="absolute inset-0 rounded-lg bg-surface border border-surface-border"
                                style={{ zIndex: -1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                            />
                        )}
                    </button>
                ))}
                <div className="flex-1" />
                <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={handleCopy}
                    className="p-1.5 rounded-lg hover:bg-surface transition-colors"
                >
                    {copied ? (
                        <Check className="w-3.5 h-3.5 text-green-400" />
                    ) : (
                        <Copy className="w-3.5 h-3.5 text-brand-400/60" />
                    )}
                </motion.button>
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={tab}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="px-4 pb-4"
                >
                    <div className="rounded-xl bg-brand-950/50 border border-surface-border p-4 text-sm text-brand-200 leading-relaxed whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                        {content || 'No content for this variant.'}
                    </div>
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
