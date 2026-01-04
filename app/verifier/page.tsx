'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VerifierRoot() {
    const router = useRouter();

    useEffect(() => {
        // Redirect /verifier to /verifier/dashboard
        router.replace('/verifier/dashboard');
    }, [router]);

    return null;
}
