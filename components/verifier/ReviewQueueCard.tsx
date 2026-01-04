'use client';

import { motion } from 'framer-motion';
import { Eye, CheckCircle, XCircle, User, Clock, FileText } from 'lucide-react';
import { useState } from 'react';

interface ReviewQueueCardProps {
    document: {
        id: string;
        file_name: string;
        file_size: number;
        file_type: string;
        verification_status: string;
        uploaded_at: string;
        user: {
            id: string;
            name: string;
            email: string;
        };
        waiting_time: string;
    };
    onView: () => void;
    onQuickReview: (decision: 'approved' | 'rejected') => void;
    loading?: boolean;
}

export default function ReviewQueueCard({ document, onView, onQuickReview, loading }: ReviewQueueCardProps) {
    const [actionLoading, setActionLoading] = useState(false);

    const handleQuickReview = async (decision: 'approved' | 'rejected') => {
        setActionLoading(true);
        await onQuickReview(decision);
        setActionLoading(false);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
            case 'flagged':
                return 'text-red-400 bg-red-500/10 border-red-500/30';
            default:
                return 'text-slate-400 bg-slate-500/10 border-slate-500/30';
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-5 hover:border-emerald-500/30 transition-all"
        >
            {/* Mobile Layout */}
            <div className="space-y-4">
                {/* Header - Always Visible */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="p-2 sm:p-3 bg-emerald-500/10 rounded-lg shrink-0">
                            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-white font-medium text-sm sm:text-base truncate">
                                {document.file_name}
                            </h3>
                            <p className="text-xs sm:text-sm text-slate-400 mt-1">
                                {(document.file_size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    </div>
                    <span className={`px-2 sm:px-3 py-1 rounded-lg text-xs font-medium border ${getStatusColor(document.verification_status)} whitespace-nowrap`}>
                        {document.verification_status}
                    </span>
                </div>

                {/* User & Time Info - Responsive Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm">
                    <div className="flex items-center gap-2 text-slate-400">
                        <User className="w-4 h-4 shrink-0" />
                        <div className="min-w-0">
                            <p className="truncate">{document.user.name}</p>
                            <p className="text-xs text-slate-500 truncate">{document.user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span>Waiting: {document.waiting_time}</span>
                    </div>
                </div>

                {/* Action Buttons - Responsive Layout */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-2">
                    <button
                        onClick={onView}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2.5 sm:py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-blue-400 hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                    >
                        <Eye className="w-4 h-4" />
                        <span>View Details</span>
                    </button>
                    <div className="flex gap-2 sm:gap-3">
                        <button
                            onClick={() => handleQuickReview('approved')}
                            disabled={actionLoading || loading}
                            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                        >
                            <CheckCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Approve</span>
                            <span className="sm:hidden">✓</span>
                        </button>
                        <button
                            onClick={() => handleQuickReview('rejected')}
                            disabled={actionLoading || loading}
                            className="flex-1 sm:flex-none px-4 py-2.5 sm:py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50"
                        >
                            <XCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Reject</span>
                            <span className="sm:hidden">✗</span>
                        </button>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
