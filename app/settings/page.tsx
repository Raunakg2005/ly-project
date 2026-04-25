'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Bell, Mail, Shield, CheckCircle, XCircle, AlertTriangle, Award, BarChart3,
    Loader2, RotateCcw, Key, QrCode, Copy, Eye, EyeOff, Trash2, Plus,
    Lock, UnlockKeyhole, RefreshCw, Clock, CheckCheck, ShieldCheck, ShieldOff
} from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Sidebar from '@/components/layout/Sidebar';
import BanOverlay from '@/components/auth/BanOverlay';

// ─── Types ────────────────────────────────────────────────────────────────────

interface NotificationPreferences {
    user_id: string;
    email_notifications: {
        document_verified: boolean;
        document_rejected: boolean;
        document_flagged: boolean;
        analysis_complete: boolean;
        certificate_ready: boolean;
        weekly_summary: boolean;
        security_alerts: boolean;
    };
}

interface ApiKey {
    id: string;
    name: string;
    key_prefix: string;
    created_at: string;
    last_used: string | null;
    expires_at: string | null;
    is_active: boolean;
    is_expired: boolean;
}

type Tab = 'notifications' | 'security' | 'api-keys';

// ─── Reusable Toggle ──────────────────────────────────────────────────────────

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${on ? 'bg-emerald-500' : 'bg-slate-600'}`}
        >
            <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${on ? 'translate-x-8' : 'translate-x-1'}`} />
        </button>
    );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState<Tab>('notifications');

    const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
        { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
        { id: 'security', label: 'Security & 2FA', icon: <Shield className="w-4 h-4" /> },
        { id: 'api-keys', label: 'API Keys', icon: <Key className="w-4 h-4" /> },
    ];

    return (
        <>
            <Sidebar />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 lg:ml-72">
                <div className="max-w-4xl mx-auto">
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
                        <p className="text-slate-400">Manage your account, security, and API access</p>
                    </motion.div>

                    {/* Tab Bar */}
                    <div className="flex gap-2 mb-8 bg-slate-800/50 backdrop-blur rounded-xl p-1.5 border border-slate-700">
                        {tabs.map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 flex-1 justify-center py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                    }`}
                            >
                                {tab.icon}
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    <AnimatePresence mode="wait">
                        {activeTab === 'notifications' && <NotificationsTab key="n" />}
                        {activeTab === 'security' && <SecurityTab key="s" />}
                        {activeTab === 'api-keys' && <APIKeysTab key="k" />}
                    </AnimatePresence>
                </div>
            </div>
            <BanOverlay />
        </>
    );
}

// ─── Notifications Tab ────────────────────────────────────────────────────────

function NotificationsTab() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => { loadPreferences(); }, []);

    const loadPreferences = async () => {
        setLoading(true);
        try {
            const prefs = await apiClient.getNotificationPreferences();
            setPreferences(prefs);
        } catch (error: any) {
            const msg = error.message || '';
            if (msg.includes('BANNED') || msg.includes('suspended')) {
                window.location.href = '/banned';
            } else if (msg.includes('Not authenticated') || msg.includes('401')) {
                window.location.href = '/login?expired=true';
            }
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: keyof NotificationPreferences['email_notifications']) => {
        if (!preferences) return;
        setPreferences({ ...preferences, email_notifications: { ...preferences.email_notifications, [key]: !preferences.email_notifications[key] } });
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!preferences) return;
        setSaving(true);
        try {
            await apiClient.updateNotificationPreferences({ email_notifications: preferences.email_notifications });
            setHasChanges(false);
        } catch { alert('Failed to save preferences'); } finally { setSaving(false); }
    };

    const handleReset = async () => {
        if (!confirm('Reset all notification preferences to defaults?')) return;
        setSaving(true);
        try {
            const prefs = await apiClient.resetNotificationPreferences();
            setPreferences(prefs); setHasChanges(false);
        } catch { alert('Failed to reset preferences'); } finally { setSaving(false); }
    };

    const notifTypes = [
        { key: 'document_verified' as const, icon: CheckCircle, title: 'Document Verified', description: 'Get notified when your documents pass verification', color: 'text-emerald-400' },
        { key: 'document_rejected' as const, icon: XCircle, title: 'Document Rejected', description: 'Alert when documents fail verification', color: 'text-red-400' },
        { key: 'document_flagged' as const, icon: AlertTriangle, title: 'Document Flagged', description: 'Notify when documents need attention', color: 'text-yellow-400' },
        { key: 'analysis_complete' as const, icon: BarChart3, title: 'Analysis Complete', description: 'Know when AI analysis finishes', color: 'text-blue-400' },
        { key: 'certificate_ready' as const, icon: Award, title: 'Certificate Ready', description: 'Alert when certificates are generated', color: 'text-purple-400' },
        { key: 'weekly_summary' as const, icon: Mail, title: 'Weekly Summary', description: 'Receive weekly activity summaries', color: 'text-cyan-400' },
        { key: 'security_alerts' as const, icon: Shield, title: 'Security Alerts', description: 'Important security notifications (recommended)', color: 'text-orange-400' },
    ];

    if (loading) return (
        <div className="flex items-center justify-center h-48">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-4">
            {notifTypes.map((type, i) => (
                <motion.div key={type.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                    className="bg-slate-800/50 backdrop-blur-md rounded-xl p-5 border border-slate-700 hover:border-emerald-500/50 transition-all">
                    <div className="flex items-center justify-between">
                        <div className="flex items-start gap-4 flex-1">
                            <type.icon className={`w-6 h-6 ${type.color} mt-0.5`} />
                            <div>
                                <h3 className="text-lg font-semibold text-white mb-0.5">{type.title}</h3>
                                <p className="text-sm text-slate-400">{type.description}</p>
                            </div>
                        </div>
                        <Toggle on={!!preferences?.email_notifications[type.key]} onToggle={() => handleToggle(type.key)} />
                    </div>
                </motion.div>
            ))}

            <div className="mt-6 flex items-center justify-between gap-4">
                <button onClick={handleReset} disabled={saving}
                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50">
                    <RotateCcw className="w-4 h-4" /> Reset to Defaults
                </button>
                <button onClick={handleSave} disabled={!hasChanges || saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2">
                    {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><CheckCircle className="w-4 h-4" /> Save Preferences</>}
                </button>
            </div>
            {hasChanges && <p className="mt-2 text-center text-sm text-yellow-400">You have unsaved changes</p>}
        </motion.div>
    );
}

// ─── Security / 2FA Tab ───────────────────────────────────────────────────────

function SecurityTab() {
    const [status, setStatus] = useState<{ two_fa_enabled: boolean; backup_codes_remaining: number; enabled_at: string | null } | null>(null);
    const [loading, setLoading] = useState(true);

    // Setup flow state
    const [qrCode, setQrCode] = useState('');
    const [secret, setSecret] = useState('');
    const [setupStep, setSetupStep] = useState<'idle' | 'scanning' | 'confirming'>('idle');
    const [confirmCode, setConfirmCode] = useState('');
    const [backupCodes, setBackupCodes] = useState<string[]>([]);
    const [showBackupCodes, setShowBackupCodes] = useState(false);

    // Disable flow
    const [showDisableModal, setShowDisableModal] = useState(false);
    const [disableCode, setDisableCode] = useState('');

    // Regen backup codes
    const [showRegenModal, setShowRegenModal] = useState(false);
    const [regenCode, setRegenCode] = useState('');

    const [working, setWorking] = useState(false);
    const [error, setError] = useState('');
    const [showSecret, setShowSecret] = useState(false);

    useEffect(() => { load2FAStatus(); }, []);

    const load2FAStatus = async () => {
        try {
            const s = await apiClient.get2FAStatus();
            setStatus(s);
        } catch (err: any) {
            const msg = err.message || '';
            if (msg.includes('Not authenticated') || msg.includes('401')) {
                window.location.href = '/login?expired=true';
            }
            // else: silently leave status as null
        } finally {
            setLoading(false);
        }
    };

    const handleSetup = async () => {
        setWorking(true); setError('');
        try {
            const data = await apiClient.setup2FA();
            setQrCode(data.qr_code);
            setSecret(data.secret);
            setSetupStep('scanning');
        } catch (e: any) { setError(e.message); } finally { setWorking(false); }
    };

    const handleEnable = async () => {
        if (confirmCode.length !== 6) { setError('Enter the 6-digit code from your app'); return; }
        setWorking(true); setError('');
        try {
            const result = await apiClient.enable2FA(confirmCode);
            setBackupCodes(result.backup_codes);
            setShowBackupCodes(true);
            setSetupStep('idle');
            setConfirmCode('');
            await load2FAStatus();
        } catch (e: any) { setError(e.message); } finally { setWorking(false); }
    };

    const handleDisable = async () => {
        setWorking(true); setError('');
        try {
            await apiClient.disable2FA(disableCode);
            setShowDisableModal(false); setDisableCode('');
            await load2FAStatus();
        } catch (e: any) { setError(e.message); } finally { setWorking(false); }
    };

    const handleRegenBackup = async () => {
        setWorking(true); setError('');
        try {
            const result = await apiClient.regenerateBackupCodes(regenCode);
            setBackupCodes(result.backup_codes);
            setShowBackupCodes(true);
            setShowRegenModal(false); setRegenCode('');
        } catch (e: any) { setError(e.message); } finally { setWorking(false); }
    };

    const copyAll = (codes: string[]) => navigator.clipboard.writeText(codes.join('\n'));

    if (loading) return <div className="flex justify-center h-48 items-center"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
            {/* 2FA Status Card */}
            <div className="bg-slate-800/50 backdrop-blur rounded-xl border border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-4">
                    {status?.two_fa_enabled
                        ? <ShieldCheck className="w-7 h-7 text-emerald-400" />
                        : <ShieldOff className="w-7 h-7 text-slate-400" />}
                    <div>
                        <h2 className="text-xl font-semibold text-white">Two-Factor Authentication</h2>
                        <p className="text-sm text-slate-400">
                            {status?.two_fa_enabled
                                ? `Enabled${status.enabled_at ? ` on ${new Date(status.enabled_at).toLocaleDateString()}` : ''}  ·  ${status.backup_codes_remaining} backup codes remaining`
                                : 'Not enabled — your account is protected by password only'}
                        </p>
                    </div>
                    <div className="ml-auto">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${status?.two_fa_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                            {status?.two_fa_enabled ? 'Active' : 'Disabled'}
                        </span>
                    </div>
                </div>

                {error && <p className="mb-4 text-sm text-red-400 bg-red-500/10 rounded-lg px-4 py-2">{error}</p>}

                {/* Setup flow */}
                {!status?.two_fa_enabled && setupStep === 'idle' && (
                    <button onClick={handleSetup} disabled={working}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50">
                        {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
                        Set up Two-Factor Authentication
                    </button>
                )}

                {setupStep === 'scanning' && (
                    <div className="space-y-5">
                        <p className="text-slate-300 text-sm">Scan this QR code with <strong>Google Authenticator</strong>, <strong>Authy</strong>, or any TOTP app:</p>
                        <div className="flex flex-col sm:flex-row gap-6 items-start">
                            <div className="bg-white p-3 rounded-xl inline-block">
                                <img src={qrCode} alt="2FA QR Code" className="w-40 h-40" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-slate-400 mb-2">Or enter this key manually:</p>
                                <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-3 py-2">
                                    <code className="text-emerald-400 text-sm font-mono flex-1 break-all">
                                        {showSecret ? secret : '•'.repeat(secret.length)}
                                    </code>
                                    <button onClick={() => setShowSecret(v => !v)} className="text-slate-400 hover:text-white">
                                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button onClick={() => navigator.clipboard.writeText(secret)} className="text-slate-400 hover:text-white">
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                                <button onClick={() => { setSetupStep('confirming'); setError(''); }}
                                    className="mt-4 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors">
                                    I've scanned it →
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {setupStep === 'confirming' && (
                    <div className="space-y-4">
                        <p className="text-slate-300 text-sm">Enter the 6-digit code from your authenticator app to confirm:</p>
                        <div className="flex gap-3">
                            <input
                                value={confirmCode}
                                onChange={e => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                placeholder="000000"
                                className="w-36 text-center text-2xl tracking-[0.5em] font-mono bg-slate-900 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                            />
                            <button onClick={handleEnable} disabled={working || confirmCode.length !== 6}
                                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2">
                                {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCheck className="w-4 h-4" />}
                                Confirm & Enable
                            </button>
                        </div>
                        <button onClick={() => { setSetupStep('scanning'); setError(''); }} className="text-sm text-slate-400 hover:text-white">← Back</button>
                    </div>
                )}

                {/* Enabled actions */}
                {status?.two_fa_enabled && (
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => { setShowRegenModal(true); setError(''); }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg text-sm transition-colors">
                            <RefreshCw className="w-4 h-4" /> Regenerate Backup Codes
                        </button>
                        <button onClick={() => { setShowDisableModal(true); setError(''); }}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-sm transition-colors border border-red-500/20">
                            <ShieldOff className="w-4 h-4" /> Disable 2FA
                        </button>
                    </div>
                )}
            </div>

            {/* Backup Codes Display */}
            {showBackupCodes && backupCodes.length > 0 && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-6">
                    <div className="flex items-start gap-3 mb-4">
                        <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="text-amber-400 font-semibold">Save your backup codes</h3>
                            <p className="text-sm text-amber-300/70 mt-0.5">These are shown only once. Store them somewhere safe — you'll need them if you lose access to your authenticator app.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
                        {backupCodes.map((code, i) => (
                            <div key={i} className="bg-slate-900 rounded-lg px-3 py-2 text-center font-mono text-sm text-white tracking-wider">{code}</div>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-3">
                        <button onClick={() => copyAll(backupCodes)}
                            className="flex items-center gap-2 px-4 py-2 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 rounded-lg text-sm transition-colors">
                            <Copy className="w-4 h-4" /> Copy All
                        </button>
                        <button onClick={() => {
                            const content = [
                                'DocShield — Two-Factor Authentication Backup Codes',
                                `Generated: ${new Date().toLocaleString()}`,
                                '',
                                'Keep these codes in a safe place. Each code can only be used once.',
                                '',
                                ...backupCodes.map((c, i) => `${i + 1}. ${c}`)
                            ].join('\n');
                            const blob = new Blob([content], { type: 'text/plain' });
                            const url = URL.createObjectURL(blob);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `docshield-backup-codes-${Date.now()}.txt`;
                            a.click();
                            URL.revokeObjectURL(url);
                        }}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg text-sm transition-colors">
                            <CheckCheck className="w-4 h-4" /> Download .txt
                        </button>
                        <button onClick={() => setShowBackupCodes(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-lg text-sm transition-colors ml-auto">
                            I've saved them ✓
                        </button>
                    </div>
                </motion.div>
            )}


            {/* Disable Modal */}
            <AnimatePresence>
                {showDisableModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
                            <h3 className="text-xl font-semibold text-white mb-2">Disable 2FA</h3>
                            <p className="text-sm text-slate-400 mb-4">Enter your current TOTP code or a backup code to confirm:</p>
                            {error && <p className="mb-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
                            <input value={disableCode} onChange={e => setDisableCode(e.target.value)} placeholder="Code"
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-center font-mono tracking-widest focus:outline-none focus:border-red-500 mb-4" />
                            <div className="flex gap-3">
                                <button onClick={() => { setShowDisableModal(false); setDisableCode(''); setError(''); }}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">Cancel</button>
                                <button onClick={handleDisable} disabled={working || !disableCode}
                                    className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {working ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Disable
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Regen Backup Codes Modal */}
            <AnimatePresence>
                {showRegenModal && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
                            className="bg-slate-800 border border-slate-700 rounded-2xl p-6 w-full max-w-sm">
                            <h3 className="text-xl font-semibold text-white mb-2">Regenerate Backup Codes</h3>
                            <p className="text-sm text-slate-400 mb-4">Confirm with your TOTP code. Existing backup codes will be invalidated.</p>
                            {error && <p className="mb-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
                            <input value={regenCode} onChange={e => setRegenCode(e.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="000000"
                                className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-center font-mono text-xl tracking-[0.5em] focus:outline-none focus:border-emerald-500 mb-4" />
                            <div className="flex gap-3">
                                <button onClick={() => { setShowRegenModal(false); setRegenCode(''); setError(''); }}
                                    className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">Cancel</button>
                                <button onClick={handleRegenBackup} disabled={working || regenCode.length !== 6}
                                    className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                    {working ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />} Regenerate
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

// ─── API Keys Tab ─────────────────────────────────────────────────────────────

function APIKeysTab() {
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [newKeyExpiry, setNewKeyExpiry] = useState<string>('never');
    const [creating, setCreating] = useState(false);
    const [createdKeyValue, setCreatedKeyValue] = useState('');
    const [revoking, setRevoking] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [copied, setCopied] = useState(false);

    useEffect(() => { loadKeys(); }, []);

    const loadKeys = async () => {
        try {
            const data = await apiClient.getApiKeys();
            setKeys(data.keys);
        } catch { } finally { setLoading(false); }
    };

    const handleCreate = async () => {
        if (!newKeyName.trim()) { setError('Enter a name for this key'); return; }
        setCreating(true); setError('');
        try {
            const expiryDays = newKeyExpiry === 'never' ? undefined : parseInt(newKeyExpiry);
            const result = await apiClient.createApiKey(newKeyName.trim(), expiryDays);
            setCreatedKeyValue(result.key);
            setNewKeyName(''); setNewKeyExpiry('never'); setShowCreate(false);
            await loadKeys();
        } catch (e: any) { setError(e.message); } finally { setCreating(false); }
    };

    const handleRevoke = async (keyId: string) => {
        if (!confirm('Revoke this API key? This cannot be undone.')) return;
        setRevoking(keyId);
        try {
            await apiClient.revokeApiKey(keyId);
            await loadKeys();
        } catch { } finally { setRevoking(null); }
    };

    const copyKey = () => {
        navigator.clipboard.writeText(createdKeyValue);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const fmtDate = (d: string | null) => d ? new Date(d).toLocaleDateString() : '—';

    if (loading) return <div className="flex justify-center h-48 items-center"><Loader2 className="w-8 h-8 text-emerald-400 animate-spin" /></div>;

    return (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} className="space-y-6">
            {/* One-time key display */}
            <AnimatePresence>
                {createdKeyValue && (
                    <motion.div initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-5">
                        <div className="flex gap-3 mb-3">
                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                            <div>
                                <p className="text-emerald-400 font-semibold">API Key Created</p>
                                <p className="text-xs text-emerald-300/70 mt-0.5">This key is shown only once. Copy it now and store it securely.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 bg-slate-900 rounded-lg px-4 py-3 mb-3">
                            <code className="text-emerald-400 font-mono text-sm flex-1 break-all">{createdKeyValue}</code>
                            <button onClick={copyKey} className="shrink-0 text-slate-400 hover:text-white transition-colors">
                                {copied ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                            </button>
                        </div>
                        <button onClick={() => setCreatedKeyValue('')}
                            className="text-sm text-slate-400 hover:text-white transition-colors">I've copied it ✓</button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header + Create button */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-white">API Keys</h2>
                    <p className="text-sm text-slate-400 mt-0.5">Use API keys to authenticate programmatic access. Pass them as <code className="text-emerald-400 text-xs">X-API-Key</code> header.</p>
                </div>
                <button onClick={() => { setShowCreate(true); setError(''); }}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg text-sm transition-colors">
                    <Plus className="w-4 h-4" /> New Key
                </button>
            </div>

            {/* Create form */}
            <AnimatePresence>
                {showCreate && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className="bg-slate-800/50 border border-emerald-500/30 rounded-xl p-5 overflow-hidden">
                        <h3 className="text-white font-semibold mb-4">Create New API Key</h3>
                        {error && <p className="mb-3 text-sm text-red-400 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}
                        <div className="flex flex-col sm:flex-row gap-3">
                            <input value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Key name (e.g. CI/CD pipeline)"
                                className="flex-1 bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm" />
                            <select value={newKeyExpiry} onChange={e => setNewKeyExpiry(e.target.value)}
                                className="bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-emerald-500">
                                <option value="never">No expiry</option>
                                <option value="30">30 days</option>
                                <option value="90">90 days</option>
                                <option value="180">180 days</option>
                                <option value="365">1 year</option>
                            </select>
                        </div>
                        <div className="flex gap-3 mt-4">
                            <button onClick={() => { setShowCreate(false); setError(''); }}
                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm transition-colors">Cancel</button>
                            <button onClick={handleCreate} disabled={creating}
                                className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-sm transition-colors disabled:opacity-50 flex items-center gap-2">
                                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />} Create Key
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Keys list */}
            {keys.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <Key className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No API keys yet</p>
                    <p className="text-sm mt-1">Create a key to make programmatic API calls</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {keys.map((key, i) => (
                        <motion.div key={key.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                            className={`bg-slate-800/50 border rounded-xl p-4 transition-all ${key.is_active && !key.is_expired ? 'border-slate-700 hover:border-slate-500' : 'border-slate-700/40 opacity-50'}`}>
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className={`p-2 rounded-lg ${key.is_active && !key.is_expired ? 'bg-emerald-500/10' : 'bg-slate-700/50'}`}>
                                        {key.is_active && !key.is_expired ? <UnlockKeyhole className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="text-white font-medium truncate">{key.name}</span>
                                            <code className="text-xs text-slate-400 bg-slate-900 px-2 py-0.5 rounded font-mono">{key.key_prefix}…</code>
                                            {!key.is_active && <span className="text-xs bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full">Revoked</span>}
                                            {key.is_expired && key.is_active && <span className="text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">Expired</span>}
                                        </div>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 flex-wrap">
                                            <span>Created {fmtDate(key.created_at)}</span>
                                            {key.last_used && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Last used {fmtDate(key.last_used)}</span>}
                                            {key.expires_at && <span>Expires {fmtDate(key.expires_at)}</span>}
                                        </div>
                                    </div>
                                </div>
                                {key.is_active && !key.is_expired && (
                                    <button onClick={() => handleRevoke(key.id)} disabled={revoking === key.id}
                                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 rounded-lg text-xs transition-colors disabled:opacity-50">
                                        {revoking === key.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                                        Revoke
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </motion.div>
    );
}
