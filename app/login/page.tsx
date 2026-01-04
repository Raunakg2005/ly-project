'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Shield, Mail, Lock, User, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function AuthPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        // Check if session expired
        if (searchParams.get('expired') === 'true') {
            setError('Your session has expired. Please login again.');
        }
    }, [searchParams]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                const response = await apiClient.login(formData.email, formData.password);

                // Decode token to get user role
                const payload = JSON.parse(atob(response.access_token.split('.')[1]));
                const userRole = payload.role || 'user';

                // Store role in localStorage
                localStorage.setItem('userRole', userRole);

                // Redirect based on role using window.location for reliable navigation
                if (userRole === 'verifier' || userRole === 'admin') {
                    window.location.href = '/verifier/dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
            } else {
                await apiClient.register({ name: formData.name, email: formData.email, password: formData.password });
                const response = await apiClient.login(formData.email, formData.password);

                // Decode token to get user role
                const payload = JSON.parse(atob(response.access_token.split('.')[1]));
                const userRole = payload.role || 'user';

                // Store role in localStorage
                localStorage.setItem('userRole', userRole);

                // Redirect based on role
                if (userRole === 'verifier' || userRole === 'admin') {
                    window.location.href = '/verifier/dashboard';
                } else {
                    window.location.href = '/dashboard';
                }
            }
        } catch (err: any) {
            setError(err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }} />

            {/* Gradient blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="w-full max-w-md relative z-10">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-3 mb-4">
                        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                            <Shield className="h-8 w-8 text-emerald-400" />
                        </div>
                        <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                            DocShield
                        </span>
                    </div>
                    <p className="text-slate-400">Quantum-safe document verification</p>
                </div>

                {/* Auth Card */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl p-8">
                    {/* Toggle */}
                    <div className="flex gap-2 mb-6 bg-slate-800/50 p-1 rounded-lg">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2 rounded-lg transition-all ${isLogin
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg font-medium'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Login
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2 rounded-lg transition-all ${!isLogin
                                ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg font-medium'
                                : 'text-slate-400 hover:text-white'
                                }`}
                        >
                            Register
                        </button>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {!isLogin && (
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Full Name
                                </label>
                                <div className="relative">
                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) =>
                                            setFormData({ ...formData, name: e.target.value })
                                        }
                                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500"
                                        placeholder="John Doe"
                                    />
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={(e) =>
                                        setFormData({ ...formData, email: e.target.value })
                                    }
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500" />
                                <input
                                    type="password"
                                    required
                                    value={formData.password}
                                    onChange={(e) =>
                                        setFormData({ ...formData, password: e.target.value })
                                    }
                                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-white placeholder-slate-500"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    {isLogin ? 'Logging in...' : 'Creating account...'}
                                </>
                            ) : (
                                <>{isLogin ? 'Login' : 'Create Account'}</>
                            )}
                        </button>
                    </form>

                    {/* Test Credentials */}
                    <div className="mt-6 space-y-3">
                        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                            <p className="text-xs text-emerald-400 font-medium mb-2">
                                🧪 Test User Account:
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                                Email: test@docshield.com
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                                Password: test123
                            </p>
                        </div>
                        <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                            <p className="text-xs text-blue-400 font-medium mb-2">
                                👨‍💼 Test Verifier Account:
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                                Email: verifier@docshield.com
                            </p>
                            <p className="text-xs text-slate-400 font-mono">
                                Password: Verifier@123
                            </p>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-500 mt-6">
                    Powered by Groq AI + Quantum Cryptography
                </p>
            </div>
        </div>
    );
}
