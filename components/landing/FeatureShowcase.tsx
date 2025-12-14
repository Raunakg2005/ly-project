'use client';

import { Shield, Lock, Brain, Award, Zap, Globe, Fingerprint, Database, Cloud, FileCheck } from 'lucide-react';
import GlassCard from '../ui/GlassCard';
import ScrollReveal from '../animations/ScrollReveal';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import dynamic from 'next/dynamic';

const Feature3DScene = dynamic(() => import('../three/Feature3DScene'), { ssr: false });

const features = [
    {
        icon: Shield,
        title: 'Quantum-Safe',
        description: 'Future-proof security with post-quantum cryptographic algorithms',
        gradient: 'from-blue-500 to-cyan-500',
        detail: 'NIST-approved algorithms resistant to quantum computer attacks',
    },
    {
        icon: Brain,
        title: 'AI-Powered',
        description: 'Groq Llama 3.3 70B analysis for document authenticity verification',
        gradient: 'from-purple-500 to-pink-500',
        detail: 'Advanced neural networks detect forgeries and manipulations',
    },
    {
        icon: Lock,
        title: '100% Private',
        description: 'All processing happens locally. Your documents never leave your server',
        gradient: 'from-green-500 to-emerald-500',
        detail: 'Zero-knowledge architecture ensures complete data privacy',
    },
    {
        icon: Award,
        title: 'Enterprise Grade',
        description: 'Professional verification for certificates, IDs, contracts, and more',
        gradient: 'from-orange-500 to-red-500',
        detail: 'Trusted by organizations worldwide for critical documents',
    },
    {
        icon: Zap,
        title: 'Lightning Fast',
        description: 'Analyze documents in under 30 seconds with blazing-fast AI',
        gradient: 'from-yellow-500 to-orange-500',
        detail: 'Optimized processing pipeline for instant results',
    },
    {
        icon: Globe,
        title: 'Always Available',
        description: 'Self-hosted solution works 24/7 without dependency on external services',
        gradient: 'from-indigo-500 to-purple-500',
        detail: 'No downtime, no rate limits, complete control',
    },
];

const additionalFeatures = [
    { icon: Fingerprint, text: 'Digital Signature Verification', color: 'text-blue-400' },
    { icon: Database, text: 'Blockchain-Ready Storage', color: 'text-purple-400' },
    { icon: Cloud, text: 'Multi-Cloud Support', color: 'text-cyan-400' },
    { icon: FileCheck, text: 'Batch Processing', color: 'text-green-400' },
];

export default function FeatureShowcase() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: sectionRef,
        offset: ['start end', 'end start'],
    });

    const y = useTransform(scrollYProgress, [0, 1], [100, -100]);
    const opacity = useTransform(scrollYProgress, [0, 0.2, 0.8, 1], [0, 1, 1, 0]);

    return (
        <section ref={sectionRef} id="features" className="relative py-32 px-4 overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                    style={{ y }}
                    className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl"
                />
                <motion.div
                    style={{ y: useTransform(scrollYProgress, [0, 1], [-100, 100]) }}
                    className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"
                />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header with 3D Network */}
                <ScrollReveal className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 mb-6">
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-white/70 uppercase tracking-wider">
                                Advanced Features
                            </span>
                        </div>
                        
                        <h2 className="text-6xl md:text-7xl font-black text-white mb-6 leading-tight">
                            Why Choose{' '}
                            <span className="inline-block bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                                DocShield
                            </span>
                            ?
                        </h2>
                        
                        <p className="text-xl md:text-2xl text-white/70 max-w-3xl mx-auto leading-relaxed">
                            Built with cutting-edge technology to provide the most secure and reliable 
                            <span className="text-white/90 font-semibold"> document verification system</span>
                        </p>

                        {/* Additional feature badges */}
                        <div className="flex flex-wrap justify-center gap-4 mt-8">
                            {additionalFeatures.map((feature, index) => (
                                <motion.div
                                    key={feature.text}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    whileInView={{ opacity: 1, scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: index * 0.1 }}
                                    whileHover={{ scale: 1.1, y: -5 }}
                                    className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all"
                                >
                                    <feature.icon className={`w-4 h-4 ${feature.color}`} />
                                    <span className="text-sm text-white/80">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </ScrollReveal>

                {/* 3D Network Visualization */}
                <div className="relative h-64 mb-20 rounded-3xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 to-purple-950/50 backdrop-blur-xl border border-white/10">
                        <Feature3DScene />
                    </div>
                </div>

                {/* Enhanced Feature Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {features.map((feature, index) => (
                        <ScrollReveal
                            key={feature.title}
                            delay={index * 0.1}
                            direction="up"
                        >
                            <motion.div
                                whileHover={{ y: -10, scale: 1.02 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                                className="h-full"
                            >
                                <GlassCard className="group h-full relative overflow-hidden">
                                    {/* Gradient overlay on hover */}
                                    <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                                    
                                    <div className="relative space-y-5">
                                        {/* Animated Icon */}
                                        <motion.div
                                            whileHover={{ rotate: 360, scale: 1.1 }}
                                            transition={{ duration: 0.6 }}
                                            className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} p-4 flex items-center justify-center shadow-lg`}
                                        >
                                            <feature.icon className="w-full h-full text-white" />
                                        </motion.div>

                                        {/* Title */}
                                        <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-white/70 transition-all">
                                            {feature.title}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-white/70 leading-relaxed text-base">
                                            {feature.description}
                                        </p>

                                        {/* Detail badge */}
                                        <div className="pt-4 border-t border-white/10">
                                            <p className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                                                {feature.detail}
                                            </p>
                                        </div>

                                        {/* Hover indicator */}
                                        <motion.div
                                            className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${feature.gradient} rounded-full`}
                                            initial={{ width: 0 }}
                                            whileHover={{ width: '100%' }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </GlassCard>
                            </motion.div>
                        </ScrollReveal>
                    ))}
                </div>

                {/* Call to Action Section */}
                <ScrollReveal className="mt-24">
                    <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative p-12 rounded-3xl bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10 text-center overflow-hidden"
                    >
                        {/* Animated background */}
                        <motion.div
                            animate={{
                                background: [
                                    'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.3), transparent 50%)',
                                    'radial-gradient(circle at 100% 100%, rgba(168, 85, 247, 0.3), transparent 50%)',
                                    'radial-gradient(circle at 0% 100%, rgba(236, 72, 153, 0.3), transparent 50%)',
                                    'radial-gradient(circle at 0% 0%, rgba(59, 130, 246, 0.3), transparent 50%)',
                                ],
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute inset-0"
                        />

                        <div className="relative z-10">
                            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6">
                                Ready to Secure Your Documents?
                            </h3>
                            <p className="text-xl text-white/70 mb-8 max-w-2xl mx-auto">
                                Join thousands of organizations protecting their critical documents with quantum-safe security
                            </p>
                            <motion.a
                                href="/login"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                className="inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-white text-slate-900 font-bold text-lg shadow-2xl hover:shadow-white/20 transition-shadow"
                            >
                                <Shield className="w-6 h-6" />
                                Get Started Free
                            </motion.a>
                        </div>
                    </motion.div>
                </ScrollReveal>
            </div>
        </section>
    );
}
