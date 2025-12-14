'use client';

import { motion, useAnimation } from 'framer-motion';
import { Terminal, Lock, CheckCircle, Code, Webhook, Box, GitBranch, Zap, Copy } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function SecurityDemo() {
    const [currentLine, setCurrentLine] = useState(0);
    const [copied, setCopied] = useState(false);
    
    const terminalLines = [
        { text: '$ npm install @docshield/sdk', delay: 0, prefix: '>' },
        { text: '✓ Installing dependencies...', delay: 0.5, color: 'text-cyan-400' },
        { text: '✓ Setup complete!', delay: 1, color: 'text-emerald-400' },
        { text: '', delay: 1.5 },
        { text: '$ docshield verify document.pdf', delay: 2, prefix: '>' },
        { text: '⚡ Initializing quantum-safe environment...', delay: 2.5, color: 'text-cyan-400' },
        { text: '⚡ Running AI forgery detection...', delay: 3, color: 'text-cyan-400' },
        { text: '⚡ Verifying cryptographic signatures...', delay: 3.5, color: 'text-cyan-400' },
        { text: '✓ Status: AUTHENTIC | Score: 99.5%', delay: 4, color: 'text-emerald-400' },
    ];

    const codeSnippet = `import { DocShield } from '@docshield/sdk';

const shield = new DocShield({
  apiKey: process.env.DOCSHIELD_KEY
});

const result = await shield.verify({
  file: 'document.pdf',
  options: { aiDetection: true }
});`;

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentLine((prev) => (prev < terminalLines.length - 1 ? prev + 1 : 0));
        }, 6000);
        return () => clearInterval(timer);
    }, []);

    const handleCopy = () => {
        navigator.clipboard.writeText(codeSnippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <section className="relative py-32 px-4 overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900/30 to-slate-950">
            {/* Animated Background */}
            <div className="absolute inset-0">
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />
            </div>

            {/* Floating gradient orbs */}
            <motion.div
                animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 10, repeat: Infinity }}
                className="absolute top-40 -left-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"
            />
            <motion.div
                animate={{ scale: [1.3, 1, 1.3], opacity: [0.2, 0.4, 0.2] }}
                transition={{ duration: 12, repeat: Infinity }}
                className="absolute bottom-20 -right-20 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"
            />

            <div className="max-w-7xl mx-auto relative z-10">
                {/* Section Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <motion.div
                        initial={{ scale: 0.9 }}
                        whileInView={{ scale: 1 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/30 mb-6"
                    >
                        <Code className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-mono text-emerald-400 uppercase tracking-wider">Developer Tools</span>
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold mb-4">
                        <span className="text-slate-100">Built for</span>{' '}
                        <span className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">
                            Developers
                        </span>
                    </h2>
                    <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                        Integrate quantum-safe verification with our powerful SDK, CLI, and REST API
                    </p>
                </motion.div>

                <div className="grid lg:grid-cols-2 gap-8 items-start mb-16">
                    {/* Left: Terminal & Code */}
                    <div className="space-y-6">
                        {/* Terminal */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            className="group relative"
                        >
                            {/* Glow effect */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-2xl opacity-0 group-hover:opacity-75 transition-opacity blur-sm" />
                            
                            <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800/50 backdrop-blur-xl shadow-2xl">
                                {/* Terminal Header */}
                                <div className="flex items-center justify-between px-5 py-4 bg-slate-800/50 border-b border-slate-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-2">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Terminal className="w-4 h-4 text-emerald-400" />
                                            <span className="text-sm text-slate-400 font-mono">docshield-cli</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                        <span>Running</span>
                                    </div>
                                </div>

                                {/* Terminal Body */}
                                <div className="p-6 font-mono text-sm space-y-2 min-h-[320px] bg-slate-950/50">
                                    {terminalLines.slice(0, currentLine + 1).map((line, index) => (
                                        <motion.div
                                            key={index}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className={`${line.color || 'text-slate-300'} flex items-start gap-2`}
                                        >
                                            {line.prefix && <span className="text-emerald-400">{line.prefix}</span>}
                                            <span>{line.text}</span>
                                        </motion.div>
                                    ))}
                                    <motion.span
                                        animate={{ opacity: [1, 0, 1] }}
                                        transition={{ duration: 0.8, repeat: Infinity }}
                                        className="inline-block w-2 h-5 bg-emerald-400 ml-1"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        {/* Code Snippet */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                            className="group relative"
                        >
                            {/* Glow effect */}
                            <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 to-emerald-500 rounded-2xl opacity-0 group-hover:opacity-75 transition-opacity blur-sm" />
                            
                            <div className="relative rounded-2xl overflow-hidden bg-slate-900/80 border border-slate-800/50 backdrop-blur-xl">
                                {/* Code Header */}
                                <div className="flex items-center justify-between px-5 py-4 bg-slate-800/50 border-b border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <Code className="w-4 h-4 text-cyan-400" />
                                        <span className="text-sm text-slate-400 font-mono">Quick Start</span>
                                    </div>
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleCopy}
                                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600/50 text-xs text-slate-300 transition-all"
                                    >
                                        {copied ? (
                                            <><CheckCircle className="w-3 h-3 text-emerald-400" /> Copied!</>
                                        ) : (
                                            <><Copy className="w-3 h-3" /> Copy</>
                                        )}
                                    </motion.button>
                                </div>

                                {/* Code Body */}
                                <div className="p-6 font-mono text-sm bg-slate-950/50">
                                    <pre className="text-slate-300 leading-relaxed">
                                        <code>{codeSnippet}</code>
                                    </pre>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right: Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                        className="space-y-6"
                    >
                        {/* Feature Cards */}
                        <div className="grid gap-4">
                            {[
                                { icon: Box, title: 'RESTful API', desc: 'OpenAPI 3.0 documentation', gradient: 'from-emerald-500 to-cyan-500' },
                                { icon: Terminal, title: 'CLI Tools', desc: 'Cross-platform command line interface', gradient: 'from-emerald-500 to-cyan-500' },
                                { icon: GitBranch, title: 'SDKs Available', desc: 'Python, JavaScript, TypeScript', gradient: 'from-emerald-500 to-cyan-500' },
                                { icon: Webhook, title: 'Webhooks', desc: 'Real-time event notifications', gradient: 'from-emerald-500 to-cyan-500' },
                            ].map((feature, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: 0.4 + index * 0.1 }}
                                    whileHover={{ x: 10, scale: 1.02 }}
                                    className="group relative"
                                >
                                    {/* Glow */}
                                    <div className={`absolute -inset-[1px] bg-gradient-to-r ${feature.gradient} rounded-xl opacity-0 group-hover:opacity-50 transition-opacity blur-sm`} />
                                    
                                    <div className="relative flex items-center gap-4 p-5 rounded-xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
                                        <motion.div
                                            whileHover={{ rotate: 360 }}
                                            transition={{ duration: 0.6 }}
                                            className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-2.5 shadow-lg flex items-center justify-center flex-shrink-0`}
                                        >
                                            <feature.icon className="w-full h-full text-white" />
                                        </motion.div>
                                        <div>
                                            <h3 className="text-base font-semibold text-slate-100 mb-0.5 group-hover:text-emerald-400 transition-colors">
                                                {feature.title}
                                            </h3>
                                            <p className="text-sm text-slate-400">{feature.desc}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.8 }}
                            className="pt-6"
                        >
                            <motion.a
                                href="/docs"
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold shadow-2xl shadow-emerald-500/25 overflow-hidden"
                            >
                                {/* Animated shine */}
                                <motion.div
                                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                                    animate={{ x: ['-200%', '200%'] }}
                                    transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
                                />
                                <Terminal className="w-5 h-5 relative z-10" />
                                <span className="relative z-10">View Documentation</span>
                                <motion.div
                                    animate={{ x: [0, 5, 0] }}
                                    transition={{ duration: 1.5, repeat: Infinity }}
                                    className="relative z-10"
                                >
                                    →
                                </motion.div>
                            </motion.a>
                        </motion.div>

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            whileInView={{ opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: 1 }}
                            className="pt-6 border-t border-slate-800"
                        >
                            <div className="grid grid-cols-3 gap-4 text-center">
                                {[
                                    { label: 'Endpoints', value: '50+' },
                                    { label: 'Languages', value: '3' },
                                    { label: 'Latency', value: '<100ms' },
                                ].map((stat, i) => (
                                    <div key={i}>
                                        <div className="text-2xl font-bold text-emerald-400 mb-1">{stat.value}</div>
                                        <div className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
