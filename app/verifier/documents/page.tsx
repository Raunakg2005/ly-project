'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FileText, Search, Filter, Eye, Download, Trash2, RefreshCw, ChevronDown, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';
import ManualReviewModal from '@/components/modals/ManualReviewModal';
import ViewDocumentModal from '@/components/modals/ViewDocumentModal';

export default function VerifierDocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [selectedDocument, setSelectedDocument] = useState<any>(null);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [viewModalOpen, setViewModalOpen] = useState(false);
    const [showDeleted, setShowDeleted] = useState(false);

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        loadDocuments();
    }, [showDeleted, currentPage]);

    const loadDocuments = async () => {
        try {
            // Get documents with pagination
            const data = await apiClient.getVerifierDocuments({
                show_deleted: showDeleted,
                page: currentPage,
                limit: itemsPerPage
            });
            setDocuments(data.documents || []);
            setTotalItems(data.total || 0);
        } catch (error: any) {
            console.error('Failed to load documents:', error);
            if (error?.message?.includes('BANNED') || error?.message?.includes('suspended')) {
                window.location.href = '/banned';
            } else if (error?.message?.includes('401')) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const filteredDocs = documents.filter(doc => {
        const matchesSearch = doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || doc.verificationStatus === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-400" />
                            All Documents
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 mt-1">System-wide document view</p>
                    </div>
                    <button
                        onClick={loadDocuments}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                </div>

                {/* Filters */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-3">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search documents..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full sm:w-auto appearance-none pl-4 pr-10 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                                <option value="flagged">Flagged</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>

                        {/* Show Deleted Toggle */}
                        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg">
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={showDeleted}
                                    onChange={(e) => {
                                        setShowDeleted(e.target.checked);
                                        setCurrentPage(1); // Reset to page 1 when filter changes
                                    }}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                            </label>
                            <span className="text-sm text-white">Show Deleted</span>
                        </div>
                    </div>
                </div>

                {/* Pagination */}
                {totalItems > itemsPerPage && (
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} documents
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                Previous
                            </button>
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
                                Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalItems / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
                {/* Documents Grid */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-3 sm:p-4 lg:p-6">
                    <p className="text-white font-medium mb-4">{filteredDocs.length} documents found</p>

                    {filteredDocs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">No documents found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                            {filteredDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="bg-slate-800/50 rounded-lg border border-slate-700 p-3 sm:p-4 hover:border-emerald-500/30 transition-all overflow-hidden"
                                >
                                    <div className="flex flex-col gap-3">
                                        <div className="flex flex-col sm:flex-row items-start justify-between gap-3">
                                            <div className="flex-1 min-w-0 w-full">
                                                <h3 className="text-white font-medium break-words text-sm sm:text-base">{doc.fileName}</h3>
                                                <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                                    {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.fileType}
                                                </p>
                                                {doc.userName && (
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        Uploaded by: {doc.userName}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 flex-wrap">
                                                {/* Deleted Badge */}
                                                {doc.isDeleted && (
                                                    <span className="px-2 sm:px-3 py-1 rounded-lg text-xs font-medium bg-red-500/20 text-red-400 border border-red-500/50 whitespace-nowrap">
                                                        🗑️ Deleted
                                                    </span>
                                                )}

                                                {/* Status Badge */}
                                                <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap ${doc.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                    doc.verificationStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                                        doc.verificationStatus === 'flagged' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                                                            'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                                    }`}>
                                                    {doc.verificationStatus}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex flex-wrap gap-2">
                                            <button
                                                onClick={() => {
                                                    setSelectedDocument(doc);
                                                    setViewModalOpen(true);
                                                }}
                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors min-w-[100px]"
                                            >
                                                <Eye className="w-4 h-4" />
                                                View
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedDocument(doc);
                                                    setReviewModalOpen(true);
                                                }}
                                                className="flex-1 sm:flex-none px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm flex items-center justify-center gap-2 transition-colors min-w-[100px]"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Review
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Pagination */}
                {totalItems > itemsPerPage && (
                    <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 flex items-center justify-between">
                        <div className="text-sm text-slate-400">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} documents
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                Previous
                            </button>
                            <div className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg">
                                Page {currentPage} of {Math.ceil(totalItems / itemsPerPage)}
                            </div>
                            <button
                                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalItems / itemsPerPage), prev + 1))}
                                disabled={currentPage >= Math.ceil(totalItems / itemsPerPage)}
                                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {/* Modals */}
                <ManualReviewModal
                    isOpen={reviewModalOpen}
                    document={selectedDocument}
                    onClose={() => {
                        setReviewModalOpen(false);
                        setSelectedDocument(null);
                    }}
                    onReviewComplete={() => {
                        setReviewModalOpen(false);
                        setSelectedDocument(null);
                        loadDocuments();
                    }}
                />

                <ViewDocumentModal
                    isOpen={viewModalOpen}
                    document={selectedDocument}
                    onClose={() => {
                        setViewModalOpen(false);
                        setSelectedDocument(null);
                    }}
                />
            </div>
        </div>
    );
}
