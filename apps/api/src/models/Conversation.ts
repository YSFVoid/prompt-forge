// ============================================================
// Prompt Forge API - Conversation Model
// ============================================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    apiKeyId?: mongoose.Types.ObjectId;
    sessionId: string;
    language: 'en' | 'ar' | 'darija';
    messageCount: number;
    lastActivity: Date;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        apiKeyId: { type: Schema.Types.ObjectId, ref: 'ApiKey' },
        sessionId: { type: String, required: true, index: true },
        language: { type: String, enum: ['en', 'ar', 'darija'], default: 'en' },
        messageCount: { type: Number, default: 0 },
        lastActivity: { type: Date, default: Date.now },
        metadata: { type: Schema.Types.Mixed },
    },
    { timestamps: true }
);

conversationSchema.index({ createdAt: -1 });
conversationSchema.index({ apiKeyId: 1, createdAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
