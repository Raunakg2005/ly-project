'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Download, Lock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function PublicSharePage() {
    const params = useParams();
    const shareId = params.shareId as string;

    const [document, setDocument] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [passwordRequired, setPasswordRequired] = useState(false);
    const [password, setPassword] = useState('');
    const [passwordLoading, setPasswordLoading] = useState(false);

    useEffect(() => {
        loadShare();
    }, [shareId]);

    const loadShare = async (pwd?: string) => {
        setLoading(true);
        setError('');

        try {
            const data = await apiClient.getPublicShare(shareId, pwd || password);
            setDocument(data);
            setPasswordRequired(false);
        } catch (err: any) {
            if (err.message.includes('Password required')) {
                setPasswordRequired(true);
            } else {
                setError(err.message || 'Share not found or has expired');
            }
        } finally {
            setLoading(false);
            setPasswordLoading(false);
        }
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordLoading(true);
        loadShare(password);
    };

    const handleDownload = async () => {
        if (!document) return;

        try {
            // Build download URL
            const params = new URLSearchParams();
            if (password) params.append('password', password);

            const downloadUrl = `http://localhost:8000/api/public/share/${shareId}/download${password ? `?${params}` : ''}`;

            // Create temporary link and trigger download
            const link = window.document.createElement('a');
            link.href = downloadUrl;
            link.download = document.file_name;
            window.document.body.appendChild(link);
            link.click();
            window.document.body.removeChild(link);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download document');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-emerald-400 animate-spin mx-auto mb-4" />
                    <p className="text-slate-400">Loading shared document...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-slate-900 rounded-xl border border-slate-800 p-8 text-center"
                >
                    <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Share Not Found</h1>
                    <p className="text-slate-400 mb-6">{error}</p>
                    <a
                        href="/"
                        className="inline-block px-6 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                    >
                        Go to Home
                    </a>
                </motion.div>
            </div>
        );
    }

    if (passwordRequired) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-slate-900 rounded-xl border border-slate-800 p-8"
                >
                    <Lock className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white text-center mb-2">Password Required</h1>
                    <p className="text-slate-400 text-center mb-6">
                        This document is password protected. Please enter the password to view.
                    </p>
                    <form onSubmit={handlePasswordSubmit} className="space-y-4">
                        <input
                            type="password"
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={!password || passwordLoading}
                            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {passwordLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                'Unlock'
                            )}
                        </button>
                    </form>
                </motion.div>
            </div>
        );
    }

    if (!document) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
            {/* Header */}
            <div className="bg-slate-900/50 border-b border-slate-800 backdrop-blur-md">
                <div className="max-w-4xl mx-auto px-4 py-6">
                    <h1 className="text-2xl font-bold text-white">DocShield</h1>
                    <p className="text-sm text-slate-400 mt-1">Quantum-Safe Document Verification</p>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-4xl mx-auto px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden"
                >
                    {/* Document Info */}
                    <div className="p-8 text-center">
                        <div className="inline-flex p-4 bg-emerald-500/10 rounded-full mb-4">
                            <FileText className="w-12 h-12 text-emerald-400" />
                        </div>

                        <h2 className="text-3xl font-bold text-white mb-2">{document.file_name}</h2>

                        <div className="flex items-center justify-center gap-4 text-slate-400 mb-6">
                            <span>{document.file_type}</span>
                            <span>•</span>
                            <span>{(document.file_size / 1024 / 1024).toFixed(2)} MB</span>
                        </div>

                        {/* Verification Status */}
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <span className="text-emerald-400 font-medium capitalize">
                                {document.verification_status}
                            </span>
                        </div>

                        {/* Shared By */}
                        {document.created_by_name && (
                            <p className="text-slate-400 mt-6">
                                Shared by: <span className="text-white">{document.created_by_name}</span>
                            </p>
                        )}
                    </div>

                    {/* Actions */}
                    {document.allow_download && (
                        <div className="border-t border-slate-800 p-6 bg-slate-800/30">
                            <button
                                onClick={handleDownload}
                                className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all flex items-center justify-center gap-2"
                            >
                                <Download className="w-5 h-5" />
                                Download Document
                            </button>
                        </div>
                    )}
                </motion.div>

                {/* Footer */}
                <div className="text-center mt-12">
                    <p className="text-slate-500 text-sm">
                        Powered by <span className="text-emerald-400 font-semibold">DocShield</span>
                    </p>
                    <p className="text-slate-600 text-xs mt-1">
                        Quantum-Safe Document Verification Platform
                    </p>
                </div>
            </div>
        </div>
    );
}
