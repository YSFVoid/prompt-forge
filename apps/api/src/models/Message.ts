import mongoose, { Document, Schema } from 'mongoose';

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    role: 'user' | 'assistant';
    content: string;
    lang: string;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, required: true },
        lang: { type: String, default: 'en' },
    },
    { timestamps: true }
);

messageSchema.index({ conversationId: 1 });

export const Message = mongoose.model<IMessage>('Message', messageSchema);
