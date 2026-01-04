'use client';

import { motion } from 'framer-motion';
import { ShieldX, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';

export default function BannedOverlay() {
    const router = useRouter();

    const handleLogout = () => {
        apiClient.removeToken();
        localStorage.removeItem('userRole');
        router.push('/login');
    };

    return (
        <div className="fixed inset-0 z-[9999] bg-slate-950/95 backdrop-blur-xl flex items-center justify-center">
            <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, type: 'spring' }}
                className="max-w-2xl mx-4 text-center"
            >
                {/* Ban Icon */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-red-500/20 border-4 border-red-500/50 mb-8"
                >
                    <ShieldX className="w-16 h-16 text-red-400" />
                </motion.div>

                {/* Message */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Account Banned
                    </h1>
                    <p className="text-xl text-slate-300 mb-8">
                        Your account has been suspended and you cannot access this application.
                    </p>
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 mb-8">
                        <p className="text-red-300 text-lg">
                            If you believe this is a mistake, please contact an administrator for assistance.
                        </p>
                    </div>
                </motion.div>

                {/* Logout Button */}
                <motion.button
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    onClick={handleLogout}
                    className="inline-flex items-center gap-3 px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-slate-700 hover:border-slate-600"
                >
                    <LogOut className="w-5 h-5" />
                    Return to Login
                </motion.button>

                {/* Decorative Elements */}
                <div className="absolute inset-0 -z-10 overflow-hidden">
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            opacity: [0.3, 0.5, 0.3],
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/10 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            opacity: [0.2, 0.4, 0.2],
                        }}
                        transition={{
                            duration: 5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl"
                    />
                </div>
            </motion.div>
        </div>
    );
}
