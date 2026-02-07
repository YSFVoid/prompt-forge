// ============================================================
// Prompt Forge API - Feedback Model
// ============================================================

import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
    promptOutputId: mongoose.Types.ObjectId;
    rating: 'positive' | 'negative';
    variant?: 'master' | 'variantA' | 'variantB';
    comment?: string;
    createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
    {
        promptOutputId: {
            type: Schema.Types.ObjectId,
            ref: 'PromptOutput',
            required: true,
            index: true
        },
        rating: { type: String, enum: ['positive', 'negative'], required: true },
        variant: { type: String, enum: ['master', 'variantA', 'variantB'] },
        comment: { type: String, maxlength: 1000 },
    },
    { timestamps: { createdAt: true, updatedAt: false } }
);

feedbackSchema.index({ rating: 1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
