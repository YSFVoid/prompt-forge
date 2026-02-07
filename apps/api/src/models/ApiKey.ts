// ============================================================
// Prompt Forge API - API Key Model
// ============================================================

import mongoose, { Document, Schema } from 'mongoose';
import * as argon2 from 'argon2';

export interface IApiKey extends Document {
    name: string;
    keyHash: string;
    keyPrefix: string;  // First 8 chars for display
    permissions: string[];
    rateLimit: number;
    usageCount: number;
    lastUsedAt?: Date;
    expiresAt?: Date;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    validateKey(plainKey: string): Promise<boolean>;
}

const apiKeySchema = new Schema<IApiKey>(
    {
        name: { type: String, required: true },
        keyHash: { type: String, required: true },
        keyPrefix: { type: String, required: true },
        permissions: [{ type: String }],
        rateLimit: { type: Number, default: 100 },
        usageCount: { type: Number, default: 0 },
        lastUsedAt: { type: Date },
        expiresAt: { type: Date },
        isActive: { type: Boolean, default: true },
    },
    { timestamps: true }
);

apiKeySchema.index({ keyPrefix: 1 });
apiKeySchema.index({ isActive: 1 });

apiKeySchema.methods.validateKey = async function (plainKey: string): Promise<boolean> {
    return argon2.verify(this.keyHash, plainKey);
};

apiKeySchema.statics.hashKey = async function (plainKey: string): Promise<string> {
    return argon2.hash(plainKey);
};

export const ApiKey = mongoose.model<IApiKey>('ApiKey', apiKeySchema);
