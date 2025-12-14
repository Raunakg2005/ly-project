'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Menu, X, Terminal } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Security', href: '#security' },
        { name: 'Docs', href: '/docs' },
        { name: 'Pricing', href: '#pricing' },
    ];

    return (
        <motion.nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
                isScrolled ? 'py-2 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800' : 'py-4 bg-transparent'
            }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                            <Shield className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-lg font-bold text-white">
                                Doc<span className="text-emerald-400">Shield</span>
                            </span>
                            <span className="text-[8px] text-slate-500 uppercase tracking-widest">
                                Quantum-Safe
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                {link.name}
                            </Link>
                        ))}

                        {/* Version Badge */}
                        <div className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                            <span className="text-xs font-mono text-emerald-400">v0.3.0</span>
                        </div>

                        {/* Auth Buttons */}
                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="text-sm text-slate-400 hover:text-white transition-colors"
                            >
                                Login
                            </Link>
                            <Link href="/login">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-semibold transition-colors flex items-center gap-2"
                                >
                                    <Terminal className="w-4 h-4" />
                                    Get Started
                                </motion.button>
                            </Link>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <motion.button
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(!isOpen)}
                        className="md:hidden p-2 rounded-lg text-white hover:bg-slate-800 transition-colors"
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
                        className="md:hidden mt-4 py-4 border-t border-slate-800"
                    >
                        <div className="flex flex-col gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    onClick={() => setIsOpen(false)}
                                    className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="h-px bg-slate-800 my-2" />
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
                            >
                                Login
                            </Link>
                            <Link
                                href="/login"
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 rounded-lg bg-emerald-500 text-black font-semibold text-center"
                            >
                                Get Started
                            </Link>
                        </div>
                    </motion.div>
                )}
            </div>
        </motion.nav>
    );
}
