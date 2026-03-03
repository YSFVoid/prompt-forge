'use client';

import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { Wand2, Mail } from 'lucide-react';

export default function SignInPage() {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleGoogle = () => signIn('google', { callbackUrl: '/' });

    const handleEmail = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setLoading(true);
        try {
            await signIn('email', { email: email.trim(), callbackUrl: '/', redirect: false });
            setEmailSent(true);
        } catch { }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="w-full max-w-sm"
            >
                <div className="glass-card p-8">
                    <div className="flex items-center justify-center mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
                            <Wand2 className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-white text-center mb-1">Welcome to Prompt Forge</h1>
                    <p className="text-sm text-brand-400/60 text-center mb-8">
                        Sign in to start chatting and creating prompts
                    </p>

                    <motion.button
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={handleGoogle}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-surface-border bg-surface text-sm font-medium text-brand-100 hover:bg-surface-hover transition-all mb-4"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Continue with Google
                    </motion.button>

                    <div className="flex items-center gap-3 my-5">
                        <div className="flex-1 h-px bg-surface-border" />
                        <span className="text-[11px] text-brand-400/40 uppercase">or</span>
                        <div className="flex-1 h-px bg-surface-border" />
                    </div>

                    {emailSent ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-center py-4"
                        >
                            <Mail className="w-8 h-8 text-brand-400 mx-auto mb-2" />
                            <p className="text-sm text-brand-200">Check your email for a sign-in link</p>
                            <p className="text-xs text-brand-400/60 mt-1">{email}</p>
                        </motion.div>
                    ) : (
                        <form onSubmit={handleEmail}>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                className="input-field mb-3"
                                required
                            />
                            <motion.button
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                                type="submit"
                                disabled={loading || !email.trim()}
                                className="btn-primary w-full flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <Mail className="w-3.5 h-3.5" />
                                        Send magic link
                                    </>
                                )}
                            </motion.button>
                        </form>
                    )}
                </div>

                <p className="text-[11px] text-brand-400/30 text-center mt-4">
                    By signing in, you agree to our Terms of Service
                </p>
            </motion.div>
        </div>
    );
}
