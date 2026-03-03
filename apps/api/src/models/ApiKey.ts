import mongoose, { Document, Schema } from 'mongoose';
import * as argon2 from 'argon2';

export interface IApiKey extends Document {
    name: string;
    keyHash: string;
    keyPrefix: string;
    isActive: boolean;
    rateLimitPerMin: number;
    quotaPerDay: number;
    lastUsedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
    validateKey(plainKey: string): Promise<boolean>;
}

const apiKeySchema = new Schema<IApiKey>(
    {
        name: { type: String, required: true },
        keyHash: { type: String, required: true },
        keyPrefix: { type: String, required: true },
        isActive: { type: Boolean, default: true },
        rateLimitPerMin: { type: Number, default: 30 },
        quotaPerDay: { type: Number, default: 500 },
        lastUsedAt: { type: Date },
    },
    { timestamps: true }
);

apiKeySchema.index({ keyPrefix: 1 });
apiKeySchema.index({ isActive: 1 });

apiKeySchema.methods.validateKey = async function (plainKey: string): Promise<boolean> {
    return argon2.verify(this.keyHash, plainKey);
};

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
