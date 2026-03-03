import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { connectDB } from '@/lib/mongodb';
import { Conversation, Message } from '@/lib/models';
import { callGroq } from '@/lib/groq';
import { isPromptIntent } from '@/lib/promptDetector';

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

    const { message, conversation_id, mode } = body;
    if (!message || typeof message !== 'string' || message.trim().length === 0) {
        return NextResponse.json({ error: 'message_required' }, { status: 400 });
    }

    const trimmedMessage = message.trim();
    const isPromptMode = mode === 'prompt' || isPromptIntent(trimmedMessage);

    await connectDB();

    let conversation;
    if (conversation_id) {
        conversation = await Conversation.findOne({ _id: conversation_id, userId });
    }
    if (!conversation) {
        const title = trimmedMessage.slice(0, 60) + (trimmedMessage.length > 60 ? '...' : '');
        conversation = await Conversation.create({ userId, title });
    }

    await Message.create({
        conversationId: conversation._id,
        role: 'user',
        content: trimmedMessage,
        type: 'chat',
    });

    const history = await Message.find({ conversationId: conversation._id })
        .sort({ createdAt: 1 })
        .limit(20)
        .lean();

    const groqMessages = history.map((m: any) => ({
        role: m.role as 'user' | 'assistant',
        content: m.role === 'assistant' && m.type === 'prompt_pack'
            ? `[Generated a prompt pack]`
            : m.content,
    }));

    const result = await callGroq(groqMessages, isPromptMode);

    if (result.type === 'prompt_pack') {
        await Message.create({
            conversationId: conversation._id,
            role: 'assistant',
            content: '',
            type: 'prompt_pack',
            masterPrompt: result.master_prompt,
            variantA: result.variant_a,
            variantB: result.variant_b,
        });
    } else {
        await Message.create({
            conversationId: conversation._id,
            role: 'assistant',
            content: result.message,
            type: 'chat',
        });
    }

    return NextResponse.json({
        ...result,
        conversation_id: conversation._id.toString(),
    });
}
