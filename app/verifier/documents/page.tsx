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

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            // Get all documents (verifiers can see all documents in the system)
            const data = await apiClient.getVerifierDocuments();
            setDocuments(data.documents || []);
        } catch (error: any) {
            console.error('Failed to load documents:', error);
            if (error?.message?.includes('401')) {
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
                    </div>
                </div>

                {/* Documents Grid */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6">
                    <p className="text-white font-medium mb-4">{filteredDocs.length} documents found</p>

                    {filteredDocs.length === 0 ? (
                        <div className="text-center py-12">
                            <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                            <p className="text-slate-400">No documents found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredDocs.map((doc) => (
                                <div
                                    key={doc.id}
                                    className="bg-slate-800/50 rounded-lg border border-slate-700 p-4 hover:border-emerald-500/30 transition-all"
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1">
                                            <h3 className="text-white font-medium">{doc.fileName}</h3>
                                            <p className="text-sm text-slate-400 mt-1">
                                                {(doc.fileSize / 1024 / 1024).toFixed(2)} MB • {doc.fileType}
                                            </p>
                                            {doc.userName && (
                                                <p className="text-xs text-slate-500 mt-1">
                                                    Uploaded by: {doc.userName}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-3 py-1 rounded-lg text-xs font-medium ${doc.verificationStatus === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                                                doc.verificationStatus === 'rejected' ? 'bg-red-500/10 text-red-400 border border-red-500/30' :
                                                    doc.verificationStatus === 'flagged' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/30' :
                                                        'bg-yellow-500/10 text-yellow-400 border border-yellow-500/30'
                                                }`}>
                                                {doc.verificationStatus}
                                            </span>
                                        </div>

            {/* Modals */}
            <ManualReviewModal
                isOpen={reviewModalOpen}
                document={selectedDocument}
                onClose={() => {
                    setReviewModalOpen(false);
                    setSelectedDocument(null);
                }}
                onReviewComplete={() => {
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
                                    
                                    {/* Action Buttons */}
                                    <div className="mt-4 flex flex-wrap gap-2">
                                        <button
                                            onClick={() => {
                                                setSelectedDocument(doc);
                                                setViewModalOpen(true);
                                            }}
                                            className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                        <button
                                            onClick={() => {
                                                setSelectedDocument(doc);
                                                setReviewModalOpen(true);
                                            }}
                                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm flex items-center gap-2 transition-colors"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Review
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
