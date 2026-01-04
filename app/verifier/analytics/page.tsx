'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
    TrendingUp, CheckCircle, XCircle, AlertTriangle, Clock,
    BarChart3, Activity, RefreshCw
} from 'lucide-react';
import { LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const COLORS = {
    approved: '#10b981',
    rejected: '#ef4444',
    flagged: '#f59e0b'
};

export default function VerifierAnalyticsPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [analytics, setAnalytics] = useState<any>(null);
    const [timePeriod, setTimePeriod] = useState(30);

    useEffect(() => {
        loadAnalytics();
    }, [timePeriod]);

    const loadAnalytics = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:8000/api/verifier/analytics?days=${timePeriod}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 403) {
                router.push('/banned');
                return;
            }

            if (response.status === 401) {
                router.push('/login');
                return;
            }

            const data = await response.json();
            setAnalytics(data);
        } catch (error) {
            console.error('Failed to load analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-slate-400">Loading analytics...</p>
                </div>
            </div>
        );
    }

    if (!analytics) {
        return (
            <div className="p-8 text-center">
                <p className="text-slate-400">Failed to load analytics</p>
            </div>
        );
    }

    const { overview, trends, recent_activity } = analytics;
    const statusData = [
        { name: 'Approved', value: overview.approved, color: COLORS.approved },
        { name: 'Rejected', value: overview.rejected, color: COLORS.rejected },
        { name: 'Flagged', value: overview.flagged, color: COLORS.flagged }
    ];

    return (
        <div className="px-4 lg:px-8 py-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
                    <p className="text-slate-400">Verification performance and trends</p>
                </div>
                <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                    {/* Time Period Selector */}
                    <select
                        value={timePeriod}
                        onChange={(e) => setTimePeriod(Number(e.target.value))}
                        className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                    >
                        <option value={7}>Last 7 days</option>
                        <option value={30}>Last 30 days</option>
                        <option value={90}>Last 3 months</option>
                    </select>
                    <button
                        onClick={() => loadAnalytics()}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                    >
                        <RefreshCw className="w-5 h-5 text-white" />
                    </button>
                </div>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-emerald-500/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-emerald-500/20 rounded-lg">
                            <BarChart3 className="w-6 h-6 text-emerald-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Total Reviews</p>
                            <p className="text-3xl font-bold text-white">{overview.total_reviews}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                            <TrendingUp className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Approval Rate</p>
                            <p className="text-3xl font-bold text-white">{overview.approval_rate}%</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 border border-yellow-500/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-yellow-500/20 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Pending Queue</p>
                            <p className="text-3xl font-bold text-white">{overview.pending_queue}</p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/30"
                >
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                            <Activity className="w-6 h-6 text-purple-400" />
                        </div>
                        <div>
                            <p className="text-slate-400 text-sm">Period</p>
                            <p className="text-3xl font-bold text-white">{timePeriod}d</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {/* Reviews Trend */}
                <div className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">Reviews Over Time</h3>
                    <div className="w-full min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]">
                        <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={trends.daily_reviews}>
                            <XAxis
                                dataKey="date"
                                stroke="#64748b"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <YAxis
                                stroke="#64748b"
                                tick={{ fill: '#94a3b8', fontSize: 12 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} name="Total" />
                            <Line type="monotone" dataKey="approved" stroke={COLORS.approved} strokeWidth={2} name="Approved" />
                            <Line type="monotone" dataKey="rejected" stroke={COLORS.rejected} strokeWidth={2} name="Rejected" />
                            <Line type="monotone" dataKey="flagged" stroke={COLORS.flagged} strokeWidth={2} name="Flagged" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
                </div>

                {/* Status Distribution */}
                <div className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-800">
                    <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">Status Distribution</h3>
                    <div className="w-full min-h-[200px] sm:min-h-[250px] lg:min-h-[300px]">
                        <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={statusData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={100}
                                fill="#8884d8"
                                dataKey="value"
                            >
                                {statusData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1e293b',
                                    border: '1px solid #334155',
                                    borderRadius: '8px'
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-3 sm:p-4 lg:p-6 rounded-xl sm:rounded-2xl bg-slate-900/50 border border-slate-800">
                <h3 className="text-base sm:text-lg lg:text-xl font-bold text-white mb-3 sm:mb-4 lg:mb-6">Recent Reviews</h3>
                <div className="space-y-3">
                    {recent_activity.slice(0, 10).map((activity: any, index: number) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-colors"
                        >
                            <div className="flex items-start sm:items-center gap-3 sm:gap-4 min-w-0 flex-1 w-full sm:w-auto">
                                {activity.status === 'approved' && <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400 flex-shrink-0 mt-0.5 sm:mt-0" />}
                                {activity.status === 'rejected' && <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 flex-shrink-0 mt-0.5 sm:mt-0" />}
                                {activity.status === 'flagged' && <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-400 flex-shrink-0 mt-0.5 sm:mt-0" />}
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm sm:text-base text-white font-medium truncate break-words">{activity.document_name}</p>
                                    <p className="text-xs sm:text-sm text-slate-400 truncate break-words">by {activity.reviewer_name}</p>
                                </div>
                            </div>
                            <div className="text-left sm:text-right flex-shrink-0 w-full sm:w-auto">
                                <p className={`text-xs sm:text-sm font-medium whitespace-nowrap ${activity.status === 'approved' ? 'text-emerald-400' :
                                        activity.status === 'rejected' ? 'text-red-400' :
                                            'text-yellow-400'
                                    }`}>
                                    {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                                </p>
                                <p className="text-xs text-slate-500 whitespace-nowrap">
                                    {new Date(activity.reviewed_at).toLocaleDateString()}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
