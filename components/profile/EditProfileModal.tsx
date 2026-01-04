'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, FileText, Loader2 } from 'lucide-react';

interface EditProfileModalProps {
    isOpen: boolean;
    currentName: string;
    currentEmail: string;
    onSave: (name: string) => Promise<void>;
    onCancel: () => void;
}

export default function EditProfileModal({
    isOpen,
    currentName,
    currentEmail,
    onSave,
    onCancel
}: EditProfileModalProps) {
    const [name, setName] = useState(currentName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (name.trim().length < 2) {
            setError('Name must be at least 2 characters');
            return;
        }
        if (name.trim().length > 50) {
            setError('Name must be less than 50 characters');
            return;
        }
        if (!/^[a-zA-Z\s]+$/.test(name.trim())) {
            setError('Name can only contain letters and spaces');
            return;
        }

        setLoading(true);
        try {
            await onSave(name.trim());
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-md rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden"
                        >
                            {/* Gradient header */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />

                            {/* Close button */}
                            <button
                                onClick={onCancel}
                                disabled={loading}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <form onSubmit={handleSubmit} className="p-8">
                                {/* Title */}
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                        <User className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Edit Profile</h2>
                                </div>

                                {/* Name Field */}
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Name
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            disabled={loading}
                                            className="w-full pl-11 pr-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                                            placeholder="Enter your name"
                                            required
                                        />
                                    </div>
                                </div>

                                {/* Email Field (Read-only) */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-slate-300 mb-2">
                                        Email <span className="text-slate-500 text-xs">(cannot be changed)</span>
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                        <input
                                            type="email"
                                            value={currentEmail}
                                            disabled
                                            className="w-full pl-11 pr-4 py-3 rounded-lg bg-slate-800/30 border border-slate-700/50 text-slate-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {/* Buttons */}
                                <div className="flex gap-3">
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={onCancel}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancel
                                    </motion.button>
                                    <motion.button
                                        type="submit"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        disabled={loading}
                                        className="flex-1 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            'Save Changes'
                                        )}
                                    </motion.button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
