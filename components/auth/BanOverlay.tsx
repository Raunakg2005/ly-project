'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Ban, LogOut } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function BanOverlay() {
    const router = useRouter();
    const [isBanned, setIsBanned] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        checkBanStatus();
        
        // Poll ban status every 5 seconds to detect real-time bans
        const interval = setInterval(() => {
            checkBanStatus();
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const checkBanStatus = async () => {
        try {
            const user = await apiClient.getCurrentUser();
            if (user.banned) {
                setIsBanned(true);
            }
        } catch (error: any) {
            if (error?.message && (error.message.includes('BANNED') || error.message.includes('suspended'))) {
                setIsBanned(true);
            }
        } finally {
            setChecking(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (checking) return null;

    return (
        <AnimatePresence>
            {isBanned && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm"
                    style={{ pointerEvents: 'auto' }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900 border-2 border-red-500 rounded-2xl p-8 max-w-md mx-4 shadow-2xl"
                    >
                        <div className="text-center">
                            {/* Ban Icon */}
                            <div className="mb-6 flex justify-center">
                                <div className="p-4 bg-red-500/10 rounded-full border-2 border-red-500">
                                    <Ban className="w-16 h-16 text-red-500" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-3xl font-bold text-red-500 mb-4">
                                Account Suspended
                            </h2>

                            {/* Message */}
                            <p className="text-slate-300 mb-2">
                                Your account has been suspended by an administrator.
                            </p>
                            <p className="text-slate-400 text-sm mb-8">
                                If you believe this is an error, please contact support at{' '}
                                <a href="mailto:support@docshield.com" className="text-emerald-400 hover:underline">
                                    support@docshield.com
                                </a>
                            </p>

                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="w-full px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
