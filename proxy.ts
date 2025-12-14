import { NextRequest, NextResponse } from 'next/server';

export default async function middleware(request: NextRequest) {
    // Disabled session-based auth check since we're using JWT tokens in localStorage
    // Client-side components will handle auth checks
    
    /* 
    const session = await auth();

    // Protected routes - require authentication
    const protectedPaths = ['/dashboard', '/admin', '/verifier', '/user'];
    const isProtectedPath = protectedPaths.some((path) =>
        request.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath && !session) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
        return NextResponse.redirect(loginUrl);
    }
    */

    /* 
    // Role-based access control
    if (session?.user) {
        const userRole = session.user.role;

        // Admin-only routes
        if (request.nextUrl.pathname.startsWith('/admin') && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard/user', request.url));
        }

        // Verifier-only routes
        if (request.nextUrl.pathname.startsWith('/verifier') && userRole !== 'verifier' && userRole !== 'admin') {
            return NextResponse.redirect(new URL('/dashboard/user', request.url));
        }

        // Redirect logged-in users away from auth pages
        if (request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register')) {
            return NextResponse.redirect(new URL(`/dashboard/${userRole}`, request.url));
        }
    }
    */

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
