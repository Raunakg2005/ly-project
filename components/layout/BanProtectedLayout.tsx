'use client';

import { ReactNode } from 'react';
import BannedOverlay from '@/components/ui/BannedOverlay';
import { useBanCheck } from '@/hooks/useBanCheck';
import LoadingScreen from '@/components/animations/LoadingScreen';

interface BanProtectedLayoutProps {
    children: ReactNode;
}

export default function BanProtectedLayout({ children }: BanProtectedLayoutProps) {
    const { isBanned, loading } = useBanCheck();

    if (loading) return <LoadingScreen />;
    if (isBanned) return <BannedOverlay />;

    return <>{children}</>;
}
