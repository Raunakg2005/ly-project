'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Database, Mail, FileText, Shield } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Sidebar from '@/components/layout/Sidebar';

export default function AdminSettingsPage() {
    const router = useRouter();

    useEffect(() => {
        checkAdminAccess();
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

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 lg:ml-72 px-4 sm:px-6 lg:px-8 py-6">
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
                        <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                        System Settings
                    </h1>
                    <p className="text-sm sm:text-base text-slate-400 mt-2">Configure system-wide parameters and preferences</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                    {/* Storage Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-4 sm:p-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
                            <Database className="w-5 h-5 sm:w-6 sm:h-6 text-blue-400" />
                            <h2 className="text-lg sm:text-xl font-bold text-white">Storage & Files</h2>
                        </div>
                        <div className="space-y-3 sm:space-y-4">
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                                    Max File Size (MB)
                                </label>
                                <input
                                    type="number"
                                    defaultValue="10"
                                    className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                                />
                            </div>
                            <div>
                                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">
                                    Allowed File Types
                                </label>
                                <input
                                    type="text"
                                    defaultValue="pdf, jpg, png, jpeg"
                                    className="w-full px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm sm:text-base"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Email Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Mail className="w-6 h-6 text-purple-400" />
                            <h2 className="text-xl font-bold text-white">Email Configuration</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    SMTP Server
                                </label>
                                <input
                                    type="text"
                                    placeholder="smtp.example.com"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    From Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="noreply@docshield.com"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Verification Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <Shield className="w-6 h-6 text-emerald-400" />
                            <h2 className="text-xl font-bold text-white">Verification</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Auto-assign to verifiers</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" defaultChecked />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Require manual review</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    </motion.div>

                    {/* Document Settings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-slate-900/50 rounded-xl border border-slate-800 p-6"
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <FileText className="w-6 h-6 text-yellow-400" />
                            <h2 className="text-xl font-bold text-white">Document Retention</h2>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Delete after (days)
                                </label>
                                <input
                                    type="number"
                                    defaultValue="90"
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-slate-300">Auto-delete unverified</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" />
                                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-emerald-500 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                                </label>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Save Button */}
                <div className="mt-6 sm:mt-8 flex justify-end">
                    <button className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors text-sm sm:text-base">
                        Save Settings
                    </button>
                </div>
            </main>
        </div>
    );
}
