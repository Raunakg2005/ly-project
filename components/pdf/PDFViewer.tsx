'use client';

import { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize2, Loader2 } from 'lucide-react';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface PDFViewerProps {
    fileUrl: string;
    fileName: string;
}

export default function PDFViewer({ fileUrl, fileName }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [pageNumber, setPageNumber] = useState<number>(1);
    const [scale, setScale] = useState<number>(1.0);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string>('');

    const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
        setLoading(false);
    };

    const onDocumentLoadError = (error: Error) => {
        console.error('PDF load error:', error);
        setError('Failed to load PDF. Please try downloading instead.');
        setLoading(false);
    };

    const goToPrevPage = () => {
        setPageNumber(prev => Math.max(1, prev - 1));
    };

    const goToNextPage = () => {
        setPageNumber(prev => Math.min(numPages, prev + 1));
    };

    const zoomIn = () => {
        setScale(prev => Math.min(2.0, prev + 0.2));
    };

    const zoomOut = () => {
        setScale(prev => Math.max(0.5, prev - 0.2));
    };

    const handleDownload = () => {
        window.open(fileUrl, '_blank');
    };

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center">
                <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-4">
                    <span className="text-3xl">📄</span>
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">Cannot Load PDF</h3>
                <p className="text-slate-400 mb-6">{error}</p>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleDownload}
                    className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold flex items-center gap-2"
                >
                    <Download className="w-5 h-5" />
                    Download PDF
                </motion.button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            {/* PDF Canvas */}
            <div className="flex-1 overflow-auto max-h-[500px] bg-slate-800/30 rounded-lg p-4 flex items-center justify-center">
                {loading && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 className="w-12 h-12 text-emerald-400 animate-spin" />
                        <p className="text-slate-400">Loading PDF...</p>
                    </div>
                )}

                <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    onLoadError={onDocumentLoadError}
                    loading=""
                    className="flex justify-center"
                >
                    <Page
                        pageNumber={pageNumber}
                        scale={scale}
                        renderTextLayer={true}
                        renderAnnotationLayer={true}
                        className="shadow-2xl"
                    />
                </Document>
            </div>

            {/* Controls */}
            <div className="mt-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                <div className="flex items-center justify-between gap-4 flex-wrap">
                    {/* Page Navigation */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToPrevPage}
                            disabled={pageNumber <= 1 || loading}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 text-white transition-colors"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </motion.button>

                        <span className="text-sm text-slate-300 min-w-[120px] text-center">
                            {loading ? 'Loading...' : `Page ${pageNumber} of ${numPages}`}
                        </span>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToNextPage}
                            disabled={pageNumber >= numPages || loading}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 text-white transition-colors"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Zoom Controls */}
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={zoomOut}
                            disabled={scale <= 0.5 || loading}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 text-white transition-colors"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </motion.button>

                        <span className="text-sm text-slate-300 min-w-[60px] text-center">
                            {Math.round(scale * 100)}%
                        </span>

                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={zoomIn}
                            disabled={scale >= 2.0 || loading}
                            className="p-2 rounded-lg bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed border border-slate-600 text-white transition-colors"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </motion.button>
                    </div>

                    {/* Download Button */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleDownload}
                        className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-medium flex items-center gap-2 transition-colors"
                    >
                        <Download className="w-4 h-4" />
                        Download
                    </motion.button>
                </div>
            </div>
        </div>
    );
}
