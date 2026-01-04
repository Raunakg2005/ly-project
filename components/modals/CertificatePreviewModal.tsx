'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Award, Loader2 } from 'lucide-react';

interface CertificatePreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    certificateId: string;
    documentName: string;
}

export default function CertificatePreviewModal({ isOpen, onClose, certificateId, documentName }: CertificatePreviewModalProps) {
    const [downloading, setDownloading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!isOpen) return;

        const loadPdf = async () => {
            setLoading(true);
            setError(null);
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`http://127.0.0.1:8000/api/certificates/download/${certificateId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!response.ok) throw new Error('Failed to load certificate');

                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                setPdfUrl(url);
            } catch (err) {
                setError('Failed to load certificate preview');
                console.error('Preview load error:', err);
            } finally {
                setLoading(false);
            }
        };

        loadPdf();

        // Cleanup blob URL on unmount
        return () => {
            if (pdfUrl) {
                window.URL.revokeObjectURL(pdfUrl);
            }
        };
    }, [isOpen, certificateId]);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:8000/api/certificates/download/${certificateId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Download failed');

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `certificate_${documentName}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download certificate');
        } finally {
            setDownloading(false);
        }
    };

    if (!isOpen) return null;

    const modalContent = (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-5xl my-4 flex flex-col border border-emerald-500/30"
                        style={{ maxHeight: 'calc(100vh - 2rem)' }}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <div className="flex items-center gap-3">
                                <Award className="w-5 h-5 text-emerald-400" />
                                <h2 className="text-xl font-bold text-white">Certificate Preview</h2>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-slate-400" />
                            </button>
                        </div>

                        {/* PDF Preview */}
                        <div className="flex-1 bg-slate-900 flex items-center justify-center" style={{ minHeight: '70vh' }}>
                            {loading ? (
                                <div className="flex flex-col items-center gap-3">
                                    <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                                    <p className="text-slate-400">Loading certificate...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center p-4">
                                    <p className="text-red-400">{error}</p>
                                </div>
                            ) : pdfUrl ? (
                                <iframe
                                    src={pdfUrl}
                                    className="w-full h-full"
                                    title="Certificate Preview"
                                    style={{ minHeight: '70vh', border: 'none' }}
                                />
                            ) : null}
                        </div>

                        {/* Footer with Download Button */}
                        <div className="p-4 border-t border-slate-700 flex items-center justify-between">
                            <p className="text-sm text-slate-400">
                                Certificate ID: <span className="text-emerald-400 font-mono">{certificateId}</span>
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={onClose}
                                    className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                                >
                                    Close
                                </button>
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading || !pdfUrl}
                                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" />
                                    {downloading ? 'Downloading...' : 'Download PDF'}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );

    return typeof window !== 'undefined' ? createPortal(modalContent, document.body) : null;
}
