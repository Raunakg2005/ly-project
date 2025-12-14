'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Search, Filter, Upload, Download, Trash2,
    Shield, CheckCircle, Clock, AlertTriangle, Grid,
    List, ChevronDown, X, Eye, Sparkles, Terminal
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';

interface Document {
    id: string;
    fileName: string;
    fileSize: number;
    fileType: string;
    category: string;
    uploadedAt: string;
    verificationStatus: string;
    fileHash: string;
}

export default function DocumentsPage() {
    const router = useRouter();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [filterOpen, setFilterOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        loadDocuments();
    }, []);

    const loadDocuments = async () => {
        try {
            const docs = await apiClient.getDocuments();
            setDocuments(docs);
        } catch (error) {
            console.error('Failed to load documents:', error);
            // If unauthorized, redirect to login
            if (error instanceof Error && error.message.includes('Not authenticated')) {
                router.push('/login');
            }
        } finally {
            setLoading(false);
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
                            <div className="flex flex-col lg:flex-row gap-4">
                                {/* Search */}
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        placeholder="Search documents..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Filter */}
                                <div className="relative">
                                    <button
                                        onClick={() => setFilterOpen(!filterOpen)}
                                        className="px-4 py-2.5 rounded-lg border border-slate-700 bg-slate-800/50 hover:bg-slate-800 text-white flex items-center gap-2 transition-all"
                                    >
                                        <Filter className="w-5 h-5" />
                                        Status: {selectedStatus === 'all' ? 'All' : selectedStatus}
                                        <ChevronDown className={`w-4 h-4 transition-transform ${filterOpen ? 'rotate-180' : ''}`} />
                                    </button>

                                    <AnimatePresence>
                                        {filterOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                className="absolute top-full mt-2 right-0 p-2 rounded-lg bg-slate-900 border border-slate-800 shadow-xl z-10 min-w-[200px]"
                                            >
                                                {['all', 'pending', 'verified', 'flagged'].map((status) => (
                                                    <button
                                                        key={status}
                                                        onClick={() => {
                                                            setSelectedStatus(status);
                                                            setFilterOpen(false);
                                                        }}
                                                        className={`w-full px-4 py-2 rounded-lg text-left transition-colors ${selectedStatus === status
                                                            ? 'bg-emerald-500/20 text-emerald-400'
                                                            : 'hover:bg-slate-800 text-slate-400'
                                                            }`}
                                                    >
                                                        {status.charAt(0).toUpperCase() + status.slice(1)}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

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
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            whileHover={{ y: -4 }}
                                            className="group relative p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden"
                                        >
                                            {/* Gradient glow on hover */}
                                            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10 transition-all" />

                                            <div className="relative">
                                                {/* Header */}
                                                <div className="flex items-start justify-between mb-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <FileText className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                                            <h3 className="text-base font-semibold text-white truncate group-hover:text-emerald-400 transition-colors" title={doc.fileName}>
                                                                {doc.fileName}
                                                            </h3>
                                                        </div>
                                                        <p className="text-sm text-slate-500 mb-3">
                                                            {(doc.fileSize / 1024).toFixed(2)} KB • {new Date(doc.uploadedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>

                                                {/* Status Badge */}
                                                <div className="flex items-center gap-2 mb-4">
                                                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${badgeClasses}`}>
                                                        <StatusIcon className={`w-4 h-4 ${textColor}`} />
                                                        <span className={`text-sm font-medium ${textColor}`}>
                                                            {doc.verificationStatus.charAt(0).toUpperCase() + doc.verificationStatus.slice(1)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Hash */}
                                                <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700 mb-4 overflow-hidden">
                                                    <p className="text-xs text-slate-500 mb-1">SHA-256 Hash</p>
                                                    <p className="text-xs font-mono text-slate-400 truncate" title={doc.fileHash}>
                                                        {doc.fileHash}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="flex-1 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        className="px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white transition-all"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </section>
        </>
    );
}
