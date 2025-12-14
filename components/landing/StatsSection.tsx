'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function StatsSection() {
    const [particles, setParticles] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);

    useEffect(() => {
        // Generate particles only on client side to avoid hydration mismatch
        setParticles(
            Array.from({ length: 20 }, () => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
            }))
        );
    }, []);

    const stats = [
        { value: '99.5%', label: 'Accuracy', sublabel: 'AI Detection Rate' },
        { value: '<30s', label: 'Processing', sublabel: 'Average Analysis Time' },
        { value: '$0', label: 'API Cost', sublabel: 'Self-Hosted Solution' },
    ];

    return (
        <section className="relative py-20 px-4 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950 overflow-hidden">
            {/* Animated background particles */}
            <div className="absolute inset-0 pointer-events-none">
                {particles.map((particle, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-emerald-500/30 rounded-full"
                        style={{
                            left: `${particle.left}%`,
                            top: `${particle.top}%`,
                        }}
                        animate={{
                            y: [-20, 20, -20],
                            opacity: [0.2, 0.8, 0.2],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                        }}
                    />
                ))}
            </div>

            {/* Gradient orbs */}
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-1/2 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Section header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-4"
                    >
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm font-mono text-emerald-400">PERFORMANCE METRICS</span>
                    </motion.div>
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-100 mb-2">
                        Enterprise-Grade Performance
                    </h2>
                    <p className="text-slate-400">Real-time statistics from our verification engine</p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.15, duration: 0.5 }}
                            whileHover={{ y: -8, scale: 1.02 }}
                            className="relative group"
                        >
                            {/* Gradient border effect */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
                            
                            {/* Card */}
                            <div className="relative p-8 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                                {/* Shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                    animate={{
                                        x: ['-200%', '200%'],
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        repeatDelay: 3,
                                    }}
                                />
                                
                                {/* Content */}
                                <div className="relative">
                                    <motion.div 
                                        className="text-5xl md:text-6xl font-bold mb-3"
                                        whileHover={{ scale: 1.1 }}
                                        transition={{ type: "spring", stiffness: 300 }}
                                    >
                                        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                                            {stat.value}
                                        </span>
                                    </motion.div>
                                    <div className="text-lg md:text-xl font-semibold text-slate-100 mb-2">
                                        {stat.label}
                                    </div>
                                    <div className="text-sm text-slate-400 flex items-center gap-2">
                                        <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                                        {stat.sublabel}
                                    </div>
                                </div>

                                {/* Corner accent */}
                                <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-bl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            
                            {/* Glow effect */}
                            <div className="absolute inset-0 rounded-xl bg-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity -z-10 blur-2xl" />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
