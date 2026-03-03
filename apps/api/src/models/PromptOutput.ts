import mongoose, { Document, Schema } from 'mongoose';

export interface IPromptOutput extends Document {
    conversationId: mongoose.Types.ObjectId;
    ideaSummary: string;
    masterPrompt: string;
    variantA: string;
    variantB: string;
    modelUsed: string;
    usage: { promptTokens?: number; completionTokens?: number; totalTokens?: number };
    qualityScore?: number;
    createdAt: Date;
}

const promptOutputSchema = new Schema<IPromptOutput>(
    {
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation', required: true },
        ideaSummary: { type: String, default: '' },
        masterPrompt: { type: String, default: '' },
        variantA: { type: String, default: '' },
        variantB: { type: String, default: '' },
        modelUsed: { type: String, required: true },
        usage: {
            promptTokens: Number,
            completionTokens: Number,
            totalTokens: Number,
        },
        qualityScore: { type: Number },
    },
    { timestamps: true }
);

promptOutputSchema.index({ conversationId: 1 });

export const PromptOutput = mongoose.model<IPromptOutput>('PromptOutput', promptOutputSchema);
