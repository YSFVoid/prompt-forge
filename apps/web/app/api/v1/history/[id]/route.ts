import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Conversation, Message } from '@/lib/models';

export async function GET(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
        return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id || session.user.email || 'anonymous';

    await connectDB();

    const conversation = await Conversation.findOne({ _id: params.id, userId }).lean();
    if (!conversation) {
        return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }

    const messages = await Message.find({ conversationId: params.id })
        .sort({ createdAt: 1 })
        .lean();

    return NextResponse.json({
        conversation: {
            id: (conversation as any)._id.toString(),
            title: (conversation as any).title,
        },
        messages: messages.map((m: any) => ({
            id: m._id.toString(),
            role: m.role,
            content: m.content,
            type: m.type,
            masterPrompt: m.masterPrompt,
            variantA: m.variantA,
            variantB: m.variantB,
            createdAt: m.createdAt,
        })),
    });
}
