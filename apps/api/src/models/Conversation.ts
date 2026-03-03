import mongoose, { Document, Schema } from 'mongoose';

export interface IConversation extends Document {
    userKeyId?: mongoose.Types.ObjectId;
    lang: string;
    consentToTrain: boolean;
    createdAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        userKeyId: { type: Schema.Types.ObjectId, ref: 'ApiKey' },
        lang: { type: String, default: 'en' },
        consentToTrain: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export const Conversation = mongoose.model<IConversation>('Conversation', conversationSchema);
