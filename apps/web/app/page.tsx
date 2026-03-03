'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UserMenu from '@/components/UserMenu';
import ChatComposer from '@/components/ChatComposer';
import OutputPanel from '@/components/OutputPanel';
import HistoryPanel from '@/components/HistoryPanel';
import Toast, { useToast } from '@/components/Toast';

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    type: 'chat' | 'prompt_pack';
    masterPrompt?: string;
    variantA?: string;
    variantB?: string;
}

export default function Home() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const { toast, showToast, hideToast } = useToast();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [conversationId, setConversationId] = useState<string | undefined>();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/signin');
        }
    }, [status, router]);

    const handleSend = useCallback(async (message: string, mode: 'chat' | 'prompt') => {
        setMessages((prev) => [...prev, { role: 'user', content: message, type: 'chat' }]);
        setLoading(true);

        try {
            const res = await fetch('/api/v1/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, mode, conversation_id: conversationId }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({}));
                throw new Error(err.error || 'Request failed');
            }

            const data = await res.json();
            setConversationId(data.conversation_id);

            if (data.type === 'prompt_pack') {
                setMessages((prev) => [
                    ...prev,
                    {
                        role: 'assistant',
                        content: '',
                        type: 'prompt_pack',
                        masterPrompt: data.master_prompt,
                        variantA: data.variant_a,
                        variantB: data.variant_b,
                    },
                ]);
            } else {
                setMessages((prev) => [
                    ...prev,
                    { role: 'assistant', content: data.message || '', type: 'chat' },
                ]);
            }
        } catch (err) {
            showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
        } finally {
            setLoading(false);
        }
    }, [conversationId, showToast]);

    const handleSelectConversation = useCallback(async (id: string) => {
        try {
            const res = await fetch(`/api/v1/history/${id}`);
            if (!res.ok) return;
            const data = await res.json();
            setConversationId(id);
            setMessages(
                (data.messages || []).map((m: any) => ({
                    role: m.role,
                    content: m.content,
                    type: m.type,
                    masterPrompt: m.masterPrompt,
                    variantA: m.variantA,
                    variantB: m.variantB,
                }))
            );
        } catch { }
    }, []);

    const handleNewChat = useCallback(() => {
        setConversationId(undefined);
        setMessages([]);
    }, []);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (status === 'unauthenticated') return null;

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                <header className="h-14 border-b border-surface-border bg-brand-950/30 backdrop-blur-sm px-6 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-semibold text-brand-100 flex items-center gap-2">
                        <Zap className="w-4 h-4 text-brand-500" />
                        Prompt Generator
                    </h2>
                    <UserMenu />
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
                            <ChatComposer onSend={handleSend} loading={loading} />
                            <OutputPanel messages={messages} loading={loading} />
                        </div>

                        <HistoryPanel
                            onSelect={handleSelectConversation}
                            onNewChat={handleNewChat}
                            activeId={conversationId}
                        />
                    </div>
                </div>
            </main>

            <AnimatePresence>
                {toast && <Toast message={toast.message} type={toast.type} onClose={hideToast} />}
            </AnimatePresence>
        </div>
    );
}
