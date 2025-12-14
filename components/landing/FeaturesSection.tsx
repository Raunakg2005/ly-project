'use client';

import { motion } from 'framer-motion';
import { Shield, Lock, Brain, Zap, Database, FileCheck, Terminal, Server } from 'lucide-react';

export default function FeaturesSection() {
    const features = [
        {
            icon: Shield,
            title: 'Quantum-Safe Cryptography',
            description: 'NIST-approved post-quantum algorithms protect against future quantum computer attacks.',
            tech: 'Dilithium, Kyber, SHA-3',
            gradient: 'from-emerald-500 to-cyan-500',
            delay: 0
        },
        {
            icon: Brain,
            title: 'AI-Powered Verification',
            description: 'Advanced machine learning models detect document tampering and forgeries with 99.5% accuracy.',
            tech: 'Llama 3.3 70B, Groq',
            gradient: 'from-emerald-500 to-cyan-500',
            delay: 0.1
        },
        {
            icon: Lock,
            title: 'Zero-Knowledge Architecture',
            description: 'Documents never leave your infrastructure. All processing happens locally on your servers.',
            tech: 'End-to-End Encrypted',
            gradient: 'from-emerald-500 to-cyan-500',
            delay: 0.2
        },
        {
            icon: Database,
            title: 'Immutable Audit Trail',
            description: 'Every verification is cryptographically signed and logged in an immutable audit trail.',
            tech: 'MongoDB, SHA-256',
            gradient: 'from-emerald-500 to-cyan-500',
            delay: 0.3
        },
        {
            icon: Zap,
            title: 'Lightning Fast Processing',
            description: 'Analyze documents in under 30 seconds with optimized processing pipelines.',
            tech: 'Python, FastAPI',
            gradient: 'from-emerald-500 to-cyan-500',
            delay: 0.4
        },
        {
            icon: FileCheck,
            title: 'Multi-Format Support',
            description: 'Verify PDFs, images, and Office documents with automatic text extraction.',
            tech: 'OCR, PDF Parser',
            gradient: 'from-emerald-500 to-cyan-500',
            delay: 0.5
        }
    ];

    return (
        <section id="features" className="relative py-24 px-4 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
            {/* Animated background grid */}
            <div className="absolute inset-0">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Floating gradient orbs */}
            <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 8, repeat: Infinity }}
                className="absolute top-20 left-20 w-72 h-72 bg-emerald-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ scale: [1.2, 1, 1.2], opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-20"
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6"
                    >
                        <Terminal className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-mono text-emerald-400 uppercase tracking-wider">Core Features</span>
                    </motion.div>
                    <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-4xl md:text-6xl font-bold mb-6"
                    >
                        <span className="text-slate-100">Enterprise-Grade</span>
                        <br />
                        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                            Security Platform
                        </span>
                    </motion.h2>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto"
                    >
                        Military-grade encryption meets cutting-edge AI for uncompromising document security
                    </motion.p>
                </motion.div>

                {/* Features Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30, scale: 0.9 }}
                            whileInView={{ opacity: 1, y: 0, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: feature.delay }}
                            whileHover={{ y: -10, scale: 1.02 }}
                            className="group relative"
                        >
                            {/* Gradient border glow */}
                            <div className={`absolute -inset-[1px] bg-gradient-to-r ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm`} />
                            
                            {/* Card */}
                            <div className="relative h-full p-8 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-xl overflow-hidden">
                                {/* Shine effect */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                                    animate={{ x: ['-200%', '200%'] }}
                                    transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
                                />
                                
                                {/* Content */}
                                <div className="relative">
                                    {/* Icon with gradient background */}
                                    <motion.div
                                        whileHover={{ rotate: 360, scale: 1.1 }}
                                        transition={{ duration: 0.6, type: "spring" }}
                                        className={`w-16 h-16 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 shadow-2xl flex items-center justify-center`}
                                    >
                                        <feature.icon className="w-full h-full text-white" />
                                    </motion.div>

                                    {/* Title */}
                                    <h3 className="text-xl md:text-2xl font-bold text-slate-100 mb-3 group-hover:text-emerald-400 transition-colors">
                                        {feature.title}
                                    </h3>

                                    {/* Description */}
                                    <p className="text-slate-400 text-sm md:text-base leading-relaxed mb-5">
                                        {feature.description}
                                    </p>

                                    {/* Tech Badge with gradient */}
                                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900/50 border border-slate-700/50 group-hover:border-emerald-500/50 transition-colors">
                                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
                                        <span className="text-xs font-mono text-slate-300 group-hover:text-emerald-400 transition-colors">{feature.tech}</span>
                                    </div>
                                </div>

                                {/* Corner accent */}
                                <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity rounded-bl-full`} />
                                
                                {/* Bottom gradient line */}
                                <motion.div
                                    className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient}`}
                                    initial={{ width: 0 }}
                                    whileInView={{ width: '100%' }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: feature.delay + 0.3 }}
                                />
                            </div>

                            {/* Outer glow effect */}
                            <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-20 transition-opacity -z-10 blur-3xl`} />
                        </motion.div>
                    ))}
                </div>

                {/* Bottom CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mt-20"
                >
                    <motion.div
                        whileHover={{ scale: 1.02, y: -5 }}
                        className="relative group overflow-hidden"
                    >
                        {/* Gradient border */}
                        <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500 via-cyan-500 to-emerald-500 rounded-2xl opacity-75 group-hover:opacity-100 transition-opacity blur-sm" />
                        
                        {/* Content */}
                        <div className="relative flex flex-col sm:flex-row items-center gap-6 p-8 md:p-10 rounded-2xl bg-slate-800/80 backdrop-blur-xl">
                            {/* Animated background */}
                            <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-emerald-500/10"
                                animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                                transition={{ duration: 5, repeat: Infinity }}
                            />
                            
                            {/* Icon */}
                            <motion.div
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                                className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-emerald-500 to-cyan-500 p-4 shadow-2xl flex-shrink-0"
                            >
                                <Server className="w-full h-full text-white" />
                            </motion.div>
                            
                            {/* Text */}
                            <div className="relative text-center sm:text-left flex-1">
                                <h3 className="text-2xl md:text-3xl font-bold text-slate-100 mb-2">
                                    Self-Hosted & <span className="text-emerald-400">Open Source</span>
                                </h3>
                                <p className="text-slate-400 text-base md:text-lg">
                                    Deploy on your own infrastructure. Complete control, zero vendor lock-in.
                                </p>
                            </div>

                            {/* Arrow */}
                            <motion.div
                                animate={{ x: [0, 10, 0] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                                className="text-emerald-400 hidden sm:block"
                            >
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}
