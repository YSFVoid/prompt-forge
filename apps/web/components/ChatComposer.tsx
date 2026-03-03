'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Send } from 'lucide-react';
import ModeToggle from './ModeToggle';

interface ChatComposerProps {
    onSend: (message: string, mode: 'chat' | 'prompt') => void;
    loading: boolean;
}

export default function ChatComposer({ onSend, loading }: ChatComposerProps) {
    const [text, setText] = useState('');
    const [mode, setMode] = useState<'chat' | 'prompt'>('chat');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const autoResize = useCallback(() => {
        const el = textareaRef.current;
        if (!el) return;
        el.style.height = 'auto';
        el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }, []);

    useEffect(() => { autoResize(); }, [text, autoResize]);

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!text.trim() || loading) return;
        onSend(text.trim(), mode);
        setText('');
        if (textareaRef.current) textareaRef.current.style.height = 'auto';
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card p-5"
        >
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-brand-400 uppercase tracking-wider">Compose</h3>
                <ModeToggle mode={mode} onChange={setMode} />
            </div>

            <form onSubmit={handleSubmit}>
                <textarea
                    ref={textareaRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={mode === 'prompt' ? 'Describe the prompt you need...' : 'Type a message...'}
                    rows={3}
                    maxLength={5000}
                    className="input-field mb-3"
                    disabled={loading}
                />

                <div className="flex items-center justify-between">
                    <span className="text-[11px] text-brand-400/40">{text.length}/5000</span>
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: '0 0 30px rgba(124,58,237,0.35)' }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={!text.trim() || loading}
                        className="btn-primary flex items-center gap-2"
                    >
                        {loading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                Thinking...
                            </>
                        ) : (
                            <>
                                <Send className="w-3.5 h-3.5" />
                                Send
                            </>
                        )}
                    </motion.button>
                </div>
            </form>
        </motion.div>
    );
}
