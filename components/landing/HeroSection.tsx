'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Lock, Cpu, CheckCircle, ArrowRight, Terminal } from 'lucide-react';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';

const Hero3DCanvas = dynamic(() => import('@/components/three/Hero3DCanvas'), { ssr: false });

export default function HeroSection() {
    const [particles, setParticles] = useState<Array<{ left: number; top: number; duration: number; delay: number }>>([]);

    useEffect(() => {
        // Generate particles only on client side to avoid hydration mismatch
        setParticles(
            Array.from({ length: 30 }, () => ({
                left: Math.random() * 100,
                top: Math.random() * 100,
                duration: 3 + Math.random() * 2,
                delay: Math.random() * 2,
            }))
        );
    }, []);

    return (
        <section className="relative min-h-screen flex items-center justify-center px-4 py-20 md:pt-24 overflow-hidden">
            {/* 3D Security Scene */}
            <Hero3DCanvas />

            {/* Matrix-style grid background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08)_0%,transparent_65%)]" />
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(16,185,129,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.05) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Animated corner accents */}
            <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute top-32 left-8 w-32 h-32 border-l-2 border-t-2 border-emerald-500/30"
            />
            <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                className="absolute bottom-32 right-8 w-32 h-32 border-r-2 border-b-2 border-emerald-500/30"
            />

            <div className="max-w-6xl mx-auto relative z-10">
                {/* System Status Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex items-center justify-center gap-3 mb-8"
                >
                    <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-sm font-mono text-emerald-400">SYSTEM ONLINE</span>
                    </div>
                    <div className="px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700">
                        <span className="text-sm font-mono text-slate-400">v0.3.0</span>
                    </div>
                </motion.div>

                {/* Main Headline */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="text-center mb-4 md:mb-6"
                >
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6 leading-tight">
                        <span className="text-slate-100">Quantum-Safe</span>
                        <br />
                        <span className="text-emerald-400">Document Verification</span>
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed px-4">
                        Enterprise-grade document security powered by post-quantum cryptography 
                        and AI analysis. Zero trust, zero compromise.
                    </p>
                </motion.div>

                {/* Feature Pills */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="flex flex-wrap items-center justify-center gap-3 mb-12"
                >
                    {[
                        { icon: Shield, text: 'NIST Quantum-Resistant' },
                        { icon: Lock, text: 'End-to-End Encrypted' },
                        { icon: Cpu, text: 'AI-Powered Analysis' },
                    ].map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800/50 border border-slate-700/50 hover:border-emerald-500/50 transition-colors"
                        >
                            <item.icon className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm text-slate-400">{item.text}</span>
                        </div>
                    ))}
                </motion.div>

                {/* CTA Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-3 md:gap-4 mb-8 md:mb-12"
                >
                    <Link href="/login">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="group w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                        >
                            <Terminal className="w-4 h-4 md:w-5 md:h-5" />
                            <span className="text-sm md:text-base">Start Verification</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </Link>
                    <Link href="#features">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full sm:w-auto px-6 md:px-8 py-3 md:py-4 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-slate-200 font-semibold transition-all text-sm md:text-base"
                        >
                            View Documentation
                        </motion.button>
                    </Link>
                </motion.div>
            </div>

            {/* Scanning lines */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"
                    animate={{
                        y: ['0%', '100%'],
                    }}
                    transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: 'linear',
                    }}
                />
                <motion.div
                    className="absolute h-full w-0.5 bg-gradient-to-b from-transparent via-emerald-500 to-transparent opacity-30"
                    animate={{
                        x: ['0%', '100%'],
                    }}
                    transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: 'linear',
                        delay: 2,
                    }}
                />
            </div>

            {/* Floating particles */}
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
                            y: [-20, 20],
                            opacity: [0, 1, 0],
                        }}
                        transition={{
                            duration: particle.duration,
                            repeat: Infinity,
                            delay: particle.delay,
                        }}
                    />
                ))}
            </div>

            {/* Data stream effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={`stream-${i}`}
                        className="absolute w-px h-20 bg-gradient-to-b from-emerald-500/0 via-emerald-500/50 to-emerald-500/0"
                        style={{
                            left: `${20 + i * 15}%`,
                        }}
                        animate={{
                            y: ['-100%', '200%'],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: 'linear',
                            delay: i * 0.4,
                        }}
                    />
                ))}
            </div>
        </section>
    );
}
