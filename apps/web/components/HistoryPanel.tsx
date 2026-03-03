'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { History, Search, Plus, MessageSquare } from 'lucide-react';

interface ConversationItem {
    id: string;
    title: string;
    updatedAt: string;
}

interface HistoryPanelProps {
    onSelect: (id: string) => void;
    onNewChat: () => void;
    activeId?: string;
}

export default function HistoryPanel({ onSelect, onNewChat, activeId }: HistoryPanelProps) {
    const [conversations, setConversations] = useState<ConversationItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await fetch('/api/v1/history');
            if (res.ok) {
                const data = await res.json();
                setConversations(data.conversations || []);
            }
        } catch { } finally {
            setLoading(false);
        }
    };

    const filtered = conversations.filter((c) =>
        c.title.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card p-5"
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-3.5 h-3.5" />
                    Recent
                </h3>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={onNewChat}
                    className="p-1.5 rounded-lg hover:bg-surface border border-transparent hover:border-surface-border transition-all"
                    title="New chat"
                >
                    <Plus className="w-3.5 h-3.5 text-brand-400" />
                </motion.button>
            </div>

            <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-brand-400/40" />
                <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="input-field pl-9 py-2 text-xs"
                />
            </div>

            <div className="space-y-1 max-h-[250px] overflow-y-auto">
                {loading ? (
                    <p className="text-xs text-brand-400/40 text-center py-4">Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="text-xs text-brand-400/40 text-center py-4">No conversations yet</p>
                ) : (
                    <AnimatePresence>
                        {filtered.slice(0, 10).map((conv) => (
                            <motion.button
                                key={conv.id}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                whileHover={{ x: 2 }}
                                onClick={() => onSelect(conv.id)}
                                className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-left transition-all text-xs ${activeId === conv.id
                                        ? 'bg-surface border border-surface-border-hover text-brand-100'
                                        : 'text-brand-300/60 hover:text-brand-300 hover:bg-surface'
                                    }`}
                            >
                                <MessageSquare className="w-3 h-3 shrink-0" />
                                <span className="truncate">{conv.title}</span>
                            </motion.button>
                        ))}
                    </AnimatePresence>
                )}
            </div>
        </motion.div>
    );
}
