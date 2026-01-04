'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Shield, LogOut, Key, Bell, Database, Edit } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';
import EditProfileModal from '@/components/profile/EditProfileModal';
import ChangePasswordModal from '@/components/profile/ChangePasswordModal';
import Sidebar from '@/components/layout/Sidebar';
import BanOverlay from '@/components/auth/BanOverlay';

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [mounted, setMounted] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [passwordModalOpen, setPasswordModalOpen] = useState(false);
    const [stats, setStats] = useState({ totalDocuments: 0, verified: 0 });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return; // Wait for client-side mount
        loadUser();
        loadStats();
    }, [mounted, router]);

    const loadUser = async () => {
        try {
            // Check if token exists first
            const token = apiClient.getToken();
            if (!token) {
                console.log('❌ No token found, redirecting to login');
                router.push('/login?expired=true');
                return;
            }

            console.log('📡 Fetching user data...');
            const userData = await apiClient.getCurrentUser();
            console.log('✅ User data loaded:', userData);
            setUser(userData);
        } catch (error: any) {
            console.error('❌ Failed to load user:', error);

            // Check if it's an auth error by looking at the error message
            const errorMessage = error?.message || error?.toString() || '';
            const isAuthError = errorMessage.includes('Not authenticated') ||
                errorMessage.includes('401') ||
                errorMessage.includes('Unauthorized') ||
                errorMessage.includes('Session expired');
            
            const isBanned = errorMessage.includes('BANNED') || errorMessage.includes('suspended');

            if (isBanned) {
                console.log('🚫 User is banned, redirecting to banned page...');
                router.push('/banned');
                return;
            }

            if (isAuthError) {
                console.log('🔄 Redirecting to login due to auth error...');
                router.push('/login?expired=true');
                return; // Stop here, don't set fallback user
            }

            // Only set fallback user for non-auth errors
            setUser({
                name: 'User',
                email: 'user@docshield.com',
                role: 'user'
            });
        } finally {
            setLoading(false);
        }
    };

    const loadStats = async () => {
        try {
            const documents = await apiClient.getDocuments();
            const verified = documents.filter((d: any) => d.verificationStatus === 'verified').length;
            setStats({
                totalDocuments: documents.length,
                verified: verified
            });
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    const handleLogout = () => {
        apiClient.removeToken();
        router.push('/');
    };

    const handleSaveProfile = async (name: string) => {
        try {
            const updated = await apiClient.updateProfile(name);
            setUser(updated);
            setEditModalOpen(false);
        } catch (error) {
            throw error; // Let modal handle the error
        }
    };

    const handleChangePassword = async (currentPassword: string, newPassword: string) => {
        try {
            await apiClient.changePassword(currentPassword, newPassword);
            setPasswordModalOpen(false);
            // Logout after password change
            apiClient.removeToken();
            router.push('/login');
        } catch (error) {
            throw error; // Let modal handle the error
        }
    };

    if (loading) {
        return <LoadingScreen />;
    }

    return (
        <div className="min-h-screen bg-slate-950">
            <Sidebar />
            <main className="lg:pl-72">
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

                                    <div className="flex gap-2 mt-6">
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setEditModalOpen(true)}
                                            className="flex-1 px-4 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit Profile
                                        </motion.button>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => setPasswordModalOpen(true)}
                                            className="flex-1 px-4 py-2 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-white text-sm font-medium flex items-center justify-center gap-2 transition-all"
                                        >
                                            <Key className="w-4 h-4" />
                                            Change Password
                                        </motion.button>
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
                                        <p className="text-2xl font-bold text-white">{stats.totalDocuments}</p>
                                    </div>
                                    <div className="p-4 rounded-lg bg-slate-800/50 border border-slate-700">
                                        <p className="text-sm text-slate-400 mb-1">Verified Documents</p>
                                        <p className="text-2xl font-bold text-white">{stats.verified}</p>
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

            {/* Modals */}
            <EditProfileModal
                isOpen={editModalOpen}
                currentName={user?.name || ''}
                currentEmail={user?.email || ''}
                onSave={handleSaveProfile}
                onCancel={() => setEditModalOpen(false)}
            />

            <ChangePasswordModal
                isOpen={passwordModalOpen}
                onChangePassword={handleChangePassword}
                onCancel={() => setPasswordModalOpen(false)}
            />
            <BanOverlay />
        </div>
    );
}
