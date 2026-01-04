'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Search, Filter, Upload, Download, Trash2,
    Shield, CheckCircle, Clock, AlertTriangle, Grid,
    List, ChevronDown, X, Eye, Sparkles, Terminal, UserCheck, Link2
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';
import DeleteConfirmModal from '@/components/modals/DeleteConfirmModal';
import ViewDocumentModal from '@/components/modals/ViewDocumentModal';
import ManualReviewModal from '@/components/modals/ManualReviewModal';
import CertificateButton from '@/components/CertificateButton';
import SearchBar from '@/components/SearchBar';
import DocumentFilters, { DocumentStatus, DateRange, SortOption } from '@/components/filters/DocumentFilters';
import ShareModal from '@/components/modals/ShareModal';
import Pagination from '@/components/Pagination';

interface Document {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    category: string;
    uploadedAt: string;
    verificationStatus: string;
    fileHash: string;
    reviewHistory?: Array<{
        reviewer_id: string;
        reviewer_name: string;
        decision: string;
        notes: string;
        reviewed_at: string;
    }>;
}

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');
    const [viewModal, setViewModal] = useState<{ open: boolean; doc: Document | null }>({ open: false, doc: null });
    const [deleteModal, setDeleteModal] = useState<{ open: boolean; doc: Document | null }>({ open: false, doc: null });
    const [reviewModal, setReviewModal] = useState<{ open: boolean; doc: Document | null }>({ open: false, doc: null });
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [userRole, setUserRole] = useState<string>('user');
    const [shareModal, setShareModal] = useState<{ open: boolean; doc: Document | null }>({ open: false, doc: null });

    // New search and filter state
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState<{
        status: DocumentStatus;
        dateRange: DateRange;
        sortBy: SortOption;
    }>({
        status: 'all',
        dateRange: 'all',
        sortBy: 'newest'
    });

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [totalItems, setTotalItems] = useState(0);

    useEffect(() => {
        loadDocuments();
        loadUserRole();
    }, [searchTerm, filters, currentPage, itemsPerPage]);

    const loadUserRole = async () => {
        try {
            const user = await apiClient.getCurrentUser();
            setUserRole(user.role);
        } catch (error) {
            console.error('Failed to load user role:', error);
            // Default to 'user' role if fetch fails
            setUserRole('user');
        }
    };

    const loadDocuments = async () => {
        try {
            // Map frontend filter values to backend params
            const sortMap: Record<SortOption, { sort_by: string; sort_order: string }> = {
                'newest': { sort_by: 'createdAt', sort_order: 'desc' },
                'oldest': { sort_by: 'createdAt', sort_order: 'asc' },
                'name-asc': { sort_by: 'fileName', sort_order: 'asc' },
                'name-desc': { sort_by: 'fileName', sort_order: 'desc' }
            };

            const docs = await apiClient.getDocuments({
                search: searchTerm || undefined,
                status_filter: filters.status,
                date_range: filters.dateRange,
                sort_by: sortMap[filters.sortBy].sort_by,
                sort_order: sortMap[filters.sortBy].sort_order,
                page: currentPage,
                limit: itemsPerPage
            });

            setDocuments(docs);
            // Estimate total (backend doesn't return count yet)
            setTotalItems(docs.length < itemsPerPage ? (currentPage - 1) * itemsPerPage + docs.length : currentPage * itemsPerPage + 1);
        } catch (error: any) {
            console.error('Failed to load documents:', error);
            if (error.message.includes('Not authenticated') ||
                error.message.includes('401') ||
                error.message.includes('Unauthorized')) {
                router.push('/login?expired=true');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleView = (doc: Document) => {
        setViewModal({ open: true, doc });
    };

    const handleDownload = async (doc: Document) => {
        try {
            const blob = await apiClient.downloadDocument(doc.id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = doc.fileName;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Download failed:', error);
            alert('Failed to download document');
        }
    };

    const handleDelete = (doc: Document) => {
        setDeleteModal({ open: true, doc });
    };

    const handleReview = (doc: Document) => {
        setReviewModal({ open: true, doc });
    };

    const handleReviewComplete = async () => {
        await loadDocuments();
    };

    const confirmDelete = async () => {
        if (!deleteModal.doc) return;

        setDeleteLoading(true);
        try {
            await apiClient.deleteDocument(deleteModal.doc.id);
            setDeleteModal({ open: false, doc: null });
            await loadDocuments();
        } catch (error) {
            console.error('Delete failed:', error);
        } finally {
            setDeleteLoading(false);
        }
    };

    const filteredDocuments = documents.filter(doc => {
        const matchesSearch = doc.fileName.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = selectedStatus === 'all' || doc.verificationStatus === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    const getStatusBadgeClasses = (status: string) => {
        switch (status) {
            case 'verified':
                return 'bg-emerald-500/10 border-emerald-500/30';
            case 'pending':
                return 'bg-yellow-500/10 border-yellow-500/30';
            case 'flagged':
                return 'bg-red-500/10 border-red-500/30';
            default:
                return 'bg-slate-500/10 border-slate-500/30';
        }
    };

    const getStatusTextColor = (status: string) => {
        switch (status) {
            case 'verified': return 'text-emerald-400';
            case 'pending': return 'text-yellow-400';
            case 'flagged': return 'text-red-400';
            default: return 'text-slate-400';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'verified': return CheckCircle;
            case 'pending': return Clock;
            case 'flagged': return AlertTriangle;
            default: return Shield;
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <>
            {/* Header Section */}
            <section className="relative py-8 px-6 lg:px-12 overflow-hidden">
                {/* Grid background */}
                <div className="absolute inset-0" style={{
                    backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                    backgroundSize: '50px 50px'
                }} />

                <div className="relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                    <FileText className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white">Document Vault</h1>
                                    <p className="text-slate-400 mt-1">
                                        {documents.length} {documents.length === 1 ? 'document' : 'documents'} • Quantum-secured
                                    </p>
                                </div>
                            </div>
                        </div>

                        <a href="/upload">
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                            >
                                <Upload className="w-5 h-5" />
                                Upload Document
                            </motion.button>
                        </a>
                    </motion.div>
                </div>
            </section>

            {/* Toolbar */}
            <section className="px-6 lg:px-12 mb-8">
                <div>
                    <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-xl">
                        {/* Search Bar */}
                        <div className="mb-4">
                            <SearchBar
                                value={searchTerm}
                                onChange={setSearchTerm}
                                placeholder="Search documents by name..."
                            />
                        </div>

                        {/* Filters and View Mode */}
                        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                            {/* Document Filters */}
                            <DocumentFilters
                                filters={filters}
                                onChange={setFilters}
                                onClear={() => {
                                    setFilters({
                                        status: 'all',
                                        dateRange: 'all',
                                        sortBy: 'newest'
                                    });
                                    setSearchTerm('');
                                    setCurrentPage(1);
                                }}
                            />

                            {/* View Mode */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 rounded-lg border transition-all ${viewMode === 'grid'
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                        }`}
                                >
                                    <Grid className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 rounded-lg border transition-all ${viewMode === 'list'
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'border-slate-700 bg-slate-800/50 text-slate-400 hover:bg-slate-800'
                                        }`}
                                >
                                    <List className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Documents Grid/List */}
            <section className="px-6 lg:px-12 pb-20">
                <div>
                    {filteredDocuments.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="p-16 rounded-xl bg-slate-900/50 border border-slate-800 text-center"
                        >
                            <div className="inline-flex p-6 rounded-full bg-slate-800/50 mb-6">
                                <FileText className="w-16 h-16 text-slate-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-white mb-2">
                                {searchQuery || selectedStatus !== 'all' ? 'No documents found' : 'No documents yet'}
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {searchQuery || selectedStatus !== 'all'
                                    ? 'Try adjusting your search or filters'
                                    : 'Upload your first document to get started with quantum-safe verification'
                                }
                            </p>
                            {!searchQuery && selectedStatus === 'all' && (
                                <a href="/upload">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        className="px-6 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-black font-semibold inline-flex items-center gap-2"
                                    >
                                        <Upload className="w-5 h-5" />
                                        Upload Document
                                    </motion.button>
                                </a>
                            )}
                        </motion.div>
                    ) : (
                        <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4' : 'space-y-4'}>
                            {filteredDocuments.map((doc, index) => {
                                const StatusIcon = getStatusIcon(doc.verificationStatus);
                                const badgeClasses = getStatusBadgeClasses(doc.verificationStatus);
                                const textColor = getStatusTextColor(doc.verificationStatus);

                                return (
                                    <motion.div
                                        key={doc.id}
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        whileHover={{ y: -5 }}
                                        className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/30 transition-all shadow-lg hover:shadow-emerald-500/10"
                                    >
                                        <div className="space-y-4">
                                            {/* File Icon & Name */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                                    <FileText className="w-6 h-6 text-emerald-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-white font-medium truncate" title={doc.fileName}>
                                                        {doc.fileName}
                                                    </h3>
                                                    <p className="text-sm text-slate-400">
                                                        {(doc.fileSize / 1024).toFixed(2)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Status Badge */}
                                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm ${badgeClasses} ${textColor}`}>
                                                <StatusIcon className="w-4 h-4" />
                                                <span className="capitalize">{doc.verificationStatus}</span>
                                            </div>

                                            {/* Rejected Reason Alert */}
                                            {doc.verificationStatus === 'rejected' && (doc as any).reviewHistory && (doc as any).reviewHistory.length > 0 && (
                                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                                                    <p className="text-sm font-semibold text-red-400 mb-1">❌ Rejected by Verifier</p>
                                                    <p className="text-xs text-red-300">
                                                        {(doc as any).reviewHistory[(doc as any).reviewHistory.length - 1].notes || 'No reason provided'}
                                                    </p>
                                                    <p className="text-xs text-red-400/60 mt-1">
                                                        Reviewed by: {(doc as any).reviewHistory[(doc as any).reviewHistory.length - 1].reviewer_name || 'Unknown'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Flagged Reason Alert */}
                                            {doc.verificationStatus === 'flagged' && (doc as any).reviewHistory && (doc as any).reviewHistory.length > 0 && (
                                                <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                                                    <p className="text-sm font-semibold text-orange-400 mb-1">⚠️ Flagged by Verifier</p>
                                                    <p className="text-xs text-orange-300">
                                                        {(doc as any).reviewHistory[(doc as any).reviewHistory.length - 1].notes || 'No reason provided'}
                                                    </p>
                                                    <p className="text-xs text-orange-400/60 mt-1">
                                                        Reviewed by: {(doc as any).reviewHistory[(doc as any).reviewHistory.length - 1].reviewer_name || 'Unknown'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Approved Note */}
                                            {doc.verificationStatus === 'verified' && (doc as any).reviewHistory && (doc as any).reviewHistory.length > 0 && (
                                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                                    <p className="text-sm font-semibold text-emerald-400 mb-1">✓ Approved by Verifier</p>
                                                    {(doc as any).reviewHistory[(doc as any).reviewHistory.length - 1].notes && (
                                                        <p className="text-xs text-emerald-300">
                                                            {(doc as any).reviewHistory[(doc as any).reviewHistory.length - 1].notes}
                                                        </p>
                                                    )}
                                                    <p className="text-xs text-emerald-400/60 mt-1">
                                                        Reviewed by: {(doc as any).reviewHistory[(doc as any).reviewHistory.length - 1].reviewer_name || 'Unknown'}
                                                    </p>
                                                </div>
                                            )}

                                            {/* Hash */}
                                            <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700">
                                                <p className="text-xs text-slate-500 mb-1">SHA-256 Hash</p>
                                                <p className="text-xs font-mono text-slate-400 truncate" title={doc.fileHash}>
                                                    {doc.fileHash}
                                                </p>
                                            </div>

                                            {/* Actions - Fixed to stay within card */}
                                            <div className="flex gap-2">
                                                {(doc.verificationStatus === 'pending' || doc.verificationStatus === 'flagged') &&
                                                    (userRole === 'verifier' || userRole === 'admin') && (
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleReview(doc)}
                                                            className="px-3 py-2 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/20 transition-colors flex items-center justify-center"
                                                            title="Review"
                                                        >
                                                            <UserCheck className="w-4 h-4" />
                                                        </motion.button>
                                                    )}

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleView(doc)}
                                                    className="px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center"
                                                    title="View"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </motion.button>

                                                {/* Share Button - Show for verified/analyzed docs */}
                                                {(doc.verificationStatus === 'verified' || doc.verificationStatus === 'analyzed') && (
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => setShareModal({ open: true, doc })}
                                                        className="px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center"
                                                        title="Share"
                                                    >
                                                        <Link2 className="w-4 h-4" />
                                                    </motion.button>
                                                )}

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDownload(doc)}
                                                    className="px-3 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-colors flex items-center justify-center"
                                                    title="Download"
                                                >
                                                    <Download className="w-4 h-4" />
                                                </motion.button>

                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(doc)}
                                                    className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                            </div>

                                            {/* Certificate Button for Verified Documents */}
                                            {doc.verificationStatus === 'verified' && (
                                                <div className="mt-3">
                                                    <CertificateButton
                                                        documentId={doc.id}
                                                        documentName={doc.fileName}
                                                        verificationStatus={doc.verificationStatus}
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </section>

            {/* Pagination */}
            <section className="px-6 lg:px-12 mb-8">
                <Pagination
                    currentPage={currentPage}
                    totalPages={Math.ceil(totalItems / itemsPerPage)}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={(page) => setCurrentPage(page)}
                    onItemsPerPageChange={(perPage) => {
                        setItemsPerPage(perPage);
                        setCurrentPage(1);
                    }}
                />
            </section>

            {/* Modals */}
            <DeleteConfirmModal
                isOpen={deleteModal.open}
                fileName={deleteModal.doc?.fileName || ''}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteModal({ open: false, doc: null })}
                loading={deleteLoading}
            />


            <ViewDocumentModal
                isOpen={viewModal.open}
                document={viewModal.doc}
                onClose={() => setViewModal({ open: false, doc: null })}
            />

            <ManualReviewModal
                isOpen={reviewModal.open}
                document={reviewModal.doc}
                onClose={() => setReviewModal({ open: false, doc: null })}
                onReviewComplete={handleReviewComplete}
            />

            <ShareModal
                isOpen={shareModal.open}
                document={shareModal.doc}
                onClose={() => setShareModal({ open: false, doc: null })}
            />
        </>
    );
}
