'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    BarChart3, Users, FileText, TrendingUp, TrendingDown,
    Calendar, Download, Clock, CheckCircle, AlertTriangle,
    Activity, Zap, HardDrive
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminAnalyticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        checkAdminAccess();
        loadAnalytics();
    }, [timeRange]);

    const checkAdminAccess = async () => {
        try {
            const user = await apiClient.getCurrentUser();
            if (user.role !== 'admin') {
                router.push('/dashboard');
            }
        } catch (error: any) {
            if (error?.message && (error.message.includes('BANNED') || error.message.includes('suspended'))) {
                router.push('/banned');
            } else {
                router.push('/login');
            }
        }
    };

    const loadAnalytics = async () => {
        try {
            const data = await apiClient.getAdminStats();
            setStats(data);
        } catch (error: any) {
            console.error('Failed to load analytics:', error);
            if (error.message && (error.message.includes('BANNED') || error.message.includes('suspended'))) {
                window.location.href = '/banned';
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingScreen />;

    const kpis = [
        {
            label: 'Total Users',
            value: stats?.users?.total || 0,
            change: '+12%',
            trend: 'up',
            icon: Users,
            color: 'blue'
        },
        {
            label: 'Documents',
            value: stats?.documents?.total || 0,
            change: '+8%',
            trend: 'up',
            icon: FileText,
            color: 'emerald'
        },
        {
            label: 'Verified Today',
            value: stats?.documents?.verified || 0,
            change: '+15%',
            trend: 'up',
            icon: CheckCircle,
            color: 'green'
        },
        {
            label: 'Pending Reviews',
            value: stats?.documents?.pending || 0,
            change: '-5%',
            trend: 'down',
            icon: Clock,
            color: 'yellow'
        }
    ];

    const colorClasses = {
        blue: {
            bg: 'bg-blue-500/10',
            border: 'border-blue-500/30',
            text: 'text-blue-400',
            gradient: 'from-blue-500 to-cyan-500'
        },
        emerald: {
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/30',
            text: 'text-emerald-400',
            gradient: 'from-emerald-500 to-green-500'
        },
        green: {
            bg: 'bg-green-500/10',
            border: 'border-green-500/30',
            text: 'text-green-400',
            gradient: 'from-green-500 to-emerald-500'
        },
        yellow: {
            bg: 'bg-yellow-500/10',
            border: 'border-yellow-500/30',
            text: 'text-yellow-400',
            gradient: 'from-yellow-500 to-orange-500'
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 lg:ml-72 px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <BarChart3 className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                            Analytics Dashboard
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 mt-1 sm:mt-2">
                            Comprehensive system insights and metrics
                        </p>
                    </div>

                    {/* Time Range Selector */}
                    <div className="flex items-center gap-3">
                        <div className="flex gap-2 bg-slate-900/50 border border-slate-800 rounded-lg p-1">
                            {['7d', '30d', '90d', 'All'].map((range) => (
                                <button
                                    key={range}
                                    onClick={() => setTimeRange(range)}
                                    className={`px-3 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${timeRange === range
                                            ? 'bg-emerald-500 text-black'
                                            : 'text-slate-400 hover:text-white'
                                        }`}
                                >
                                    {range}
                                </button>
                            ))}
                        </div>
                        <button className="p-2 bg-slate-900/50 border border-slate-800 rounded-lg hover:bg-slate-800 transition-colors">
                            <Download className="w-5 h-5 text-slate-400" />
                        </button>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                    {kpis.map((kpi, index) => {
                        const Icon = kpi.icon;
                        const TrendIcon = kpi.trend === 'up' ? TrendingUp : TrendingDown;
                        const colors = colorClasses[kpi.color as keyof typeof colorClasses];

                        return (
                            <motion.div
                                key={kpi.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-2 sm:p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                                        <Icon className={`w-5 h-5 sm:w-6 sm:h-6 ${colors.text}`} />
                                    </div>
                                    <div className={`flex items-center gap-1 text-xs sm:text-sm font-medium ${kpi.trend === 'up' ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        <TrendIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                                        {kpi.change}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{kpi.value}</p>
                                    <p className="text-xs sm:text-sm text-slate-400">{kpi.label}</p>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* User Growth Chart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            User Growth
                        </h3>
                        <div className="h-64 flex items-end justify-between gap-2">
                            {[65, 75, 85, 95, 100, 110, 125].map((height, i) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                    <motion.div
                                        initial={{ height: 0 }}
                                        animate={{ height: `${height}%` }}
                                        transition={{ delay: 0.6 + i * 0.1, duration: 0.5 }}
                                        className="w-full bg-gradient-to-t from-emerald-500/20 to-emerald-500/50 rounded-t-lg border-t-2 border-emerald-500"
                                    />
                                    <span className="text-xs text-slate-500">
                                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Verification Status */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
                    >
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-400" />
                            Verification Status
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-400">Verified</span>
                                    <span className="text-sm fontmedium text-green-400">
                                        {stats?.documents?.verified || 0} ({Math.round(((stats?.documents?.verified || 0) / (stats?.documents?.total || 1)) * 100)}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((stats?.documents?.verified || 0) / (stats?.documents?.total || 1)) * 100}%` }}
                                        transition={{ delay: 0.8, duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-green-500 to-emerald-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-400">Pending</span>
                                    <span className="text-sm font-medium text-yellow-400">
                                        {stats?.documents?.pending || 0} ({Math.round(((stats?.documents?.pending || 0) / (stats?.documents?.total || 1)) * 100)}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((stats?.documents?.pending || 0) / (stats?.documents?.total || 1)) * 100}%` }}
                                        transition={{ delay: 0.9, duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
                                    />
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between mb-2">
                                    <span className="text-sm text-slate-400">Flagged</span>
                                    <span className="text-sm font-medium text-red-400">
                                        {stats?.documents?.flagged || 0} ({Math.round(((stats?.documents?.flagged || 0) / (stats?.documents?.total || 1)) * 100)}%)
                                    </span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${((stats?.documents?.flagged || 0) / (stats?.documents?.total || 1)) * 100}%` }}
                                        transition={{ delay: 1.0, duration: 0.8 }}
                                        className="h-full bg-gradient-to-r from-red-500 to-pink-500"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* System Metrics */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Storage Usage */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/30">
                                <HardDrive className="w-5 h-5 text-purple-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Storage</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">
                            {stats?.storage?.total_gb || 0} GB
                        </div>
                        <p className="text-sm text-slate-400">{stats?.storage?.total_mb || 0} MB used</p>
                    </motion.div>

                    {/* Active Users */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                                <Zap className="w-5 h-5 text-cyan-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Active Users</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">
                            {stats?.users?.active_7d || 0}
                        </div>
                        <p className="text-sm text-slate-400">Last 7 days</p>
                    </motion.div>

                    {/* Verifiers */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-white">Verifiers</h3>
                        </div>
                        <div className="text-3xl font-bold text-white mb-2">
                            {stats?.users?.verifiers || 0}
                        </div>
                        <p className="text-sm text-slate-400">Total verifiers active</p>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
