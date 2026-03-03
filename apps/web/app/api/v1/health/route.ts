import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        ok: true,
        version: '3.0.0',
        name: 'Prompt Forge',
    });
}
