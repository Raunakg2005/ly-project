'use client';

import { motion } from 'framer-motion';
import { Upload, CheckCircle, Download, FileText, Clock } from 'lucide-react';

const activities = [
    {
        type: 'upload',
        icon: Upload,
        color: 'emerald',
        title: 'Uploaded document',
        fileName: 'certificate.pdf',
        timestamp: '2 hours ago'
    },
    {
        type: 'verified',
        icon: CheckCircle,
        color: 'emerald',
        title: 'Document verified',
        fileName: 'transcript.pdf',
        timestamp: '3 hours ago'
    },
    {
        type: 'download',
        icon: Download,
        color: 'cyan',
        title: 'Downloaded document',
        fileName: 'report.pdf',
        timestamp: '5 hours ago'
    },
    {
        type: 'upload',
        icon: Upload,
        color: 'emerald',
        title: 'Uploaded document',
        fileName: 'invoice.pdf',
        timestamp: '7 hours ago'
    },
    {
        type: 'pending',
        icon: Clock,
        color: 'yellow',
        title: 'Verification pending',
        fileName: 'contract.pdf',
        timestamp: '1 day ago'
    }
];

const colorClasses = {
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        icon: 'text-emerald-400'
    },
    cyan: {
        bg: 'bg-cyan-500/10',
        border: 'border-cyan-500/30',
        text: 'text-cyan-400',
        icon: 'text-cyan-400'
    },
    yellow: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: 'text-yellow-400'
    }
};

export default function ActivityTimeline() {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-6 rounded-xl bg-slate-900/50 border border-slate-800"
        >
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">Recent Activity</h3>
                <p className="text-sm text-slate-400">Latest document actions</p>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
                {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    const colors = colorClasses[activity.color as keyof typeof colorClasses];

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex items-start gap-4"
                        >
                            {/* Icon */}
                            <div className={`p-2 rounded-lg ${colors.bg} border ${colors.border} flex-shrink-0`}>
                                <Icon className={`w-4 h-4 ${colors.icon}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white mb-1">
                                            {activity.title}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <FileText className="w-3 h-3 text-slate-500 flex-shrink-0" />
                                            <p className="text-xs text-slate-400 truncate">
                                                {activity.fileName}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="text-xs text-slate-500 whitespace-nowrap">
                                        {activity.timestamp}
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>

            {/* View All */}
            <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full mt-6 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-sm font-medium transition-colors"
            >
                View All Activity
            </motion.button>
        </motion.div>
    );
}
