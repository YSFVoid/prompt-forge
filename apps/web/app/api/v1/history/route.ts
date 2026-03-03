import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Conversation } from '@/lib/models';

export async function GET(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email || 'anonymous';

    await connectDB();

    const conversations = await Conversation.find({ userId })
        .sort({ updatedAt: -1 })
        .limit(30)
        .lean();

    return NextResponse.json({
        conversations: conversations.map((c: any) => ({
            id: c._id.toString(),
            title: c.title,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
        })),
    });
}
