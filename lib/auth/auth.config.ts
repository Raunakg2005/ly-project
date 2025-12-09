import NextAuth, { DefaultSession } from 'next-auth';
import { MongoDBAdapter } from '@auth/mongodb-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';
import connectDB from '@/lib/db/mongodb';
import { User } from '@/lib/db/models/User';
import { verifyPassword } from '@/lib/auth/password';
import { MongoClient } from 'mongodb';

// Extend NextAuth types
declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: 'user' | 'verifier' | 'admin';
            subscription: {
                plan: 'free' | 'premium' | 'enterprise';
                status: 'active' | 'cancelled' | 'expired';
            };
        } & DefaultSession['user'];
    }

    interface User {
        role: 'user' | 'verifier' | 'admin';
        subscription?: {
            plan: 'free' | 'premium' | 'enterprise';
            status: 'active' | 'cancelled' | 'expired';
        };
    }
}

// MongoDB client for adapter
const mongoClientOptions = {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
};

const client = new MongoClient(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/docshield',
    mongoClientOptions
);
const clientPromise = client.connect();

export const { handlers, auth, signIn, signOut } = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Email and password are required');
                }

                await connectDB();

                const user = await User.findOne({ email: credentials.email }).select('+password');

                if (!user || !user.password) {
                    throw new Error('Invalid credentials');
                }

                const isValid = await verifyPassword(credentials.password as string, user.password);

                if (!isValid) {
                    throw new Error('Invalid credentials');
                }

                return {
                    id: user._id.toString(),
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: user.role,
                    subscription: user.subscription,
                };
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || '',
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
        }),
    ],
    session: {
        strategy: 'database',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    pages: {
        signIn: '/login',
        signOut: '/login',
        error: '/login',
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user) {
                session.user.id = user.id;
                session.user.role = (user as any).role || 'user';
                session.user.subscription = (user as any).subscription || {
                    plan: 'free',
                    status: 'active',
                };
            }
            return session;
        },
        async signIn({ user, account }) {
            // Auto-create user profile for OAuth providers
            if (account?.provider === 'google') {
                await connectDB();

                const existingUser = await User.findOne({ email: user.email });

                if (!existingUser) {
                    await User.create({
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: 'user',
                        subscription: {
                            plan: 'free',
                            status: 'active',
                        },
                        profile: {
                            verified: true,
                        },
                        emailVerified: new Date(),
                    });
                }
            }

            return true;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    debug: process.env.NODE_ENV === 'development',
});
