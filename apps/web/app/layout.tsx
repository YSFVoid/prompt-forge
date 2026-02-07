import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
    title: 'Prompt Forge | Transform Ideas into Powerful AI Prompts',
    description: 'Generate professional, detailed prompts from your ideas. Works with any AI model.',
    keywords: ['prompt engineering', 'AI prompts', 'GPT', 'Claude', 'LLM'],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="bg-animated-gradient min-h-screen">
                {/* Background orbs */}
                <div className="floating-orb w-96 h-96 bg-purple-600 top-[-200px] left-[-100px]" />
                <div className="floating-orb w-80 h-80 bg-pink-600 bottom-[-150px] right-[-100px]" style={{ animationDelay: '-4s' }} />
                <div className="floating-orb w-64 h-64 bg-blue-600 top-[40%] right-[10%]" style={{ animationDelay: '-2s' }} />

                {/* Main content */}
                <main className="relative z-10">
                    {children}
                </main>
            </body>
        </html>
    );
}
