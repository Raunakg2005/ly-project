'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    CheckCircle,
    Clock,
    TrendingUp,
    Users,
    AlertTriangle,
    Target
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import VerifierStats from '@/components/verifier/VerifierStats';
import LoadingScreen from '@/components/animations/LoadingScreen';
import Link from 'next/link';

export default function VerifierDashboard() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const data = await apiClient.getVerifierStats();
            setStats(data);
        } catch (error) {
            console.error('Failed to load stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    const quickLinks = [
        {
            title: 'Review Queue',
            description: 'Review pending documents',
            icon: FileText,
            href: '/verifier/queue',
            color: 'emerald',
            count: stats?.pending_count || 0
        },
        {
            title: 'All Documents',
            description: 'View all system documents',
            icon: LayoutDashboard,
            href: '/verifier/documents',
            color: 'blue'
        }
    ];

    return (
        <div className="p-3 sm:p-4 md:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-3">
                        <LayoutDashboard className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-emerald-400" />
                        Verifier Dashboard
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-1">Welcome to your verification workspace</p>
                </div>

                {/* Statistics */}
                <VerifierStats stats={stats} loading={false} />

                {/* Quick Links */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                    {quickLinks.map((link, index) => (
                        <Link key={link.href} href={link.href}>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`bg-slate-900/50 rounded-xl border border-${link.color}-500/30 p-6 sm:p-8 hover:border-${link.color}-500/50 transition-all cursor-pointer group`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 sm:p-4 rounded-xl bg-${link.color}-500/10`}>
                                        <link.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-${link.color}-400`} />
                                    </div>
                                    {link.count !== undefined && (
                                        <span className={`px-3 py-1 rounded-full text-sm font-bold bg-${link.color}-500/20 text-${link.color}-400`}>
                                            {link.count}
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                    {link.title}
                                </h3>
                                <p className="text-sm sm:text-base text-slate-400">{link.description}</p>
                                <div className="mt-4 flex items-center text-emerald-400 text-sm font-medium group-hover:translate-x-2 transition-transform">
                                    View →
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-6">
                    <h2 className="text-xl font-bold text-white mb-4">Your Activity</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">Reviewed Today</p>
                            <p className="text-2xl font-bold text-emerald-400">{stats?.reviewed_today || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">This Week</p>
                            <p className="text-2xl font-bold text-blue-400">{stats?.reviewed_this_week || 0}</p>
                        </div>
                        <div className="p-4 bg-slate-800/50 rounded-lg">
                            <p className="text-sm text-slate-400 mb-1">Approval Rate</p>
                            <p className="text-2xl font-bold text-purple-400">{stats?.approval_rate || 0}%</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
