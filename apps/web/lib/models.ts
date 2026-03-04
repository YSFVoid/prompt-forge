import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IConversation extends Document {
    userId: string;
    title: string;
    createdAt: Date;
    updatedAt: Date;
}

const conversationSchema = new Schema<IConversation>(
    {
        userId: { type: String, required: true, index: true },
        title: { type: String, default: 'New Chat' },
    },
    { timestamps: true }
);

export interface IMessage extends Document {
    conversationId: mongoose.Types.ObjectId;
    role: 'user' | 'assistant';
    content: string;
    type: 'chat' | 'prompt_pack';
    masterPrompt?: string;
    variantA?: string;
    variantB?: string;
    createdAt: Date;
}

const messageSchema = new Schema<IMessage>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true, index: true },
        role: { type: String, enum: ['user', 'assistant'], required: true },
        content: { type: String, default: '' },
        type: { type: String, enum: ['chat', 'prompt_pack'], default: 'chat' },
        masterPrompt: { type: String },
        variantA: { type: String },
        variantB: { type: String },
    },
    { timestamps: true }
);

export const Conversation: Model<IConversation> =
    mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', conversationSchema);

export const Message: Model<IMessage> =
    mongoose.models.Message || mongoose.model<IMessage>('Message', messageSchema);

export interface IFeedback extends Document {
    userId: string;
    conversationId?: mongoose.Types.ObjectId;
    messageId?: string;
    rating: number;
    note?: string;
    createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
    {
        userId: { type: String, required: true, index: true },
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
        messageId: { type: String },
        rating: { type: Number, required: true },
        note: { type: String, default: '' },
    },
    { timestamps: true }
);

export interface IArtifact extends Document {
    name: string;
    version: string;
    createdAt: Date;
    metadata: Record<string, any>;
    filePath?: string;
}

const artifactSchema = new Schema<IArtifact>(
    {
        name: { type: String, required: true, index: true },
        version: { type: String, required: true },
        metadata: { type: Schema.Types.Mixed, default: {} },
        filePath: { type: String },
    },
    { timestamps: true }
);

export const Feedback: Model<IFeedback> =
    mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', feedbackSchema);

export const Artifact: Model<IArtifact> =
    mongoose.models.Artifact || mongoose.model<IArtifact>('Artifact', artifactSchema);
