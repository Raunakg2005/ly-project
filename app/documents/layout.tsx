'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import Sidebar from '@/components/layout/Sidebar';
import LoadingScreen from '@/components/animations/LoadingScreen';
import BanOverlay from '@/components/auth/BanOverlay';

export default function DocumentsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const token = apiClient.getToken();
                if (!token) {
                    router.push('/login');
                    return;
                }
                setIsLoading(false);
            } catch (error) {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    // Prevent hydration mismatch
    if (!isMounted) {
        return null;
    }

    if (isLoading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
            <Sidebar />
            <main className="lg:pl-72">
                {children}
            </main>
            <BanOverlay />
        </div>
    );
}
