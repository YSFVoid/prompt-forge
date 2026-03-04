import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Feedback } from '@/lib/models';

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email || 'anonymous';

    let body: any;
    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ error: 'invalid_body' }, { status: 400 });
    }

    const { messageId, conversationId, rating, note } = body;
    if (rating === undefined || rating === null) {
        return NextResponse.json({ error: 'rating_required' }, { status: 400 });
    }

    await connectDB();

    await Feedback.create({
        userId,
        conversationId: conversationId || undefined,
        messageId: messageId || undefined,
        rating: Number(rating),
        note: note || '',
    });

    return NextResponse.json({ ok: true });
}
