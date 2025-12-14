'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function FloatingChatButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    return (
        <>
            {/* Main floating button */}
            <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1, type: 'spring', stiffness: 300 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 left-8 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-2xl flex items-center justify-center text-white backdrop-blur-xl border-2 border-white/20"
                aria-label="Open chat"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="open"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <MessageSquare className="w-6 h-6" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Pulse rings */}
                {!isOpen && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-blue-500"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-purple-500"
                            initial={{ scale: 1, opacity: 0.5 }}
                            animate={{ scale: 1.5, opacity: 0 }}
                            transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                        />
                    </>
                )}
            </motion.button>

            {/* Chat window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        className="fixed bottom-28 left-8 z-50 w-96 max-w-[calc(100vw-4rem)] rounded-2xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 bg-gradient-to-r from-blue-600/20 to-purple-600/20">
                            <h3 className="text-xl font-bold text-white mb-1">Need Help?</h3>
                            <p className="text-white/60 text-sm">Ask us anything about DocShield</p>
                        </div>

                        {/* Chat messages */}
                        <div className="p-6 space-y-4 max-h-96 overflow-y-auto">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex gap-3"
                            >
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center flex-shrink-0">
                                    <MessageSquare className="w-5 h-5 text-white" />
                                </div>
                                <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl rounded-tl-none p-4">
                                    <p className="text-white/90 text-sm">
                                        👋 Hi! I'm your DocShield assistant. How can I help you secure your documents today?
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/10 bg-slate-900/50">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message..."
                                    className="flex-1 px-4 py-3 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-blue-500/50 transition-colors"
                                />
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:shadow-lg transition-shadow"
                                >
                                    <Send className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
