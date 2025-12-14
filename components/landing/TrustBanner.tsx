'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Database, FileCheck } from 'lucide-react';

export default function TrustBanner() {
    const features = [
        { icon: Shield, text: 'SHA-3 Hashing', color: 'from-blue-500 to-cyan-500' },
        { icon: Lock, text: 'Post-Quantum Cryptography', color: 'from-emerald-500 to-green-500' },
        { icon: Database, text: 'Zero-Knowledge Architecture', color: 'from-purple-500 to-pink-500' },
        { icon: FileCheck, text: 'GDPR Compliant', color: 'from-orange-500 to-red-500' },
    ];

    return (
        <section className="relative py-12 px-4 bg-slate-900/80 border-y border-slate-800/50 backdrop-blur-sm overflow-hidden">
            {/* Animated scan line */}
            <motion.div
                className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-emerald-500 to-transparent"
                animate={{ x: ['-100%', '100%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
            />

            <div className="max-w-6xl mx-auto relative z-10">
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="text-center mb-8"
                >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">Security Standards</span>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {features.map((item, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            whileHover={{ scale: 1.05, y: -5 }}
                            className="relative group"
                        >
                            <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-emerald-500/50 transition-all backdrop-blur-sm">
                                <div className="flex items-center gap-3">
                                    <motion.div
                                        whileHover={{ rotate: 360 }}
                                        transition={{ duration: 0.6 }}
                                        className={`w-10 h-10 rounded-lg bg-gradient-to-br ${item.color} p-2 flex items-center justify-center shadow-lg`}
                                    >
                                        <item.icon className="w-full h-full text-white" />
                                    </motion.div>
                                    <span className="text-sm font-medium text-slate-300 group-hover:text-emerald-400 transition-colors">
                                        {item.text}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-lg bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10" />
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Bottom scan line */}
            <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent"
                animate={{ x: ['100%', '-100%'] }}
                transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
            />
        </section>
    );
}
