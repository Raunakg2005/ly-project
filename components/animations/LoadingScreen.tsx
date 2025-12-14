'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Shield } from 'lucide-react';

export default function LoadingScreen() {
    const [isLoading, setIsLoading] = useState(true);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Simulate loading progress
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsLoading(false), 500);
                    return 100;
                }
                return prev + 10;
            });
        }, 150);

        return () => clearInterval(interval);
    }, []);

    return (
        <AnimatePresence>
            {isLoading && (
                <motion.div
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900"
                >
                    {/* Animated background gradients */}
                    <motion.div
                        animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 180, 360],
                        }}
                        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl"
                    />
                    <motion.div
                        animate={{
                            scale: [1.2, 1, 1.2],
                            rotate: [360, 180, 0],
                        }}
                        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl"
                    />

                    <div className="relative z-10 flex flex-col items-center gap-8">
                        {/* Logo with 3D effect */}
                        <motion.div
                            animate={{
                                rotateY: [0, 360],
                                scale: [1, 1.1, 1],
                            }}
                            transition={{
                                rotateY: { duration: 2, repeat: Infinity, ease: 'linear' },
                                scale: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
                            }}
                            className="relative"
                        >
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-2xl">
                                <Shield className="w-14 h-14 text-white" />
                            </div>
                            
                            {/* Glow effect */}
                            <motion.div
                                animate={{
                                    scale: [1, 1.5, 1],
                                    opacity: [0.5, 0.8, 0.5],
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 blur-xl"
                            />
                        </motion.div>

                        {/* Brand name */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                        >
                            <h1 className="text-5xl font-black text-white mb-2">
                                <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                    DocShield
                                </span>
                            </h1>
                            <p className="text-white/60 text-center text-sm">
                                Quantum-Safe Document Verification
                            </p>
                        </motion.div>

                        {/* Progress bar */}
                        <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden backdrop-blur-xl">
                            <motion.div
                                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
                                initial={{ width: '0%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>

                        {/* Loading text */}
                        <motion.p
                            animate={{ opacity: [0.5, 1, 0.5] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                            className="text-white/50 text-sm"
                        >
                            Loading amazing experience...
                        </motion.p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
