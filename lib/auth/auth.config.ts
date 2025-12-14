// JWT Authentication Configuration
// Note: This app uses JWT tokens from the FastAPI backend
// NextAuth is currently not in use but kept for future OAuth integration

import { MongoClient } from 'mongodb';

// MongoDB connection for future use
const mongoClientOptions = {
    connectTimeoutMS: 5000,
    serverSelectionTimeoutMS: 5000,
};

const client = new MongoClient(
    process.env.MONGODB_URI || 'mongodb://localhost:27017/docshield',
    mongoClientOptions
);

export const clientPromise = client.connect();

// JWT helper functions for frontend
export const TOKEN_KEY = 'docshield_token';

export const getToken = (): string | null => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = (): void => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
};

export const isAuthenticated = (): boolean => {
    return !!getToken();
};
