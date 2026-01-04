'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Ban, LogOut, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function BannedPage() {
    const router = useRouter();

    useEffect(() => {
        // If somehow they're not banned, redirect them
        const checkBanStatus = async () => {
            try {
                const user = await apiClient.getCurrentUser();
                if (!user.banned) {
                    router.push('/dashboard');
                }
            } catch (error) {
                // If error, they're likely not authenticated
            }
        };
        checkBanStatus();
    }, [router]);

    const handleLogout = () => {
        apiClient.removeToken();
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            {/* Grid background */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }} />

            {/* Gradient blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-red-500/10 rounded-full blur-3xl pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative z-10 max-w-md w-full"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-2xl p-8 shadow-2xl">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-full">
                            <Ban className="w-12 h-12 text-red-400" />
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white text-center mb-3">
                        Account Suspended
                    </h1>

                    {/* Message */}
                    <p className="text-slate-400 text-center mb-6">
                        Your account has been suspended by an administrator. You no longer have access to DocShield services.
                    </p>

                    {/* Info box */}
                    <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
                        <div className="flex items-start gap-3">
                            <Mail className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-sm font-medium text-red-400 mb-1">
                                    Need assistance?
                                </p>
                                <p className="text-xs text-slate-400">
                                    If you believe this is a mistake, please contact support at support@docshield.com
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Logout button */}
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium flex items-center justify-center gap-2 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        Return to Home
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
}
