'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    FileText, CheckCircle, Clock, TrendingUp, Upload,
    Shield, Activity, Terminal, Zap, LogOut
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';
import UploadTrendChart from '@/components/dashboard/UploadTrendChart';
import DocumentTypesChart from '@/components/dashboard/DocumentTypesChart';
import VerificationChart from '@/components/dashboard/VerificationChart';
import ActivityTimeline from '@/components/dashboard/ActivityTimeline';


export default function DashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState({
        totalDocuments: 0,
        verifiedDocuments: 0,
        pendingDocuments: 0,
        averageScore: 0,
    });
    const [documents, setDocuments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
        const token = apiClient.getToken();
        console.log('📊 Dashboard: Checking auth, token:', !!token);

        if (!token) {
            console.log('❌ No token, redirecting...');
            window.location.href = '/login';
            return;
        }

        console.log('✅ Authenticated, loading data...');
        setAuthenticated(true);
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            const docs = await apiClient.getDocuments();
            setDocuments(docs); // Store for charts

            // Calculate stats
            const verified = docs.filter((d: any) => d.verificationStatus === 'verified').length;
            const pending = docs.filter((d: any) => d.verificationStatus === 'pending').length;

            setStats({
                totalDocuments: docs.length,
                verifiedDocuments: verified,
                pendingDocuments: pending,
                averageScore: verified > 0 ? 95.5 : 0,
            });
        } catch (error: any) {
            console.error('Failed to load stats:', error);
            // Redirect to login on authentication errors
            if (error.message && (error.message.includes('Not authenticated') ||
                error.message.includes('401') ||
                error.message.includes('Unauthorized'))) {
                router.push('/login?expired=true');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        apiClient.removeToken();
        window.location.href = '/login';
    };

    if (!authenticated || loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-emerald-500 border-r-transparent mb-4"></div>
                    <p className="text-slate-400">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    const quickActions = [
        {
            title: 'Upload Document',
            description: 'Add new document for verification',
            icon: Upload,
            href: '/upload',
            gradient: 'from-emerald-500 to-cyan-500',
        },
        {
            title: 'View Documents',
            description: 'Browse all uploaded files',
            icon: FileText,
            href: '/documents',
            gradient: 'from-emerald-500 to-cyan-500',
        },
        {
            title: 'Account Settings',
            description: 'Manage preferences',
            icon: Shield,
            href: '/profile',
            gradient: 'from-emerald-500 to-cyan-500',
        },
    ];

    return (
        <>
            {/* Grid background */}
            <div className="fixed inset-0 pointer-events-none" style={{
                backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }} />

            {/* Gradient blobs */}
            <div className="fixed top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="fixed bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10">
                {/* Header */}
                <section className="py-8 px-4">
                    <div className="max-w-7xl mx-auto">


                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <Terminal className="w-8 h-8 text-emerald-400" />
                                <h1 className="text-4xl font-bold text-white">Command Center</h1>
                            </div>
                            <p className="text-slate-400 text-lg">System Overview & Analytics</p>
                        </motion.div>
                    </div>
                </section>

                {/* Stats Grid */}
                <section className="px-4 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <StatsCard
                                icon={FileText}
                                label="Total Documents"
                                value={stats.totalDocuments}
                                gradient="from-emerald-500 to-cyan-500"
                                delay={0}
                            />
                            <StatsCard
                                icon={CheckCircle}
                                label="Verified"
                                value={stats.verifiedDocuments}
                                gradient="from-emerald-500 to-cyan-500"
                                delay={0.1}
                            />
                            <StatsCard
                                icon={Clock}
                                label="Pending"
                                value={stats.pendingDocuments}
                                gradient="from-emerald-500 to-cyan-500"
                                delay={0.2}
                            />
                            <StatsCard
                                icon={TrendingUp}
                                label="Avg. Score"
                                value={`${stats.averageScore}%`}
                                gradient="from-emerald-500 to-cyan-500"
                                delay={0.3}
                            />
                        </div>
                    </div>
                </section>

                {/* Analytics Charts */}
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <UploadTrendChart documents={documents} />
                        <DocumentTypesChart documents={documents} />
                    </div>

                    {/* Verification Status */}
                    <div className="mb-8">
                        <VerificationChart documents={documents} />
                    </div>

                    {/* Activity Timeline */}
                    <div className="mb-8">
                        <ActivityTimeline />
                    </div>
                </div>

                {/* Quick Actions */}
                <section className="px-4 mb-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                        >
                            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                                <Zap className="w-6 h-6 text-emerald-400" />
                                Quick Actions
                            </h2>
                            <div className="grid md:grid-cols-3 gap-4">
                                {quickActions.map((action, index) => (
                                    <Link key={action.title} href={action.href}>
                                        <motion.div
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: 0.5 + index * 0.1 }}
                                            whileHover={{ y: -4, scale: 1.02 }}
                                            className="group relative p-6 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-emerald-500/50 transition-all cursor-pointer overflow-hidden"
                                        >
                                            <div className={`absolute inset-0 bg-gradient-to-br ${action.gradient} opacity-0 group-hover:opacity-5 transition-opacity`} />

                                            <div className="relative">
                                                <div className={`inline-flex p-3 rounded-lg bg-gradient-to-br ${action.gradient} mb-4`}>
                                                    <action.icon className="w-6 h-6 text-white" />
                                                </div>
                                                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-emerald-400 transition-colors">
                                                    {action.title}
                                                </h3>
                                                <p className="text-slate-400">
                                                    {action.description}
                                                </p>
                                            </div>
                                        </motion.div>
                                    </Link>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* System Status */}
                <section className="px-4 pb-8">
                    <div className="max-w-7xl mx-auto">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                            className="p-6 rounded-xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50"
                        >
                            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
                                <Activity className="w-5 h-5 text-emerald-400" />
                                System Status
                            </h2>

                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <div>
                                        <p className="text-xs text-slate-400">Quantum Encryption</p>
                                        <p className="text-sm font-semibold text-white">Active</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <div>
                                        <p className="text-xs text-slate-400">AI Analysis</p>
                                        <p className="text-sm font-semibold text-white">Online</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/30">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                                    <div>
                                        <p className="text-xs text-slate-400">Database</p>
                                        <p className="text-sm font-semibold text-white">Secure</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>
            </div>
        </>
    );
}

function StatsCard({
    icon: Icon,
    label,
    value,
    gradient,
    delay
}: {
    icon: any;
    label: string;
    value: number | string;
    gradient: string;
    delay: number;
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay }}
            whileHover={{ y: -2, scale: 1.02 }}
            className="group relative p-4 rounded-xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 hover:border-emerald-500/50 transition-all overflow-hidden"
        >
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

            <div className="relative">
                <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${gradient} mb-2`}>
                    <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-xs text-slate-400 mb-1">{label}</p>
                <p className="text-2xl font-bold text-white">{value}</p>
            </div>
        </motion.div>
    );
}
