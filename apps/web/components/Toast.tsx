'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, AlertCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error';
    onClose: () => void;
}

export default function Toast({ message, type = 'success', onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, 3000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 50 }}
            className="fixed bottom-6 right-6 z-50"
        >
            <div className="glass-card flex items-center gap-3 px-4 py-3 border-surface-border-hover">
                {type === 'success' ? (
                    <Check className="w-4 h-4 text-green-400" />
                ) : (
                    <AlertCircle className="w-4 h-4 text-red-400" />
                )}
                <span className="text-sm text-brand-100">{message}</span>
                <button onClick={onClose} className="ml-2 text-brand-400/60 hover:text-brand-400">
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </motion.div>
    );
}

export function useToast() {
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const showToast = (message: string, type: 'success' | 'error' = 'success') => setToast({ message, type });
    const hideToast = () => setToast(null);
    return { toast, showToast, hideToast };
}
