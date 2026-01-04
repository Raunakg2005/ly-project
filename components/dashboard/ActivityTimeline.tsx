'use client';

import { motion } from 'framer-motion';
import { Upload, CheckCircle, AlertTriangle, FileText, Clock } from 'lucide-react';

interface ActivityTimelineProps {
    documents: any[];
}

const colorClasses = {
    emerald: {
        bg: 'bg-emerald-500/10',
        border: 'border-emerald-500/30',
        text: 'text-emerald-400',
        icon: 'text-emerald-400'
    },
    yellow: {
        bg: 'bg-yellow-500/10',
        border: 'border-yellow-500/30',
        text: 'text-yellow-400',
        icon: 'text-yellow-400'
    },
    red: {
        bg: 'bg-red-500/10',
        border: 'border-red-500/30',
        text: 'text-red-400',
        icon: 'text-red-400'
    }
};

function getTimeAgo(date: string) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now.getTime() - then.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export default function ActivityTimeline({ documents }: ActivityTimelineProps) {
    // Sort documents by upload date (most recent first) and take last 5
    const recentDocs = [...documents]
        .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
        .slice(0, 5);

    const activities = recentDocs.map(doc => {
        let icon, color, title;

        switch (doc.verificationStatus) {
            case 'verified':
                icon = CheckCircle;
                color = 'emerald';
                title = 'Document verified';
                break;
            case 'pending':
                icon = Clock;
                color = 'yellow';
                title = 'Verification pending';
                break;
            case 'flagged':
                icon = AlertTriangle;
                color = 'red';
                title = 'Document flagged';
                break;
            default:
                icon = Upload;
                color = 'emerald';
                title = 'Document uploaded';
        }

        return {
            icon,
            color,
            title,
            fileName: doc.fileName,
            timestamp: getTimeAgo(doc.uploadedAt)
        };
    });

    if (activities.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="p-3 sm:p-4 lg:p-6 rounded-xl bg-slate-900/50 border border-slate-800"
            >
                <div className="mb-4 sm:mb-6">
                    <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Recent Activity</h3>
                    <p className="text-xs sm:text-sm text-slate-400">Latest document actions</p>
                </div>
                <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-500">No recent activity</p>
                    <p className="text-sm text-slate-600 mt-1">Upload documents to see activity here</p>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-3 sm:p-4 lg:p-6 rounded-xl bg-slate-900/50 border border-slate-800"
        >
            {/* Header */}
            <div className="mb-4 sm:mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-white mb-1">Recent Activity</h3>
                <p className="text-xs sm:text-sm text-slate-400">Latest document actions</p>
            </div>

            {/* Timeline */}
            <div className="space-y-3 sm:space-y-4">
                {activities.map((activity, index) => {
                    const Icon = activity.icon;
                    const colors = colorClasses[activity.color as keyof typeof colorClasses];

                    return (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.4 + index * 0.05 }}
                            className="flex items-start gap-3 sm:gap-4"
                        >
                            {/* Icon */}
                            <div className={`p-1.5 sm:p-2 rounded-lg ${colors.bg} border ${colors.border} flex-shrink-0`}>
                                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${colors.icon}`} />
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1 sm:gap-2">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-white mb-1">
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
        </motion.div>
    );
}
