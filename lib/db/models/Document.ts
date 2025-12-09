import mongoose, { Schema, model, models, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
    userId: mongoose.Types.ObjectId;
    fileName: string;
    originalName: string;
    fileSize: number;
    fileType: string;
    storageUrl: string;
    fileHash: string;
    quantumSignature?: string;
    metadata: {
        uploadedAt: Date;
        description?: string;
        category: 'certificate' | 'id' | 'contract' | 'other';
        tags: string[];
    };
    aiAnalysis?: {
        authenticityScore: number;
        riskLevel: 'low' | 'medium' | 'high';
        flags: string[];
        analysisDate: Date;
        aiProvider: string;
        confidence: number;
        processingTime: number;
    };
    verificationStatus: 'pending' | 'verified' | 'failed' | 'flagged';
    verificationCount: number;
    createdAt: Date;
    updatedAt: Date;
}

const DocumentSchema = new Schema<IDocument>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        fileType: {
            type: String,
            required: true,
        },
        storageUrl: {
            type: String,
            required: true,
        },
        fileHash: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        quantumSignature: String,
        metadata: {
            uploadedAt: {
                type: Date,
                default: Date.now,
            },
            description: String,
            category: {
                type: String,
                enum: ['certificate', 'id', 'contract', 'other'],
                default: 'other',
            },
            tags: [String],
        },
        aiAnalysis: {
            authenticityScore: {
                type: Number,
                min: 0,
                max: 100,
            },
            riskLevel: {
                type: String,
                enum: ['low', 'medium', 'high'],
            },
            flags: [String],
            analysisDate: Date,
            aiProvider: String,
            confidence: Number,
            processingTime: Number,
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'verified', 'failed', 'flagged'],
            default: 'pending',
            index: true,
        },
        verificationCount: {
            type: Number,
            default: 0,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes are already defined inline with field definitions using index: true
// Removed duplicate Schema.index() calls to fix Mongoose warnings

export const DocumentModel = models.Document || model<IDocument>('Document', DocumentSchema);
