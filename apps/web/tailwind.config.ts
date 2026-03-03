import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['var(--font-inter)', 'system-ui', '-apple-system', 'sans-serif'],
            },
            colors: {
                surface: {
                    DEFAULT: 'rgba(255,255,255,0.04)',
                    hover: 'rgba(255,255,255,0.06)',
                    border: 'rgba(255,255,255,0.08)',
                    'border-hover': 'rgba(255,255,255,0.12)',
                },
                brand: {
                    50: '#f3f0ff',
                    100: '#ede9fe',
                    200: '#ddd6fe',
                    300: '#c4b5fd',
                    400: '#a78bfa',
                    500: '#7c3aed',
                    600: '#6d28d9',
                    700: '#5b21b6',
                    800: '#3b0764',
                    900: '#1e0038',
                    950: '#05010a',
                },
            },
            animation: {
                'blob-1': 'blob1 25s ease-in-out infinite',
                'blob-2': 'blob2 30s ease-in-out infinite',
                'blob-3': 'blob3 20s ease-in-out infinite',
                'fade-in': 'fadeIn 0.35s ease-out',
                'slide-up': 'slideUp 0.35s ease-out',
                'slide-in-right': 'slideInRight 0.3s ease-out',
            },
            keyframes: {
                blob1: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(40px, -60px) scale(1.1)' },
                    '66%': { transform: 'translate(-30px, 30px) scale(0.9)' },
                },
                blob2: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(-50px, 40px) scale(1.15)' },
                    '66%': { transform: 'translate(25px, -35px) scale(0.85)' },
                },
                blob3: {
                    '0%, 100%': { transform: 'translate(0, 0) scale(1)' },
                    '33%': { transform: 'translate(30px, 50px) scale(0.95)' },
                    '66%': { transform: 'translate(-40px, -20px) scale(1.05)' },
                },
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                slideInRight: {
                    '0%': { opacity: '0', transform: 'translateX(16px)' },
                    '100%': { opacity: '1', transform: 'translateX(0)' },
                },
            },
        },
    },
    plugins: [],
};

export default config;
