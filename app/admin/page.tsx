'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, Users, FileText, AlertTriangle, HardDrive, TrendingUp, Activity } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';
import Sidebar from '@/components/layout/Sidebar';
import Link from 'next/link';

export default function AdminDashboard() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        checkAdminAccess();
        loadStats();
    }, []);

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

    const loadStats = async () => {
        try {
            const data = await apiClient.getAdminStats();
            setStats(data);
        } catch (error: any) {
            console.error('Failed to load stats:', error);
            if (error.message && (error.message.includes('BANNED') || error.message.includes('suspended'))) {
                window.location.href = '/banned';
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 lg:ml-72 px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex items-center gap-2 sm:gap-3 mb-2">
                        <Shield className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Admin Dashboard</h1>
                    </div>
                    <p className="text-sm sm:text-base text-slate-400">System overview and quick actions</p>
                </div>

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        {/* Total Users */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-blue-400" />
                                <span className="text-xl sm:text-2xl font-bold text-blue-400">{stats.users.total}</span>
                            </div>
                            <h3 className="text-sm sm:text-base text-white font-semibold mb-2">Total Users</h3>
                            <div className="text-xs sm:text-sm text-slate-400 space-y-1">
                                <div>Admins: {stats.users.admins}</div>
                                <div>Verifiers: {stats.users.verifiers}</div>
                                <div>Regular: {stats.users.regular}</div>
                            </div>
                        </motion.div>

                        {/* Total Documents */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                                <span className="text-xl sm:text-2xl font-bold text-emerald-400">{stats.documents.total}</span>
                            </div>
                            <h3 className="text-sm sm:text-base text-white font-semibold mb-2">Total Documents</h3>
                            <div className="text-xs sm:text-sm text-slate-400 space-y-1">
                                <div>Verified: {stats.documents.verified}</div>
                                <div>Pending: {stats.documents.pending}</div>
                                <div>Flagged: {stats.documents.flagged}</div>
                            </div>
                        </motion.div>

                        {/* Pending Verifications */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-yellow-400" />
                                <span className="text-xl sm:text-2xl font-bold text-yellow-400">{stats.documents.pending}</span>
                            </div>
                            <h3 className="text-sm sm:text-base text-white font-semibold mb-2">Pending Reviews</h3>
                            <p className="text-xs sm:text-sm text-slate-400">Documents awaiting verification</p>
                        </motion.div>

                        {/* Storage Used */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6">
                            <div className="flex items-center justify-between mb-3 sm:mb-4">
                                <HardDrive className="w-6 h-6 sm:w-8 sm:h-8 text-purple-400" />
                                <span className="text-xl sm:text-2xl font-bold text-purple-400">{stats.storage.total_gb}</span>
                            </div>
                            <h3 className="text-sm sm:text-base text-white font-semibold mb-2">Storage Used (GB)</h3>
                            <p className="text-xs sm:text-sm text-slate-400">{stats.storage.total_mb} MB total</p>
                        </motion.div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <Link href="/admin/users">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6 cursor-pointer hover:border-emerald-500/50 transition-colors">
                            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">Manage Users</h3>
                            <p className="text-sm sm:text-base text-slate-400">View, edit, and manage user accounts</p>
                        </motion.div>
                    </Link>

                    <Link href="/verifier/documents">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6 cursor-pointer hover:border-blue-500/50 transition-colors">
                            <FileText className="w-8 h-8 sm:w-10 sm:h-10 text-blue-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">View Documents</h3>
                            <p className="text-sm sm:text-base text-slate-400">Browse all system documents</p>
                        </motion.div>
                    </Link>

                    <Link href="/admin/settings">
                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6 cursor-pointer hover:border-purple-500/50 transition-colors">
                            <Activity className="w-8 h-8 sm:w-10 sm:h-10 text-purple-400 mb-3 sm:mb-4" />
                            <h3 className="text-lg sm:text-xl font-bold text-white mb-2">System Settings</h3>
                            <p className="text-sm sm:text-base text-slate-400">Configure system parameters</p>
                        </motion.div>
                    </Link>
                </div>
            </main>
        </div>
    );
}
