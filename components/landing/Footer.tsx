'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Shield, Github, Twitter, Linkedin, Mail, Heart } from 'lucide-react';

export default function Footer() {
    const footerLinks = {
        product: [
            { name: 'Features', href: '#features' },
            { name: 'Security', href: '/security' },
            { name: 'Pricing', href: '/pricing' },
            { name: 'Documentation', href: '/docs' },
        ],
        company: [
            { name: 'About', href: '/about' },
            { name: 'Blog', href: '/blog' },
            { name: 'Careers', href: '/careers' },
            { name: 'Contact', href: '/contact' },
        ],
        legal: [
            { name: 'Privacy', href: '/privacy' },
            { name: 'Terms', href: '/terms' },
            { name: 'Security', href: '/security' },
            { name: 'Compliance', href: '/compliance' },
        ],
    };

    const socialLinks = [
        { icon: Github, href: 'https://github.com', label: 'GitHub' },
        { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
        { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
        { icon: Mail, href: 'mailto:contact@docshield.com', label: 'Email' },
    ];

    return (
        <footer className="relative mt-32 border-t border-white/10 bg-gradient-to-b from-transparent to-black/20">
            {/* Background effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -top-40 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-7xl mx-auto px-4 py-16">
                {/* Main footer content */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
                    {/* Brand section */}
                    <div className="lg:col-span-2">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="flex items-center gap-3 mb-6"
                        >
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                                <Shield className="w-7 h-7 text-white" />
                            </div>
                            <span className="text-2xl font-bold text-white">DocShield</span>
                        </motion.div>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-white/60 mb-6 max-w-sm"
                        >
                            Securing the future of document verification with quantum-safe cryptography and AI-powered analysis.
                        </motion.p>
                        {/* Social links */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="flex gap-4"
                        >
                            {socialLinks.map((social) => (
                                <motion.a
                                    key={social.label}
                                    href={social.href}
                                    whileHover={{ scale: 1.1, y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="w-10 h-10 rounded-lg bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all"
                                    aria-label={social.label}
                                >
                                    <social.icon className="w-5 h-5 text-white/70" />
                                </motion.a>
                            ))}
                        </motion.div>
                    </div>

                    {/* Links sections */}
                    {Object.entries(footerLinks).map(([category, links], index) => (
                        <motion.div
                            key={category}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 * (index + 1) }}
                        >
                            <h3 className="text-white font-semibold mb-4 uppercase tracking-wider text-sm">
                                {category}
                            </h3>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link.name}>
                                        <Link
                                            href={link.href}
                                            className="text-white/60 hover:text-white transition-colors inline-block hover:translate-x-1 duration-200"
                                        >
                                            {link.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom bar */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 }}
                    className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4"
                >
                    <p className="text-white/50 text-sm flex items-center gap-2">
                        © {new Date().getFullYear()} DocShield. Made with{' '}
                        <Heart className="w-4 h-4 text-red-500 fill-red-500 animate-pulse" /> for security.
                    </p>
                    <div className="flex gap-6 text-sm text-white/50">
                        <Link href="/privacy" className="hover:text-white transition-colors">
                            Privacy Policy
                        </Link>
                        <Link href="/terms" className="hover:text-white transition-colors">
                            Terms of Service
                        </Link>
                        <Link href="/cookies" className="hover:text-white transition-colors">
                            Cookie Policy
                        </Link>
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
