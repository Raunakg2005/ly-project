'use client';

import { useEffect, useState } from 'react';
import { Users, CheckCircle, TrendingUp, Target } from 'lucide-react';
import { motion } from 'framer-motion';

interface VerifierStatsProps {
    stats: {
        pending_count: number;
        reviewed_today: number;
        reviewed_this_week: number;
        reviewed_total: number;
        approval_rate: number;
    } | null;
    loading: boolean;
}

export default function VerifierStats({ stats, loading }: VerifierStatsProps) {
    if (loading) {
        return (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6 animate-pulse">
                        <div className="h-4 bg-slate-700 rounded w-20 mb-3"></div>
                        <div className="h-8 bg-slate-700 rounded w-16"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (!stats) return null;

    const statCards = [
        {
            title: 'Pending',
            value: stats.pending_count,
            icon: Users,
            color: 'text-yellow-400',
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500/30',
            alert: stats.pending_count > 20
        },
        {
            title: 'Today',
            value: stats.reviewed_today,
            icon: CheckCircle,
            color: 'text-emerald-400',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/30'
        },
        {
            title: 'This Week',
            value: stats.reviewed_this_week,
            icon: TrendingUp,
            color: 'text-blue-400',
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500/30'
        },
        {
            title: 'Approval Rate',
            value: `${stats.approval_rate}%`,
            icon: Target,
            color: 'text-purple-400',
            bgColor: 'bg-purple-500/10',
            borderColor: 'border-purple-500/30'
        }
    ];

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {statCards.map((card, index) => (
                <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`bg-slate-900/50 rounded-xl border ${card.borderColor} p-4 sm:p-6 relative overflow-hidden ${card.alert ? 'ring-2 ring-yellow-500/50' : ''
                        }`}
                >
                    {/* Background Icon */}
                    <div className={`absolute -right-2 -top-2 opacity-5`}>
                        <card.icon className="w-20 h-20 sm:w-24 sm:h-24" />
                    </div>

                    {/* Content */}
                    <div className="relative">
                        <div className={`inline-flex p-2 sm:p-3 rounded-lg ${card.bgColor} mb-3`}>
                            <card.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${card.color}`} />
                        </div>
                        <p className="text-xs sm:text-sm text-slate-400 mb-1">{card.title}</p>
                        <p className={`text-2xl sm:text-3xl font-bold ${card.color}`}>
                            {card.value}
                        </p>
                        {card.alert && (
                            <p className="text-xs text-yellow-400 mt-2">High volume!</p>
                        )}
                    </div>
                </motion.div>
            ))}
        </div>
    );
}
