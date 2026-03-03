'use client';

import { motion } from 'framer-motion';
import { Wand2, History, Sparkles } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
    { href: '/', icon: Sparkles, label: 'Generator' },
    { href: '/history', icon: History, label: 'History' },
];

export default function Sidebar() {
    const { data: session } = useSession();
    const pathname = usePathname();

    return (
        <aside className="w-64 shrink-0 border-r border-surface-border bg-brand-950/50 backdrop-blur-sm flex flex-col h-screen sticky top-0">
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                        <Wand2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-white">Prompt Forge</h1>
                        <p className="text-[11px] text-brand-400">AI Chat & Prompts</p>
                    </div>
                </div>
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link key={item.href} href={item.href}>
                            <motion.div
                                className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive
                                        ? 'text-white bg-surface'
                                        : 'text-brand-300/60 hover:text-brand-300 hover:bg-surface'
                                    }`}
                                whileHover={{ x: 2 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-brand-500"
                                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <item.icon className="w-4 h-4" />
                                {item.label}
                            </motion.div>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-surface-border">
                {session?.user ? (
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-xs font-semibold text-brand-300">
                            {session.user.name?.[0] || session.user.email?.[0] || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs text-brand-200 truncate">
                                {session.user.name || session.user.email}
                            </p>
                            <button
                                onClick={() => signOut()}
                                className="text-[10px] text-brand-400/60 hover:text-brand-400 transition-colors"
                            >
                                Sign out
                            </button>
                        </div>
                    </div>
                ) : (
                    <Link href="/signin">
                        <div className="flex items-center gap-2 text-xs text-brand-400 hover:text-brand-300 transition-colors">
                            <div className="w-2 h-2 rounded-full bg-yellow-500" />
                            Sign in
                        </div>
                    </Link>
                )}
            </div>
        </aside>
    );
}
