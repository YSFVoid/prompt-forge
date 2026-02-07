// ============================================================
// Prompt Forge API - Prompt Output Model
// ============================================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IPromptOutput extends Document {
    messageId: mongoose.Types.ObjectId;
    masterPrompt: string;
    variantA: string;
    variantB: string;
    ideaSummary: string;
    clarifyingQuestions?: string[];
    modelUsed: string;
    processingTimeMs: number;
    createdAt: Date;
}

const promptOutputSchema = new Schema<IPromptOutput>(
    {
        messageId: {
            type: Schema.Types.ObjectId,
            ref: 'Message',
            required: true,
            index: true
        },
        masterPrompt: { type: String, required: true },
        variantA: { type: String },
        variantB: { type: String },
        ideaSummary: { type: String },
        clarifyingQuestions: [{ type: String }],
        modelUsed: { type: String, required: true },
        processingTimeMs: { type: Number, required: true },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

export const PromptOutput = mongoose.model<IPromptOutput>('PromptOutput', promptOutputSchema);
