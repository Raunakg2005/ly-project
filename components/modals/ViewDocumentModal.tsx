'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, Calendar, HardDrive, Hash, Shield, CheckCircle, Clock, AlertTriangle, Download, UserCheck, MessageSquare } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface ReviewHistoryEntry {
    reviewer_id: string;
    reviewer_name: string;
    decision: string;
    notes: string;
    reviewed_at: string;
}

interface Document {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    verificationStatus: string;
    fileHash: string;
    reviewHistory?: ReviewHistoryEntry[];
}

interface ViewDocumentModalProps {
    isOpen: boolean;
    document: Document | null;
    onClose: () => void;
}

export default function ViewDocumentModal({ isOpen, document, onClose }: ViewDocumentModalProps) {
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Get preview token when modal opens
    useEffect(() => {
        if (isOpen && document) {
            // Get preview token
            apiClient.getPreviewToken(document.id)
                .then((data: { preview_token: string; expires_in: number }) => {
                    const url = `http://localhost:8000/api/preview/${document.id}?token=${data.preview_token}`;
                    setPreviewUrl(url);
                })
                .catch((err: Error) => {
                    console.error('Failed to get preview token:', err);
                });
        } else {
            // Clear preview URL when modal closes
            setPreviewUrl('');
        }
    }, [isOpen, document]);

    if (!isOpen || !document) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'verified': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
            case 'pending': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'flagged': return 'text-red-400 bg-red-500/10 border-red-500/30';
            default: return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified': return <CheckCircle className="w-5 h-5" />;
            case 'pending': return <Clock className="w-5 h-5" />;
            case 'flagged': return <AlertTriangle className="w-5 h-5" />;
            default: return <Shield className="w-5 h-5" />;
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-2xl max-h-[90vh] my-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl overflow-y-auto"
                        >
                            {/* Gradient header */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-500" />

                            {/* Close button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <div className="p-8">
                                {/* Header */}
                                <div className="flex items-start gap-4 mb-6">
                                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                        <FileText className="w-8 h-8 text-emerald-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h2 className="text-2xl font-bold text-white mb-2 break-words">
                                            {document.fileName}
                                        </h2>
                                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor(document.verificationStatus)}`}>
                                            {getStatusIcon(document.verificationStatus)}
                                            <span className="text-sm font-medium capitalize">
                                                {document.verificationStatus}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Verifier Notes - Show if document has review history */}
                                {document.reviewHistory && document.reviewHistory.length > 0 && (
                                    <div className="mb-6 space-y-3">
                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                            <MessageSquare className="w-5 h-5 text-amber-400" />
                                            Verifier Notes
                                        </h3>
                                        <div className="space-y-2">
                                            {document.reviewHistory.map((review, index) => (
                                                <div
                                                    key={index}
                                                    className={`p-4 rounded-lg border ${
                                                        review.decision === 'approved'
                                                            ? 'bg-emerald-500/5 border-emerald-500/20'
                                                            : review.decision === 'rejected'
                                                            ? 'bg-red-500/5 border-red-500/20'
                                                            : 'bg-amber-500/5 border-amber-500/20'
                                                    }`}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <UserCheck className={`w-4 h-4 ${
                                                                review.decision === 'approved'
                                                                    ? 'text-emerald-400'
                                                                    : review.decision === 'rejected'
                                                                    ? 'text-red-400'
                                                                    : 'text-amber-400'
                                                            }`} />
                                                            <span className="text-sm font-medium text-white">
                                                                {review.reviewer_name}
                                                            </span>
                                                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                                                review.decision === 'approved'
                                                                    ? 'bg-emerald-500/20 text-emerald-400'
                                                                    : review.decision === 'rejected'
                                                                    ? 'bg-red-500/20 text-red-400'
                                                                    : 'bg-amber-500/20 text-amber-400'
                                                            }`}>
                                                                {review.decision}
                                                            </span>
                                                        </div>
                                                        <span className="text-xs text-slate-400">
                                                            {new Date(review.reviewed_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-300 leading-relaxed">
                                                        {review.notes}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Document Content */}
                                {previewUrl && document.fileType?.includes('pdf') ? (
                                    /* PDF Viewer using iframe - simple and native */
                                    <div className="h-[600px] bg-slate-800/30 rounded-lg overflow-hidden">
                                        <iframe
                                            src={previewUrl}
                                            className="w-full h-full border-0"
                                            title={document.fileName}
                                        />
                                    </div>
                                ) : previewUrl && document.fileType?.includes('image') ? (
                                    /* Image Preview */
                                    <div className="max-h-[600px] overflow-auto bg-slate-800/30 rounded-lg p-4 flex items-center justify-center">
                                        <img
                                            src={previewUrl}
                                            alt={document.fileName}
                                            className="max-w-full h-auto rounded-lg shadow-2xl"
                                        />
                                    </div>
                                ) : (
                                    /* Document Details */
                                    <div className="space-y-4">
                                        {/* File Info */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                    <HardDrive className="w-4 h-4" />
                                                    <span className="text-sm">File Size</span>
                                                </div>
                                                <p className="text-white font-semibold">{formatFileSize(document.fileSize)}</p>
                                            </div>

                                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                                <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-sm">Uploaded</span>
                                                </div>
                                                <p className="text-white font-semibold">{formatDate(document.uploadedAt)}</p>
                                            </div>
                                        </div>

                                        {/* Hash */}
                                        <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                            <div className="flex items-center gap-2 text-slate-400 mb-2">
                                                <Hash className="w-4 h-4" />
                                                <span className="text-sm">SHA-256 Hash</span>
                                            </div>
                                            <p className="text-xs font-mono text-white break-all">
                                                {document.fileHash}
                                            </p>
                                        </div>

                                        {/* Security Badge */}
                                        <div className="p-4 rounded-lg bg-emerald-500/5 border border-emerald-500/20">
                                            <div className="flex items-center gap-3">
                                                <Shield className="w-5 h-5 text-emerald-400" />
                                                <div>
                                                    <p className="text-sm font-semibold text-emerald-400">
                                                        Quantum-Safe Encryption
                                                    </p>
                                                    <p className="text-xs text-emerald-400/70">
                                                        Your document is protected with post-quantum cryptography
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Button */}
                                <div className="mt-6 flex justify-end">
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={onClose}
                                        className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold transition-colors"
                                    >
                                        Close
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
