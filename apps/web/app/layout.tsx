import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Prompt Forge | AI Prompt Generator',
    description:
        'Transform your ideas into powerful, detailed AI prompts that work with any model. Professional prompt engineering at your fingertips.',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                {/* Animated blob background */}
                <div className="animated-bg">
                    <div className="blob blob-1" />
                    <div className="blob blob-2" />
                    <div className="blob blob-3" />
                </div>
                {/* Main content */}
                <div className="relative z-10">{children}</div>
            </body>
        </html>
    );
}
