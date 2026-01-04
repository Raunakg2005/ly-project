'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Users as UsersIcon, Search, Trash2, Ban, CheckCircle, Key, UserPlus } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import LoadingScreen from '@/components/animations/LoadingScreen';
import Sidebar from '@/components/layout/Sidebar';
import { ToastContainer } from '@/components/ui/Toast';
import { useToast } from '@/hooks/useToast';

export default function AdminUsersPage() {
    const router = useRouter();
    const toast = useToast();
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState<any[]>([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [actionModal, setActionModal] = useState<{ open: boolean; action: string; user: any }>({ open: false, action: '', user: null });
    const [createModal, setCreateModal] = useState(false);
    const [resetPasswordModal, setResetPasswordModal] = useState<{ open: boolean; user: any }>({ open: false, user: null });
    const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'user' });
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        checkAdminAccess();
        loadUsers();
    }, [searchTerm, roleFilter, statusFilter, currentPage]);

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

    const loadUsers = async () => {
        try {
            const data = await apiClient.getAdminUsers({
                search: searchTerm || undefined,
                role: roleFilter !== 'all' ? roleFilter : undefined,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                page: currentPage,
                limit: 10
            });
            setUsers(data.users || []);
            setTotalUsers(data.total || 0);
        } catch (error: any) {
            console.error('Failed to load users:', error);
            if (error?.message && (error.message.includes('BANNED') || error.message.includes('suspended'))) {
                window.location.href = '/banned';
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await apiClient.updateUserRole(userId, newRole);
            loadUsers();
            toast.success('User role updated successfully');
        } catch (error) {
            toast.error('Failed to update role');
        }
    };

    const handleBanToggle = async (userId: string, currentStatus: boolean) => {
        try {
            const newStatus = currentStatus ? 'active' : 'banned';
            await apiClient.updateUserStatus(userId, newStatus);
            loadUsers();
            setActionModal({ open: false, action: '', user: null });
            toast.success(`User ${currentStatus ? 'unbanned' : 'banned'} successfully`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleDeleteUser = async (userId: string) => {
        try {
            await apiClient.deleteUserAdmin(userId);
            loadUsers();
            setActionModal({ open: false, action: '', user: null });
            toast.success('User deleted successfully');
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    const handleCreateUser = async () => {
        try {
            await apiClient.createUser(newUser);
            loadUsers();
            setCreateModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'user' });
            toast.success('User created successfully!');
        } catch (error) {
            toast.error('Failed to create user');
        }
    };

    const handleResetPassword = async () => {
        if (!resetPasswordModal.user || !newPassword) return;

        try {
            await apiClient.resetUserPassword(resetPasswordModal.user.id, newPassword);
            setResetPasswordModal({ open: false, user: null });
            setNewPassword('');
            toast.success('Password reset successfully!');
        } catch (error) {
            toast.error('Failed to reset password');
        }
    };

    if (loading) return <LoadingScreen />;

    return (
        <div className="flex min-h-screen bg-slate-950">
            <ToastContainer toasts={toast.toasts} onRemove={toast.removeToast} />
            <Sidebar />
            <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8">
                <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white flex items-center gap-2 sm:gap-3">
                            <UsersIcon className="w-6 h-6 sm:w-8 sm:h-8 text-emerald-400" />
                            User Management
                        </h1>
                        <p className="text-sm sm:text-base text-slate-400 mt-1 sm:mt-2">Manage user accounts, roles, and permissions</p>
                    </div>
                    <button
                        onClick={() => setCreateModal(true)}
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 bg-emerald-500 hover:bg-emerald-600 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                        <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                        Create User
                    </button>
                </div>

                <div className="bg-slate-900/50 rounded-xl border border-slate-800 p-3 sm:p-4 lg:p-6">
                    {/* Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={(e) => {
                                setRoleFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">Users</option>
                            <option value="verifier">Verifiers</option>
                            <option value="admin">Admins</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => {
                                setStatusFilter(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="banned">Banned</option>
                        </select>
                    </div>

                    {/* Users Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full hidden lg:table">
                            <thead>
                                <tr className="border-b border-slate-800">
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Name</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Email</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Role</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Status</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Documents</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Joined</th>
                                    <th className="text-left py-3 px-4 text-slate-400 font-medium text-sm">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map(user => (
                                    <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30">
                                        <td className="py-4 px-4 text-white">{user.name}</td>
                                        <td className="py-4 px-4 text-slate-300">{user.email}</td>
                                        <td className="py-4 px-4">
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm"
                                            >
                                                <option value="user">User</option>
                                                <option value="verifier">Verifier</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                        <td className="py-4 px-4">
                                            {user.banned ? (
                                                <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-sm">Banned</span>
                                            ) : (
                                                <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-sm">Active</span>
                                            )}
                                        </td>
                                        <td className="py-4 px-4 text-slate-300">{user.documentCount}</td>
                                        <td className="py-4 px-4 text-slate-400 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setResetPasswordModal({ open: true, user })}
                                                    className="p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30"
                                                    title="Reset Password"
                                                >
                                                    <Key className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ open: true, action: 'ban', user })}
                                                    className={`p-2 rounded ${user.banned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'} hover:opacity-80`}
                                                    title={user.banned ? 'Unban' : 'Ban'}
                                                >
                                                    {user.banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => setActionModal({ open: true, action: 'delete', user })}
                                                    className="p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30"
                                                    title="Delete User"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {/* Mobile Card View */}
                        <div className="lg:hidden space-y-3">
                            {users.map(user => (
                                <div key={user.id} className="bg-slate-800/50 rounded-lg border border-slate-700 p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-white font-medium truncate">{user.name}</h3>
                                            <p className="text-sm text-slate-400 truncate">{user.email}</p>
                                        </div>
                                        {user.banned ? (
                                            <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs whitespace-nowrap ml-2">Banned</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs whitespace-nowrap ml-2">Active</span>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                                        <div>
                                            <span className="text-slate-500 block">Role</span>
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.id, e.target.value)}
                                                className="mt-1 w-full px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-xs"
                                            >
                                                <option value="user">User</option>
                                                <option value="verifier">Verifier</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </div>
                                        <div>
                                            <span className="text-slate-500 block">Documents</span>
                                            <span className="text-white block mt-1">{user.documentCount}</span>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-3">
                                        Joined: {new Date(user.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setResetPasswordModal({ open: true, user })}
                                            className="flex-1 p-2 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Key className="w-4 h-4" />
                                            <span className="hidden sm:inline">Reset</span>
                                        </button>
                                        <button
                                            onClick={() => setActionModal({ open: true, action: 'ban', user })}
                                            className={`flex-1 p-2 rounded ${user.banned ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'} hover:opacity-80 flex items-center justify-center gap-2 text-sm`}
                                        >
                                            {user.banned ? <CheckCircle className="w-4 h-4" /> : <Ban className="w-4 h-4" />}
                                            <span className="hidden sm:inline">{user.banned ? 'Unban' : 'Ban'}</span>
                                        </button>
                                        <button
                                            onClick={() => setActionModal({ open: true, action: 'delete', user })}
                                            className="flex-1 p-2 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 flex items-center justify-center gap-2 text-sm"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pagination */}
                    {totalUsers > 10 && (
                        <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
                            <div className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                                Showing {((currentPage - 1) * 10) + 1} to {Math.min(currentPage * 10, totalUsers)} of {totalUsers} users
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-sm sm:text-base"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(p => p + 1)}
                                    disabled={currentPage * 10 >= totalUsers}
                                    className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg text-sm sm:text-base"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Action Confirmation Modal */}
                {actionModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-white mb-4">
                                {actionModal.action === 'ban' ? (actionModal.user.banned ? 'Unban User?' : 'Ban User?') : 'Delete User?'}
                            </h3>
                            <p className="text-slate-400 mb-6">
                                {actionModal.action === 'ban'
                                    ? `Are you sure you want to ${actionModal.user.banned ? 'unban' : 'ban'} ${actionModal.user.name}?`
                                    : `This will permanently delete ${actionModal.user.name} and all their documents. This action cannot be undone.`
                                }
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setActionModal({ open: false, action: '', user: null })}
                                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (actionModal.action === 'ban') {
                                            handleBanToggle(actionModal.user.id, actionModal.user.banned);
                                        } else {
                                            handleDeleteUser(actionModal.user.id);
                                        }
                                    }}
                                    className={`flex-1 px-4 py-2 rounded-lg font-medium ${actionModal.action === 'delete'
                                        ? 'bg-red-500 hover:bg-red-600 text-white'
                                        : 'bg-emerald-500 hover:bg-emerald-600 text-black'
                                        }`}
                                >
                                    {actionModal.action === 'ban' ? (actionModal.user.banned ? 'Unban' : 'Ban') : 'Delete'}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Create User Modal */}
                {createModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <UserPlus className="w-6 h-6 text-emerald-400" />
                                Create New User
                            </h3>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Name</label>
                                    <input
                                        type="text"
                                        value={newUser.name}
                                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                                    <input
                                        type="email"
                                        value={newUser.email}
                                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="john@example.com"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
                                    <input
                                        type="password"
                                        value={newUser.password}
                                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        placeholder="••••••••"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-2">Role</label>
                                    <select
                                        value={newUser.role}
                                        onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    >
                                        <option value="user">User</option>
                                        <option value="verifier">Verifier</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setCreateModal(false);
                                        setNewUser({ name: '', email: '', password: '', role: 'user' });
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleCreateUser}
                                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg"
                                >
                                    Create User
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Reset Password Modal */}
                {resetPasswordModal.open && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6">
                            <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <Key className="w-6 h-6 text-blue-400" />
                                Reset Password
                            </h3>
                            <p className="text-slate-400 mb-4">
                                Reset password for <span className="text-white font-semibold">{resetPasswordModal.user?.name}</span>
                            </p>
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-300 mb-2">New Password</label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => {
                                        setResetPasswordModal({ open: false, user: null });
                                        setNewPassword('');
                                    }}
                                    className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleResetPassword}
                                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg"
                                >
                                    Reset Password
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
