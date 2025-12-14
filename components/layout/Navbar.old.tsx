'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import Link from 'next/link';
import { Shield, Menu, X, Lock, Zap, Users, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { scrollY } = useScroll();
    
    const navOpacity = useTransform(scrollY, [0, 100], [0.8, 1]);
    const navBlur = useTransform(scrollY, [0, 100], [10, 20]);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features', icon: Zap },
        { name: 'Security', href: '#security', icon: Lock },
        { name: 'Docs', href: '/docs', icon: BookOpen },
        { name: 'About', href: '#about', icon: Users },
    ];

    return (
        <motion.nav
            style={{ opacity: navOpacity }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'py-3' : 'py-5'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div
                    className={`relative rounded-2xl backdrop-blur-xl border transition-all duration-300 ${
                        isScrolled
                            ? 'bg-slate-900/95 border-white/20 shadow-2xl'
                            : 'bg-slate-900/80 border-white/10 shadow-xl'
                    }`}
                >
                    {/* Animated gradient border */}
                    <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-500" />
                    
                    <div className="relative flex items-center justify-between px-6 py-4">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3 group">
                            <motion.div
                                whileHover={{ rotate: 360, scale: 1.1 }}
                                transition={{ duration: 0.6 }}
                                className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg"
                            >
                                <Shield className="w-6 h-6 text-white" />
                                {/* Quantum glow effect */}
                                <motion.div
                                    animate={{
                                        scale: [1, 1.5, 1],
                                        opacity: [0.5, 0, 0.5],
                                    }}
                                    transition={{ duration: 2, repeat: Infinity }}
                                    className="absolute inset-0 rounded-xl bg-blue-500 blur-md"
                                />
                            </motion.div>
                            <div className="flex flex-col">
                                <span className="text-xl font-black text-white tracking-tight">
                                    Doc<span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Shield</span>
                                </span>
                                <span className="text-[10px] text-white/50 uppercase tracking-widest font-medium">
                                    Quantum-Safe
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Navigation */}
                        <div className="hidden md:flex items-center gap-2">
                            {navLinks.map((link, index) => (
                                <motion.div
                                    key={link.name}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <Link
                                        href={link.href}
                                        className="group relative px-4 py-2 rounded-lg text-white/80 hover:text-white transition-colors flex items-center gap-2"
                                    >
                                        <link.icon className="w-4 h-4" />
                                        <span className="font-medium">{link.name}</span>
                                        {/* Hover effect */}
                                        <motion.div
                                            className="absolute inset-0 rounded-lg bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"
                                            whileHover={{ scale: 1.05 }}
                                        />
                                    </Link>
                                </motion.div>
                            ))}

                            {/* Version Badge */}
                            <div className="ml-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30">
                                <span className="text-xs font-bold text-green-400">v0.3.0</span>
                            </div>

                            {/* CTA Buttons */}
                            <div className="flex items-center gap-3 ml-4">
                                <Link
                                    href="/login"
                                    className="px-4 py-2 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all font-medium"
                                >
                                    Login
                                </Link>
                                <Link href="/login">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        className="relative px-6 py-2.5 rounded-lg font-bold text-white overflow-hidden group"
                                    >
                                        <motion.div
                                            animate={{
                                                background: [
                                                    'linear-gradient(90deg, #3B82F6, #A855F7)',
                                                    'linear-gradient(90deg, #A855F7, #EC4899)',
                                                    'linear-gradient(90deg, #EC4899, #3B82F6)',
                                                    'linear-gradient(90deg, #3B82F6, #A855F7)',
                                                ],
                                            }}
                                            transition={{ duration: 3, repeat: Infinity }}
                                            className="absolute inset-0"
                                        />
                                        <span className="relative z-10 flex items-center gap-2">
                                            <Shield className="w-4 h-4" />
                                            Get Started
                                        </span>
                                    </motion.button>
                                </Link>
                            </div>
                        </div>

                        {/* Mobile Menu Button */}
                        <motion.button
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setIsOpen(!isOpen)}
                            className="md:hidden p-2 rounded-lg text-white hover:bg-white/5 transition-colors"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </motion.button>
                    </div>

                    {/* Mobile Menu */}
                    {isOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="md:hidden border-t border-white/10 px-6 py-4"
                        >
                            <div className="flex flex-col gap-2">
                                {navLinks.map((link) => (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all"
                                    >
                                        <link.icon className="w-5 h-5" />
                                        <span className="font-medium">{link.name}</span>
                                    </Link>
                                ))}
                                <div className="h-px bg-white/10 my-2" />
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-lg text-white/80 hover:text-white hover:bg-white/5 transition-all font-medium text-center"
                                >
                                    Login
                                </Link>
                                <Link
                                    href="/login"
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-3 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-center hover:shadow-lg transition-shadow"
                                >
                                    Get Started
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Quantum particles effect */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                {[...Array(3)].map((_, i) => (
                    <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-blue-400 rounded-full"
                        style={{
                            left: `${20 + i * 30}%`,
                            top: '50%',
                        }}
                        animate={{
                            y: [-10, 10, -10],
                            opacity: [0.2, 0.8, 0.2],
                            scale: [1, 1.5, 1],
                        }}
                        transition={{
                            duration: 2 + i * 0.5,
                            repeat: Infinity,
                            ease: 'easeInOut',
                        }}
                    />
                ))}
            </div>
        </motion.nav>
    );
}
