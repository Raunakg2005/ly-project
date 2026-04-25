'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Filter, Search, RefreshCw, ChevronDown, Zap, Inbox, Clock, X } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import VerifierStats from '@/components/verifier/VerifierStats';
import ReviewQueueCard from '@/components/verifier/ReviewQueueCard';
import ManualReviewModal from '@/components/modals/ManualReviewModal';
import LoadingScreen from '@/components/animations/LoadingScreen';

export default function VerifierDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [queue, setQueue] = useState<any[]>([]);
    const [myQueue, setMyQueue] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [queueLoading, setQueueLoading] = useState(false);
    const [claiming, setClaiming] = useState(false);
    const [releasing, setReleasing] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'global' | 'mine'>('global');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('oldest');
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [reviewModal, setReviewModal] = useState<{ open: boolean; doc: any }>({ open: false, doc: null });
    const [claimResult, setClaimResult] = useState<string>('');

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        loadQueue();
    }, [statusFilter, sortBy, page]);

    const loadData = async () => {
        setLoading(true);
        try {
            const [statsData, queueData, myQueueData] = await Promise.all([
                apiClient.getVerifierStats(),
                apiClient.getVerifierQueue({ status: statusFilter, sortBy, page, limit: 10 }),
                apiClient.getMyQueue()
            ]);
            setStats(statsData);
            setQueue(queueData.documents);
            setTotalPages(queueData.pages);
            setMyQueue(myQueueData.documents);
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
            const [queueData, myQueueData] = await Promise.all([
                apiClient.getVerifierQueue({ status: statusFilter, sortBy, page, limit: 10 }),
                apiClient.getMyQueue()
            ]);
            setQueue(queueData.documents);
            setTotalPages(queueData.pages);
            setMyQueue(myQueueData.documents);
        } catch (error) {
            console.error('Failed to load queue:', error);
        } finally {
            setQueueLoading(false);
        }
    };

    const handleClaimNext = async () => {
        setClaiming(true); setClaimResult('');
        try {
            const result = await apiClient.assignFromQueue();
            if (result.assigned) {
                setClaimResult(`Claimed: ${result.document.file_name}`);
                setActiveTab('mine');
                await loadData();
            } else {
                setClaimResult('No documents available in queue');
            }
        } catch { setClaimResult('Failed to claim document'); }
        finally { setClaiming(false); setTimeout(() => setClaimResult(''), 4000); }
    };

    const handleRelease = async (documentId: string) => {
        setReleasing(documentId);
        try {
            await apiClient.releaseAssignment(documentId);
            await loadQueue();
        } catch { alert('Failed to release document'); }
        finally { setReleasing(null); }
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
                    <div className="flex items-center gap-2">
                        {/* Claim Next button */}
                        <button onClick={handleClaimNext} disabled={claiming}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg transition-all flex items-center gap-2 text-sm font-medium disabled:opacity-60 shadow-lg shadow-emerald-500/20">
                            {claiming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                            Claim Next
                        </button>
                        <button onClick={loadData} disabled={loading}
                            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm disabled:opacity-50">
                            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                    </div>
                </div>

                {/* Claim result toast */}
                <AnimatePresence>
                    {claimResult && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                            className={`px-4 py-3 rounded-xl text-sm flex items-center gap-2 ${claimResult.startsWith('Claimed') ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400' : 'bg-amber-500/15 border border-amber-500/30 text-amber-400'}`}>
                            {claimResult.startsWith('Claimed') ? <Zap className="w-4 h-4" /> : <Inbox className="w-4 h-4" />}
                            {claimResult}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Statistics */}
                <VerifierStats stats={stats} loading={false} />

                {/* Queue Tab Switcher */}
                <div className="flex gap-2 bg-slate-900/50 rounded-xl border border-slate-800 p-1.5">
                    <button onClick={() => setActiveTab('global')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'global' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'}`}>
                        <Inbox className="w-4 h-4" /> Global Queue ({queue.length})
                    </button>
                    <button onClick={() => setActiveTab('mine')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === 'mine' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25' : 'text-slate-400 hover:text-white'}`}>
                        <UserCheck className="w-4 h-4" /> My Queue {myQueue.length > 0 && <span className="bg-emerald-400 text-emerald-900 text-xs font-bold px-1.5 rounded-full">{myQueue.length}</span>}
                    </button>
                </div>

                {/* Filters & Search */}
                {activeTab === 'global' && (
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
                )}

                {/* Review Queue / My Queue */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-5 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                        <h2 className="text-lg sm:text-xl font-bold text-white">
                            {activeTab === 'global' ? `Review Queue (${filteredQueue.length})` : `My Assigned (${myQueue.length})`}
                        </h2>
                        {queueLoading && (
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <RefreshCw className="w-4 h-4 animate-spin" />
                                <span className="hidden sm:inline">Loading...</span>
                            </div>
                        )}
                    </div>

                    {/* My Queue view */}
                    {activeTab === 'mine' && (
                        myQueue.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="inline-flex p-6 bg-slate-800 rounded-full mb-4">
                                    <UserCheck className="w-12 h-12 text-slate-500" />
                                </div>
                                <p className="text-lg text-white font-medium mb-2">No assigned documents</p>
                                <p className="text-sm text-slate-400 mb-5">Use "Claim Next" to pick up a document from the queue</p>
                                <button onClick={handleClaimNext} disabled={claiming}
                                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 mx-auto disabled:opacity-50">
                                    {claiming ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                                    Claim Next Document
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {myQueue.map((doc) => (
                                    <motion.div key={doc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                                        className="bg-slate-800/60 border border-emerald-500/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap mb-1">
                                                <span className="text-white font-medium truncate">{doc.file_name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${doc.verification_status === 'flagged' ? 'bg-amber-500/20 text-amber-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                    {doc.verification_status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-slate-400">
                                                <span>{doc.user?.name}</span>
                                                {doc.held_minutes !== undefined && (
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Held {doc.held_minutes}m</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => handleView(doc)}
                                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-xs transition-colors">
                                                Review
                                            </button>
                                            <button onClick={() => handleRelease(doc.id)} disabled={releasing === doc.id}
                                                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-xs transition-colors flex items-center gap-1 disabled:opacity-50">
                                                {releasing === doc.id ? <RefreshCw className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                                                Release
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )
                    )}

                    {/* Global queue view */}
                    {activeTab === 'global' && (
                    filteredQueue.length === 0 ? (
                        <div className="text-center py-12 sm:py-16">
                            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                                className="inline-flex p-4 sm:p-6 bg-emerald-500/10 rounded-full mb-4">
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
                    )
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
