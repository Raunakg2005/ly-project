// This NextAuth route is not actively used
// The app uses JWT authentication with the FastAPI backend
// This file is kept for future OAuth integration

import { NextResponse } from 'next/server';

export async function GET() {
    return NextResponse.json({
        message: 'NextAuth not configured. Use /api/auth/login endpoint instead.'
    }, { status: 501 });
}

export async function POST() {
    return NextResponse.json({
        message: 'NextAuth not configured. Use /api/auth/login endpoint instead.'
    }, { status: 501 });
}
