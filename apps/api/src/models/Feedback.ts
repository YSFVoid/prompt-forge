import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
    outputId: mongoose.Types.ObjectId;
    conversationId?: mongoose.Types.ObjectId;
    rating: number;
    note?: string;
    createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>(
    {
        outputId: { type: Schema.Types.ObjectId, ref: 'PromptOutput', required: true },
        conversationId: { type: Schema.Types.ObjectId, ref: 'Conversation' },
        rating: { type: Number, enum: [0, 1], required: true },
        note: { type: String, maxlength: 1000 },
    },
    { timestamps: true }
);

feedbackSchema.index({ outputId: 1 });

export const Feedback = mongoose.model<IFeedback>('Feedback', feedbackSchema);
