'use client';

import { useSession, signOut } from 'next-auth/react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';

export default function UserMenu() {
    const { data: session } = useSession();
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    if (!session?.user) {
        return (
            <Link href="/signin">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="btn-primary text-xs"
                >
                    Sign in
                </motion.button>
            </Link>
        );
    }

    return (
        <div ref={ref} className="relative">
            <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setOpen(!open)}
                className="w-9 h-9 rounded-full bg-brand-800 border border-surface-border flex items-center justify-center text-sm font-semibold text-brand-200 transition-all hover:border-surface-border-hover"
            >
                {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                    session.user.name?.[0] || session.user.email?.[0] || '?'
                )}
            </motion.button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-56 rounded-2xl border border-surface-border bg-brand-950/95 backdrop-blur-xl shadow-xl overflow-hidden z-50"
                    >
                        <div className="px-4 py-3 border-b border-surface-border">
                            <p className="text-sm text-brand-100 truncate">{session.user.name || 'User'}</p>
                            <p className="text-[11px] text-brand-400/60 truncate">{session.user.email}</p>
                        </div>
                        <button
                            onClick={() => signOut()}
                            className="w-full flex items-center gap-2 px-4 py-3 text-sm text-brand-300/80 hover:text-brand-200 hover:bg-surface transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            Sign out
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
