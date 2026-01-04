import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api/client';

export function useBanCheck() {
    const [isBanned, setIsBanned] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkBanStatus();
    }, []);

    const checkBanStatus = async () => {
        try {
            const user = await apiClient.getCurrentUser();
            setIsBanned((user as any).banned || false);
        } catch (error) {
            // If error, user might not be authenticated
            setIsBanned(false);
        } finally {
            setLoading(false);
        }
    };

    return { isBanned, loading };
}
