'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import BannedOverlay from '@/components/ui/BannedOverlay';
import { useBanCheck } from '@/hooks/useBanCheck';
import LoadingScreen from '@/components/animations/LoadingScreen';

const pagesWithSidebar = ['/dashboard', '/documents', '/upload', '/profile', '/verifier', '/admin', '/settings'];

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const { isBanned, loading } = useBanCheck();
    const showSidebar = pagesWithSidebar.some(path => pathname?.startsWith(path));

    // Show ban overlay for protected routes
    if (showSidebar) {
        if (loading) return <LoadingScreen />;
        if (isBanned) return <BannedOverlay />;

        return (
            <div className="flex min-h-screen bg-slate-950 w-full">
                <Sidebar />
                <main className="flex-1 min-w-0 w-full overflow-auto">
                    {children}
                </main>
            </div>
        );
    }

    return <>{children}</>;
}
