import mongoose, { Document, Schema } from 'mongoose';

export interface IDailyUsage extends Document {
    apiKeyId: mongoose.Types.ObjectId;
    date: string;
    count: number;
}

const dailyUsageSchema = new Schema<IDailyUsage>(
    {
        apiKeyId: { type: Schema.Types.ObjectId, ref: 'ApiKey', required: true },
        date: { type: String, required: true },
        count: { type: Number, default: 0 },
    },
    { timestamps: true }
);

dailyUsageSchema.index({ apiKeyId: 1, date: 1 }, { unique: true });

export const DailyUsage = mongoose.model<IDailyUsage>('DailyUsage', dailyUsageSchema);
