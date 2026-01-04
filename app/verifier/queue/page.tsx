'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Filter, Search, RefreshCw, ChevronDown } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import VerifierStats from '@/components/verifier/VerifierStats';
import ReviewQueueCard from '@/components/verifier/ReviewQueueCard';
import ManualReviewModal from '@/components/modals/ManualReviewModal';
import LoadingScreen from '@/components/animations/LoadingScreen';

export default function VerifierDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [queue, setQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [queueLoading, setQueueLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('oldest');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reviewModal, setReviewModal] = useState<{ open: boolean; doc: any }>({ open: false, doc: null });

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadQueue();
    }, [statusFilter, sortBy, page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, queueData] = await Promise.all([
                apiClient.getVerifierStats(),
                apiClient.getVerifierQueue({ status: statusFilter, sortBy, page, limit: 10 })
            ]);
            setStats(statsData);
            setQueue(queueData.documents);
            setTotalPages(queueData.pages);
        } catch (error: any) {
            console.error('Failed to load verifier data:', error);
            if (error.message && (error.message.includes('BANNED') || error.message.includes('suspended'))) {
                window.location.href = '/banned';
            }
        } finally {
            setLoading(false);
        }
    };

    const loadQueue = async () => {
        setQueueLoading(true);
        try {
            const queueData = await apiClient.getVerifierQueue({ status: statusFilter, sortBy, page, limit: 10 });
            setQueue(queueData.documents);
            setTotalPages(queueData.pages);
        } catch (error) {
            console.error('Failed to load queue:', error);
        } finally {
            setQueueLoading(false);
        }
    };

    const handleQuickReview = async (documentId: string, decision: 'approved' | 'rejected') => {
        try {
            await apiClient.quickReview(documentId, decision);
            await loadData();
        } catch (error) {
            console.error('Failed to review document:', error);
            alert('Failed to review document');
        }
    };

    const handleView = (doc: any) => {
        // Transform snake_case API response to camelCase for modal
        const transformedDoc = {
            id: doc.id,
            fileName: doc.file_name,
            fileSize: doc.file_size,
            fileType: doc.file_type,
            uploadedAt: doc.uploaded_at || doc.createdAt,
            verificationStatus: doc.verification_status,
            fileHash: doc.file_hash,
            aiAnalysis: doc.ai_analysis
        };
        setReviewModal({ open: true, doc: transformedDoc });
    };

    const handleReviewComplete = async () => {
        await loadData();
    };

    const filteredQueue = queue.filter(doc =>
        doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        doc.user.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="px-4 lg:px-8 py-6">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                            <UserCheck className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-emerald-400" />
                            Verifier Dashboard
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 mt-1">Review and approve pending documents</p>
                    </div>
                    <button
                        onClick={loadData}
                        disabled={loading}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors flex items-center gap-2 justify-center disabled:opacity-50 text-sm sm:text-base"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>

                {/* Statistics */}
                <VerifierStats stats={stats} loading={false} />

                {/* Filters & Search - Responsive */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-5">
                    <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
                        {/* Search - Full width on mobile */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search by filename or user..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                                />
                            </div>
                        </div>

                        {/* Filters - Side by side on mobile, inline on desktop */}
                        <div className="flex gap-2 sm:gap-3">
                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={statusFilter}
                                    onChange={(e) => {
                                        setStatusFilter(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                                >
                                    <option value="all">All Pending</option>
                                    <option value="pending">Pending Only</option>
                                    <option value="flagged">Flagged Only</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>

                            <div className="relative flex-1 sm:flex-none">
                                <select
                                    value={sortBy}
                                    onChange={(e) => {
                                        setSortBy(e.target.value);
                                        setPage(1);
                                    }}
                                    className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2.5 sm:py-3 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                                >
                                    <option value="oldest">Oldest First</option>
                                    <option value="newest">Newest First</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Review Queue */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-white">
                            Review Queue ({filteredQueue.length})
                        </h2>
                        {queueLoading && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="hidden sm:inline">Loading...</span>
                            </div>
                        )}
                    </div>

                    {filteredQueue.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex p-4 sm:p-6 bg-emerald-500/10 rounded-full mb-4"
                            >
                                <UserCheck className="w-10 h-10 sm:w-12 sm:h-12 text-emerald-400" />
                            </motion.div>
                            <p className="text-lg sm:text-xl text-white font-medium mb-2">All caught up!</p>
                            <p className="text-sm sm:text-base text-slate-400">No pending documents to review</p>
                        </div>
                    ) : (
                        <div className="space-y-3 sm:space-y-4">
                            {filteredQueue.map((doc) => (
                                <ReviewQueueCard
                                    key={doc.id}
                                    document={doc}
                                    onView={() => handleView(doc)}
                                    onQuickReview={(decision) => handleQuickReview(doc.id, decision)}
                                    loading={queueLoading}
                                />
                            ))}
                        </div>
                    )}

                    {/* Pagination - Responsive */}
                    {totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-6 pt-6 border-t border-slate-800">
                            <p className="text-xs sm:text-sm text-slate-400">
                                Page {page} of {totalPages}
                            </p>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1 || queueLoading}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages || queueLoading}
                                    className="flex-1 sm:flex-none px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Review Modal */}
            <ManualReviewModal
                isOpen={reviewModal.open}
                document={reviewModal.doc}
                onClose={() => setReviewModal({ open: false, doc: null })}
                onReviewComplete={handleReviewComplete}
            />
        </div>
    );
}
