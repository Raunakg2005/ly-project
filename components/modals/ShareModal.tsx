'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link2, Clock, Lock, Download, Copy, Check, Eye, Calendar } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { apiClient } from '@/lib/api/client';

interface ShareModalProps {
    isOpen: boolean;
    document: {
        id: string;
        fileName: string;
        verificationStatus: string;
        fileSize: number;
    } | null;
    onClose: () => void;
}

export default function ShareModal({ isOpen, document, onClose }: ShareModalProps) {
    const [expiresIn, setExpiresIn] = useState('24h');
    const [passwordEnabled, setPasswordEnabled] = useState(false);
    const [password, setPassword] = useState('');
    const [allowDownload, setAllowDownload] = useState(true);
    const [shareUrl, setShareUrl] = useState('');
    const [shareData, setShareData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleGenerateLink = async () => {
        if (!document) return;

        setLoading(true);
        try {
            const result = await apiClient.createShare(document.id, {
                expires_in: expiresIn,
                password: passwordEnabled ? password : undefined,
                allow_download: allowDownload
            });

            setShareUrl(result.share_url);
            setShareData(result);
        } catch (error) {
            console.error('Failed to create share:', error);
            alert('Failed to create share link');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!shareUrl) return;
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleClose = () => {
        setShareUrl('');
        setShareData(null);
        setPassword('');
        setPasswordEnabled(false);
        setExpiresIn('24h');
        setAllowDownload(true);
        setCopied(false);
        onClose();
    };

    const expirationOptions = [
        { value: '1h', label: '1 hour' },
        { value: '24h', label: '24 hours' },
        { value: '7d', label: '7 days' },
        { value: 'never', label: 'Never expires' }
    ];

    if (!isOpen || !document) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-slate-900 rounded-xl border border-slate-800 shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-800">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Link2 className="w-6 h-6 text-emerald-400" />
                            Share Document
                        </h2>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        {/* Document Info */}
                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg">
                                    <Link2 className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-white font-medium">{document.fileName}</p>
                                    <p className="text-sm text-slate-400">
                                        {document.verificationStatus} • {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                </div>
                            </div>
                        </div>

                        {!shareUrl ? (
                            <>
                                {/* Expiration */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                        <Clock className="w-4 h-4" />
                                        Link expires in
                                    </label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {expirationOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => setExpiresIn(option.value)}
                                                className={`px-4 py-2 rounded-lg border transition-all ${expiresIn === option.value
                                                    ? 'bg-emerald-500 border-emerald-500 text-white'
                                                    : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-emerald-500'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Password Protection */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                        <Lock className="w-4 h-4" />
                                        Password Protection
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={passwordEnabled}
                                                onChange={(e) => setPasswordEnabled(e.target.checked)}
                                                className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm text-slate-400">Require password to view</span>
                                        </label>
                                        {passwordEnabled && (
                                            <input
                                                type="text"
                                                placeholder="Enter password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Allow Download */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                        <Download className="w-4 h-4" />
                                        Download Permission
                                    </label>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={allowDownload}
                                            onChange={(e) => setAllowDownload(e.target.checked)}
                                            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500"
                                        />
                                        <span className="text-sm text-slate-400">Allow viewers to download</span>
                                    </label>
                                </div>

                                {/* Generate Button */}
                                <button
                                    onClick={handleGenerateLink}
                                    disabled={loading || (passwordEnabled && !password)}
                                    className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {loading ? 'Generating...' : 'Generate Share Link'}
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Success Banner */}
                                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
                                    <div className="flex items-center gap-2 text-emerald-400">
                                        <Check className="w-5 h-5" />
                                        <span className="font-medium">Share link generated successfully!</span>
                                    </div>
                                </div>

                                {/* Share URL */}
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                                        <Link2 className="w-4 h-4" />
                                        Share Link
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={shareUrl}
                                            readOnly
                                            className="flex-1 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm font-mono"
                                        />
                                        <button
                                            onClick={handleCopy}
                                            className="px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
                                        >
                                            {copied ? (
                                                <>
                                                    <Check className="w-4 h-4" />
                                                    Copied!
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-4 h-4" />
                                                    Copy
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>

                                {/* QR Code */}
                                <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
                                    <p className="text-sm font-medium text-slate-300 mb-4 text-center">Scan to share</p>
                                    <div className="flex justify-center">
                                        <div className="p-4 bg-white rounded-lg">
                                            <QRCodeSVG value={shareUrl} size={180} />
                                        </div>
                                    </div>
                                </div>

                                {/* Statistics */}
                                {shareData && (
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                                <Eye className="w-4 h-4" />
                                                Views
                                            </div>
                                            <p className="text-2xl font-bold text-white">{shareData.view_count}</p>
                                        </div>
                                        <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm mb-1">
                                                <Calendar className="w-4 h-4" />
                                                Expires
                                            </div>
                                            <p className="text-sm font-medium text-white">
                                                {shareData.expires_at
                                                    ? new Date(shareData.expires_at).toLocaleDateString()
                                                    : 'Never'}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleClose}
                                        className="flex-1 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors font-medium"
                                    >
                                        Done
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShareUrl('');
                                            setShareData(null);
                                        }}
                                        className="flex-1 px-6 py-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors font-medium"
                                    >
                                        Create Another
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
