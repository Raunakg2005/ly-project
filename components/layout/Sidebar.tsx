'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    FileText,
    Upload,
    User,
    LogOut,
    Menu,
    X,
    Shield,
    Settings,
    UserCheck,
    BarChart3,
    Users
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';

const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Documents', href: '/documents', icon: FileText },
    { name: 'Upload', href: '/upload', icon: Upload },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
];

const verifierItems = [
    { name: 'Dashboard', href: '/verifier/dashboard', icon: LayoutDashboard },
    { name: 'Review Queue', href: '/verifier/queue', icon: UserCheck },
    { name: 'All Documents', href: '/verifier/documents', icon: FileText },
    { name: 'Analytics', href: '/verifier/analytics', icon: BarChart3 },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [userRole, setUserRole] = useState<string>('user');

    useEffect(() => {
        // Get user role from localStorage or API
        const role = localStorage.getItem('userRole') || 'user';
        setUserRole(role);
    }, []);

    // Determine which nav items to show based on role and current path
    const isVerifierPath = pathname?.startsWith('/verifier');
    const isAdminPath = pathname?.startsWith('/admin');

    // Show verifier items only when on verifier path OR when verifier/admin and not on admin page
    const shouldShowVerifierItems = isVerifierPath && (userRole === 'verifier' || userRole === 'admin');
    const currentNavItems = shouldShowVerifierItems ? verifierItems : navItems;

    const handleLogout = () => {
        apiClient.removeToken();
        router.push('/');
    };

    return (
        <>
            {/* Mobile Hamburger Button */}
            <button
                onClick={() => setIsMobileOpen(true)}
                className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-slate-900/80 backdrop-blur-xl border border-slate-800 text-white hover:bg-slate-800 transition-all"
            >
                <Menu className="w-6 h-6" />
            </button>

            {/* Mobile Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsMobileOpen(false)}
                        className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside
                className={`
                    fixed top-0 left-0 h-screen w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800/50 z-50
                    transition-transform duration-300 ease-out flex flex-col
                    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
                    lg:translate-x-0
                    shadow-2xl
                `}
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-800/50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 group-hover:border-emerald-400/50 transition-all">
                                <Shield className="w-6 h-6 text-emerald-400" />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                                DocShield
                            </span>
                        </Link>
                        {/* Close button (mobile only) */}
                        <button
                            onClick={() => setIsMobileOpen(false)}
                            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="p-4 flex-1 overflow-y-auto">
                    {/* Role Switcher for Verifier/Admin */}
                    {(userRole === 'verifier' || userRole === 'admin') && !isAdminPath && (
                        <div className="mb-4 p-3 bg-slate-800/50 rounded-lg">
                            <p className="text-xs text-slate-400 mb-2">Switch View:</p>
                            <div className={`grid ${userRole === 'admin' ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
                                <button
                                    onClick={() => router.push('/dashboard')}
                                    className={`px-3 py-2 rounded-lg text-sm transition-all ${!isVerifierPath && !isAdminPath
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    User
                                </button>
                                <button
                                    onClick={() => router.push('/verifier/dashboard')}
                                    className={`px-3 py-2 rounded-lg text-sm transition-all ${isVerifierPath
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    Verifier
                                </button>
                                {userRole === 'admin' && (
                                    <button
                                        onClick={() => router.push('/admin')}
                                        className="px-3 py-2 rounded-lg text-sm transition-all bg-slate-700 text-slate-300 hover:bg-slate-600"
                                    >
                                        Admin
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    <ul className="space-y-1">
                        {/* Admin Navigation - Only show when on admin pages */}
                        {userRole === 'admin' && isAdminPath && (
                            <>
                                <li>
                                    <Link
                                        href="/admin"
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`
                                            group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all overflow-hidden
                                            ${pathname === '/admin'
                                                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-white shadow-lg shadow-emerald-500/10'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700'
                                            }
                                        `}
                                    >
                                        {pathname === '/admin' && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10"
                                            />
                                        )}
                                        <Shield className={`relative w-5 h-5 ${pathname === '/admin' ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`} />
                                        <span className={`relative font-medium ${pathname === '/admin' ? 'text-white' : ''}`}>Admin Overview</span>
                                    </Link>
                                </li>
                                <li className="pl-4">
                                    <Link
                                        href="/admin/users"
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm
                                            ${pathname === '/admin/users'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                            }
                                        `}
                                    >
                                        <Users className="w-4 h-4" />
                                        <span>Users</span>
                                    </Link>
                                </li>
                                <li className="pl-4">
                                    <Link
                                        href="/admin/analytics"
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm
                                            ${pathname === '/admin/analytics'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                            }
                                        `}
                                    >
                                        <BarChart3 className="w-4 h-4" />
                                        <span>Analytics</span>
                                    </Link>
                                </li>
                                <li className="pl-4">
                                    <Link
                                        href="/admin/settings"
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`
                                            flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm
                                            ${pathname === '/admin/settings'
                                                ? 'bg-emerald-500/10 text-emerald-400'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white'
                                            }
                                        `}
                                    >
                                        <Settings className="w-4 h-4" />
                                        <span>Settings</span>
                                    </Link>
                                </li>

                                {/* Back to User/Verifier button */}
                                <li className="pt-4">
                                    <div className="grid grid-cols-2 gap-2 px-2">
                                        <button
                                            onClick={() => router.push('/dashboard')}
                                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all"
                                        >
                                            User View
                                        </button>
                                        <button
                                            onClick={() => router.push('/verifier/dashboard')}
                                            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-all"
                                        >
                                            Verifier View
                                        </button>
                                    </div>
                                </li>
                            </>
                        )}

                        {/* Regular navigation - hide when on admin pages */}
                        {!isAdminPath && currentNavItems.map((item) => {
                            const isActive = pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <li key={item.href}>
                                    <Link
                                        href={item.href}
                                        onClick={() => setIsMobileOpen(false)}
                                        className={`
                                            group relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all overflow-hidden
                                            ${isActive
                                                ? 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 text-white shadow-lg shadow-emerald-500/10'
                                                : 'text-slate-400 hover:bg-slate-800/50 hover:text-white border border-transparent hover:border-slate-700'
                                            }
                                        `}
                                    >
                                        {isActive && (
                                            <motion.div
                                                layoutId="activeIndicator"
                                                className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10"
                                            />
                                        )}
                                        <Icon className={`relative w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-emerald-400'} transition-colors`} />
                                        <span className={`relative font-medium ${isActive ? 'text-white' : ''}`}>{item.name}</span>
                                        {isActive && (
                                            <motion.div
                                                initial={{ scale: 0 }}
                                                animate={{ scale: 1 }}
                                                className="relative ml-auto w-2 h-2 rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 shadow-lg shadow-emerald-500/50"
                                            />
                                        )}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Logout Button */}
                <div className="p-4 border-t border-slate-800/50 flex-shrink-0">
                    <button
                        onClick={handleLogout}
                        className="group w-full flex items-center gap-3 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-500/10 hover:text-red-400 border border-transparent hover:border-red-500/30 transition-all"
                    >
                        <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium">Logout</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
