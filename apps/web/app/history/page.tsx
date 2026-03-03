'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, MessageSquare, ArrowLeft } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import UserMenu from '@/components/UserMenu';
import Link from 'next/link';

interface ConversationItem {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
}

export default function HistoryPage() {
    const { status } = useSession();
    const router = useRouter();
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') router.push('/signin');
    }, [status, router]);

    useEffect(() => {
        async function load() {
            try {
                const res = await fetch('/api/v1/history');
                if (res.ok) {
                    const data = await res.json();
                    setConversations(data.conversations || []);
                }
            } catch { } finally {
                setLoading(false);
            }
        }
        if (status === 'authenticated') load();
    }, [status]);

    const filtered = conversations.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    if (status !== 'authenticated') return null;

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <main className="flex-1 flex flex-col min-h-screen">
                <header className="h-14 border-b border-surface-border bg-brand-950/30 backdrop-blur-sm px-6 flex items-center justify-between shrink-0">
                    <h2 className="text-sm font-semibold text-brand-100 flex items-center gap-2">
                        <History className="w-4 h-4 text-brand-500" />
                        Conversation History
                    </h2>
                    <UserMenu />
                </header>

                <div className="flex-1 p-6 overflow-y-auto">
                    <div className="max-w-3xl mx-auto">
                        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                            <div className="relative mb-6">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-400/40" />
                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search conversations..."
                                    className="input-field pl-11"
                                />
                            </div>

                            {loading ? (
                                <p className="text-sm text-brand-400/40 text-center py-10">Loading...</p>
                            ) : filtered.length === 0 ? (
                                <div className="text-center py-16">
                                    <MessageSquare className="w-10 h-10 text-brand-400/20 mx-auto mb-3" />
                                    <p className="text-sm text-brand-400/60">No conversations found</p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <AnimatePresence>
                                        {filtered.map((conv, i) => (
                                            <motion.div
                                                key={conv.id}
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ delay: i * 0.03 }}
                                            >
                                                <Link href={`/?c=${conv.id}`}>
                                                    <div className="glass-card px-5 py-4 flex items-center gap-3 group cursor-pointer">
                                                        <MessageSquare className="w-4 h-4 text-brand-400/40 group-hover:text-brand-400 transition-colors shrink-0" />
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm text-brand-200 truncate">{conv.title}</p>
                                                            <p className="text-[11px] text-brand-400/40">
                                                                {new Date(conv.updatedAt).toLocaleDateString()}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </motion.div>
                    </div>
                </div>
            </main>
        </div>
    );
}
