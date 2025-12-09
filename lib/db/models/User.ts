import mongoose, { Schema, model, models, Document } from 'mongoose';

export interface IUser extends Document {
    email: string;
    password?: string;
    name: string;
    role: 'user' | 'verifier' | 'admin';
    institution?: mongoose.Types.ObjectId;
    subscription: {
        plan: 'free' | 'premium' | 'enterprise';
        status: 'active' | 'cancelled' | 'expired';
        validUntil?: Date;
    };
    profile: {
        phone?: string;
        organization?: string;
        verified: boolean;
    };
    securitySettings: {
        twoFactorEnabled: boolean;
        notificationPreferences: {
            email: boolean;
            push: boolean;
        };
    };
    image?: string;
    emailVerified?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        email: {
            type: String,
            required: [true, 'Email is required'],
            unique: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        password: {
            type: String,
            select: false, // Don't return password by default
        },
        name: {
            type: String,
            required: [true, 'Name is required'],
            trim: true,
        },
        role: {
            type: String,
            enum: ['user', 'verifier', 'admin'],
            default: 'user',
            index: true,
        },
        institution: {
            type: Schema.Types.ObjectId,
            ref: 'Institution',
            index: true,
        },
        subscription: {
            plan: {
                type: String,
                enum: ['free', 'premium', 'enterprise'],
                default: 'free',
            },
            status: {
                type: String,
                enum: ['active', 'cancelled', 'expired'],
                default: 'active',
            },
            validUntil: Date,
        },
        profile: {
            phone: String,
            organization: String,
            verified: {
                type: Boolean,
                default: false,
            },
        },
        securitySettings: {
            twoFactorEnabled: {
                type: Boolean,
                default: false,
            },
            notificationPreferences: {
                email: {
                    type: Boolean,
                    default: true,
                },
                push: {
                    type: Boolean,
                    default: false,
                },
            },
        },
        image: String,
        emailVerified: Date,
    },
    {
        timestamps: true,
    }
);

// Indexes are already defined inline with field definitions using index: true
// Removed duplicate Schema.index() calls to fix Mongoose warnings

export const User = models.User || model<IUser>('User', UserSchema);
