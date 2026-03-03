'use client';

export default function BackgroundBlobs() {
    return (
        <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div
                className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full animate-blob-1"
                style={{
                    background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    willChange: 'transform',
                }}
            />
            <div
                className="absolute -bottom-40 -right-40 w-[500px] h-[500px] rounded-full animate-blob-2"
                style={{
                    background: 'radial-gradient(circle, rgba(59,7,100,0.2) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    willChange: 'transform',
                }}
            />
            <div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] rounded-full animate-blob-3"
                style={{
                    background: 'radial-gradient(circle, rgba(109,40,217,0.12) 0%, transparent 70%)',
                    filter: 'blur(80px)',
                    willChange: 'transform',
                }}
            />
        </div>
    );
}
