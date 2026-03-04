'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ThumbsUp, ThumbsDown, Send } from 'lucide-react';

interface FeedbackBarProps {
    messageId?: string;
    conversationId?: string;
    onFeedback?: (rating: number) => void;
}

export default function FeedbackBar({ messageId, conversationId, onFeedback }: FeedbackBarProps) {
    const [rating, setRating] = useState<number | null>(null);
    const [note, setNote] = useState('');
    const [showNote, setShowNote] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleRate = async (value: number) => {
        setRating(value);
        setShowNote(true);
        onFeedback?.(value);

        try {
            await fetch('/api/v1/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageId,
                    conversationId,
                    rating: value,
                }),
            });
        } catch { }
    };

    const handleNote = async () => {
        if (!note.trim()) return;
        setSubmitted(true);
        try {
            await fetch('/api/v1/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messageId,
                    conversationId,
                    rating,
                    note: note.trim(),
                }),
            });
        } catch { }
    };

    if (submitted) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[11px] text-brand-400/40 mt-1"
            >
                Thanks for your feedback!
            </motion.div>
        );
    }

    return (
        <div className="flex items-center gap-2 mt-1">
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleRate(1)}
                className={`p-1 rounded-md transition-colors ${rating === 1 ? 'text-green-400 bg-green-400/10' : 'text-brand-400/30 hover:text-brand-400/60'
                    }`}
                title="Helpful"
            >
                <ThumbsUp className="w-3 h-3" />
            </motion.button>
            <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => handleRate(0)}
                className={`p-1 rounded-md transition-colors ${rating === 0 ? 'text-red-400 bg-red-400/10' : 'text-brand-400/30 hover:text-brand-400/60'
                    }`}
                title="Not helpful"
            >
                <ThumbsDown className="w-3 h-3" />
            </motion.button>

            {showNote && !submitted && (
                <motion.div
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    className="flex items-center gap-1 ml-1"
                >
                    <input
                        type="text"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="Optional note..."
                        className="text-[11px] px-2 py-1 rounded-md bg-brand-950/50 border border-surface-border text-brand-200 placeholder:text-brand-400/30 w-32"
                        onKeyDown={(e) => e.key === 'Enter' && handleNote()}
                    />
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={handleNote}
                        className="p-1 text-brand-400/50 hover:text-brand-400"
                    >
                        <Send className="w-2.5 h-2.5" />
                    </motion.button>
                </motion.div>
            )}
        </div>
    );
}
