'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, Key, Bell, Database } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return; // Wait for client-side mount
        loadUser();
    }, [mounted, router]);

    const loadUser = async () => {
        try {
            // Check if token exists first
            const token = apiClient.getToken();
            if (!token) {
                console.log('❌ No token found, redirecting to login');
                router.push('/login');
                return;
            }

            console.log('📡 Fetching user data...');
            const userData = await apiClient.getCurrentUser();
            console.log('✅ User data loaded:', userData);
            setUser(userData);
        } catch (error) {
            console.error('❌ Failed to load user:', error);
            // Only redirect on auth errors, not network errors
            if (error instanceof Error && error.message.includes('Not authenticated')) {
                router.push('/login');
            } else {
                // Set a default user for now to show the UI
                setUser({
                    name: 'User',
                    email: 'user@docshield.com',
                    role: 'user'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        apiClient.removeToken();
        router.push('/');
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="flex min-h-screen bg-slate-950">
            
            <main className="flex-1">
                <section className="relative py-16 px-4 overflow-hidden">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />

                    <div className="max-w-4xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                    <User className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white">Account Settings</h1>
                                    <p className="text-slate-400 mt-1">Manage your profile and preferences</p>
                                </div>
                            </div>

                            {/* Profile Info */}
                            <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 mb-6">
                                <h2 className="text-xl font-bold text-white mb-6">Profile Information</h2>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm text-slate-400 mb-2 block">Name</label>
                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                            <User className="w-5 h-5 text-slate-400" />
                                            <span className="text-white">{user?.name || 'User'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-400 mb-2 block">Email</label>
                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                            <Mail className="w-5 h-5 text-slate-400" />
                                            <span className="text-white">{user?.email || 'user@example.com'}</span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm text-slate-400 mb-2 block">Role</label>
                                        <div className="flex items-center gap-3 p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                            <Shield className="w-5 h-5 text-emerald-400" />
                                            <span className="text-white capitalize">{user?.role || 'user'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Security */}
                            <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 mb-6">
                                <h2 className="text-xl font-bold text-white mb-6">Security</h2>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <Key className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="text-white font-medium">Change Password</p>
                                                <p className="text-sm text-slate-400">Update your password</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium transition-all">
                                            Update
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <div className="flex items-center gap-3">
                                            <Bell className="w-5 h-5 text-emerald-400" />
                                            <div>
                                                <p className="text-white font-medium">Notifications</p>
                                                <p className="text-sm text-slate-400">Email alerts & updates</p>
                                            </div>
                                        </div>
                                        <button className="px-4 py-2 rounded-lg bg-slate-700/50 hover:bg-slate-700 border border-slate-600 text-slate-300 text-sm font-medium transition-all">
                                            Configure
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 mb-6">
                                <h2 className="text-xl font-bold text-white mb-6">Account Statistics</h2>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <p className="text-sm text-slate-400 mb-1">Documents Uploaded</p>
                                        <p className="text-2xl font-bold text-white">0</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <p className="text-sm text-slate-400 mb-1">Verifications</p>
                                        <p className="text-2xl font-bold text-white">0</p>
                                    </div>
                                </div>
                            </div>

                            {/* Logout */}
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={handleLogout}
                                className="w-full px-6 py-4 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-semibold flex items-center justify-center gap-2 transition-all"
                            >
                                <LogOut className="w-5 h-5" />
                                Logout
                            </motion.button>
                        </motion.div>
                    </div>
                </section>
            </main>
        </div>
    );
}
