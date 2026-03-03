'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Wand2 } from 'lucide-react';

interface ModeToggleProps {
    mode: 'chat' | 'prompt';
    onChange: (mode: 'chat' | 'prompt') => void;
}

export default function ModeToggle({ mode, onChange }: ModeToggleProps) {
    return (
        <div className="inline-flex items-center rounded-xl border border-surface-border bg-brand-950/60 p-1">
            <button
                onClick={() => onChange('chat')}
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors z-10"
                style={{ color: mode === 'chat' ? '#ede9fe' : 'rgba(167,139,250,0.5)' }}
            >
                <MessageSquare className="w-3 h-3" />
                Chat
                {mode === 'chat' && (
                    <motion.div
                        layoutId="mode-pill"
                        className="absolute inset-0 rounded-lg bg-surface border border-surface-border-hover"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                )}
            </button>
            <button
                onClick={() => onChange('prompt')}
                className="relative flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors z-10"
                style={{ color: mode === 'prompt' ? '#ede9fe' : 'rgba(167,139,250,0.5)' }}
            >
                <Wand2 className="w-3 h-3" />
                Prompt
                {mode === 'prompt' && (
                    <motion.div
                        layoutId="mode-pill"
                        className="absolute inset-0 rounded-lg bg-surface border border-surface-border-hover"
                        style={{ zIndex: -1 }}
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                )}
            </button>
        </div>
    );
}
