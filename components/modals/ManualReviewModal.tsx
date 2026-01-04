'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, XCircle, AlertTriangle, Loader2, FileText } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface Document {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    uploadedAt: string;
    verificationStatus: string;
    fileHash: string;
    aiAnalysis?: {
        authenticityScore?: number;
        riskLevel?: string;
        flags?: string[];
    };
}

interface ManualReviewModalProps {
    isOpen: boolean;
    document: Document | null;
    onClose: () => void;
    onReviewComplete: () => void;
}

export default function ManualReviewModal({ isOpen, document, onClose, onReviewComplete }: ManualReviewModalProps) {
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [decision, setDecision] = useState<'approved' | 'rejected' | 'flagged' | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    // Get preview token when modal opens
    useEffect(() => {
        if (isOpen && document) {
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
    }, [isOpen, document?.id]);

    if (!isOpen || !document) return null;

    const handleApprove = async () => {
        setLoading(true);
        try {
            await apiClient.approveDocument(document.id, notes);
            onReviewComplete();
            onClose();
            setNotes('');
        } catch (error) {
            console.error('Approval failed:', error);
            alert('Failed to approve document');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async () => {
        if (!notes.trim()) {
            alert('Please provide notes for rejection');
            return;
        }

        setLoading(true);
        try {
            await apiClient.rejectDocument(document.id, notes);
            onReviewComplete();
            onClose();
            setNotes('');
        } catch (error) {
            console.error('Rejection failed:', error);
            alert('Failed to reject document');
        } finally {
            setLoading(false);
        }
    };

    const handleFlag = async () => {
        if (!notes.trim()) {
            alert('Please provide reason for flagging');
            return;
        }

        setLoading(true);
        try {
            await apiClient.flagDocument(document.id, notes);
            onReviewComplete();
            onClose();
            setNotes('');
        } catch (error) {
            console.error('Flagging failed:', error);
            alert('Failed to flag document');
        } finally {
            setLoading(false);
        }
    };

    const aiScore = document.aiAnalysis?.authenticityScore || 0;
    const riskLevel = document.aiAnalysis?.riskLevel || 'unknown';
    const flags = document.aiAnalysis?.flags || [];

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl"
                    >
                        {/* Header */}
                        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-slate-800 bg-slate-900/95 backdrop-blur-sm">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                                    <FileText className="w-6 h-6 text-yellow-400" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-white">Manual Review</h2>
                                    <p className="text-sm text-slate-400 truncate max-w-md">{document.fileName}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Document Info */}
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <p className="text-sm text-slate-400 mb-1">File Size</p>
                                    <p className="text-white font-medium">{(document.fileSize / 1024).toFixed(2)} KB</p>
                                </div>
                                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <p className="text-sm text-slate-400 mb-1">Uploaded</p>
                                    <p className="text-white font-medium">{new Date(document.uploadedAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            {/* AI Analysis */}
                            {document.aiAnalysis && (
                                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <h3 className="text-white font-semibold mb-3">AI Analysis</h3>
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-slate-400 mb-1">Authenticity Score</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 h-2 rounded-full bg-slate-700 overflow-hidden">
                                                    <div
                                                        className={`h-full transition-all ${aiScore >= 70 ? 'bg-emerald-500' : aiScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                                        style={{ width: `${aiScore}%` }}
                                                    />
                                                </div>
                                                <span className="text-white font-semibold">{aiScore}/100</span>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-sm text-slate-400 mb-1">Risk Level</p>
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${riskLevel === 'low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                riskLevel === 'medium' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30' :
                                                    'bg-red-500/10 text-red-400 border border-red-500/30'
                                                }`}>
                                                <AlertTriangle className="w-4 h-4" />
                                                {riskLevel.toUpperCase()}
                                            </span>
                                        </div>
                                        {flags.length > 0 && (
                                            <div>
                                                <p className="text-sm text-slate-400 mb-2">Flags</p>
                                                <div className="space-y-1">
                                                    {flags.map((flag, index) => (
                                                        <div key={index} className="text-sm text-red-400 flex items-center gap-2">
                                                            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                                                            {flag}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Document Preview */}
                            <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                <h3 className="text-white font-semibold mb-3">Document Preview</h3>
                                <div className="relative w-full h-96 bg-slate-900 rounded-lg overflow-hidden border border-slate-700 flex items-center justify-center">
                                    {previewUrl && document.fileType?.includes('pdf') ? (
                                        <iframe
                                            src={previewUrl}
                                            className="w-full h-full border-0"
                                            title="Document Preview"
                                        />
                                    ) : previewUrl && document.fileType?.includes('image') ? (
                                        <img
                                            src={previewUrl}
                                            alt="Document preview"
                                            className="max-w-full max-h-full object-contain"
                                        />
                                    ) : previewUrl ? (
                                        <div className="text-center p-6">
                                            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                            <p className="text-slate-400 text-sm">Preview not available for this file type</p>
                                            <p className="text-slate-500 text-xs mt-1">{document.fileType}</p>
                                        </div>
                                    ) : (
                                        <div className="text-center p-6">
                                            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                                            <p className="text-slate-400 text-sm">Loading preview...</p>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400 mt-2">
                                    File: {document.fileName} • {(document.fileSize / 1024).toFixed(2)} KB
                                </p>
                            </div>

                            {/* Review History - Show past reviews */}
                            {(document as any).reviewHistory && (document as any).reviewHistory.length > 0 && (
                                <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                    <h3 className="text-white font-semibold mb-3">Review History</h3>
                                    <div className="space-y-3">
                                        {(document as any).reviewHistory.map((review: any, index: number) => (
                                            <div key={index} className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
                                                <div className="flex items-center justify-between mb-2">
                                                    <span className={`text-sm font-medium ${review.decision === 'approved' ? 'text-emerald-400' :
                                                            review.decision === 'rejected' ? 'text-red-400' :
                                                                'text-yellow-400'
                                                        }`}>
                                                        {review.decision.charAt(0).toUpperCase() + review.decision.slice(1)}
                                                    </span>
                                                    <span className="text-xs text-slate-500">
                                                        {new Date(review.reviewed_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                {review.notes && (
                                                    <p className="text-sm text-slate-400 mb-2">{review.notes}</p>
                                                )}
                                                <p className="text-xs text-slate-500">
                                                    Reviewed by: {review.reviewer_name || 'Unknown'}
                                                </p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Reviewer Notes */}
                            <div>
                                <label className="block text-sm font-medium text-white mb-2">
                                    Reviewer Notes {decision === 'rejected' && <span className="text-red-400">*</span>}
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    placeholder="Add your review notes here..."
                                    rows={4}
                                    className="w-full px-4 py-3 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all resize-none"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleApprove}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Approve
                                        </>
                                    )}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleFlag}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-black font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <AlertTriangle className="w-5 h-5" />
                                            Flag
                                        </>
                                    )}
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={handleReject}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <XCircle className="w-5 h-5" />
                                            Reject
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
