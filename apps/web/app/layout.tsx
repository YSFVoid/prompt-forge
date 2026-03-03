import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Providers from '@/components/Providers';
import BackgroundBlobs from '@/components/BackgroundBlobs';
import NoiseOverlay from '@/components/NoiseOverlay';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
    title: 'Prompt Forge | AI Chat & Prompt Engineering',
    description: 'A premium AI chatbot specialized in prompt engineering. Chat naturally or generate powerful prompts for any AI model.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" className={inter.variable}>
            <body className="font-sans">
                <Providers>
                    <BackgroundBlobs />
                    <NoiseOverlay />
                    <div className="relative z-10">{children}</div>
                </Providers>
            </body>
        </html>
    );
}
