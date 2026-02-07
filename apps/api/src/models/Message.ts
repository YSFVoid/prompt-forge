// ============================================================
// Prompt Forge API - Message Model
// ============================================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    role: 'user' | 'assistant';
    content: string;
    ideaScore?: number;
    language?: string;
    processingTimeMs?: number;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversationId: {
            type: Schema.Types.ObjectId,
            ref: 'Conversation',
            required: true,
            index: true
        },
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        ideaScore: { type: Number, min: 0, max: 1 },
        language: { type: String },
        processingTimeMs: { type: Number },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

messageSchema.index({ conversationId: 1, createdAt: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
