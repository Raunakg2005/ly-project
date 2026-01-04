'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Shield, CheckCircle, XCircle, AlertTriangle, Award, BarChart3, Loader2, RotateCcw } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Sidebar from '@/components/layout/Sidebar';

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
    created_at: string;
    updated_at: string;
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        loadPreferences();
    }, []);

    const loadPreferences = async () => {
        setLoading(true);
        try {
            const prefs = await apiClient.getNotificationPreferences();
            setPreferences(prefs);
        } catch (error) {
            console.error('Failed to load preferences:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = (key: keyof NotificationPreferences['email_notifications']) => {
        if (!preferences) return;

        setPreferences({
            ...preferences,
            email_notifications: {
                ...preferences.email_notifications,
                [key]: !preferences.email_notifications[key]
            }
        });
        setHasChanges(true);
    };

    const handleSave = async () => {
        if (!preferences) return;

        setSaving(true);
        try {
            await apiClient.updateNotificationPreferences({
                email_notifications: preferences.email_notifications
            });
            setHasChanges(false);
            // Show success message
        } catch (error) {
            console.error('Failed to save preferences:', error);
            alert('Failed to save preferences');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!confirm('Reset all notification preferences to defaults?')) return;

        setSaving(true);
        try {
            const prefs = await apiClient.resetNotificationPreferences();
            setPreferences(prefs);
            setHasChanges(false);
        } catch (error) {
            console.error('Failed to reset preferences:', error);
            alert('Failed to reset preferences');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <>
                <Sidebar />
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 lg:ml-72">
                    <div className="flex items-center justify-center h-[60vh]">
                        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
                    </div>
                </div>
            </>
        );
    }

    const notificationTypes = [
        {
            key: 'document_verified' as const,
            icon: CheckCircle,
            title: 'Document Verified',
            description: 'Get notified when your documents pass verification',
            color: 'text-emerald-400'
        },
        {
            key: 'document_rejected' as const,
            icon: XCircle,
            title: 'Document Rejected',
            description: 'Alert when documents fail verification',
            color: 'text-red-400'
        },
        {
            key: 'document_flagged' as const,
            icon: AlertTriangle,
            title: 'Document Flagged',
            description: 'Notify when documents need attention',
            color: 'text-yellow-400'
        },
        {
            key: 'analysis_complete' as const,
            icon: BarChart3,
            title: 'Analysis Complete',
            description: 'Know when AI analysis finishes',
            color: 'text-blue-400'
        },
        {
            key: 'certificate_ready' as const,
            icon: Award,
            title: 'Certificate Ready',
            description: 'Alert when certificates are generated',
            color: 'text-purple-400'
        },
        {
            key: 'weekly_summary' as const,
            icon: Mail,
            title: 'Weekly Summary',
            description: 'Receive weekly activity summaries',
            color: 'text-cyan-400'
        },
        {
            key: 'security_alerts' as const,
            icon: Shield,
            title: 'Security Alerts',
            description: 'Important security notifications (recommended)',
            color: 'text-orange-400'
        }
    ];

    return (
        <>
            <Sidebar />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 p-6 lg:ml-72">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8"
                    >
                        <div className="flex items-center gap-3 mb-2">
                            <Bell className="w-8 h-8 text-emerald-400" />
                            <h1 className="text-3xl font-bold text-white">Notification Settings</h1>
                        </div>
                        <p className="text-slate-400">Control when you receive email notifications</p>
                    </motion.div>

                    {/* Notification Preferences */}
                    <div className="space-y-3">
                        {notificationTypes.map((type, index) => (
                            <motion.div
                                key={type.key}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-slate-800/50 backdrop-blur-md rounded-xl p-5 border border-slate-700 hover:border-emerald-500/50 transition-all"
                            >
                                <div className="flex items-center justify-between">
                                    <div className="flex items-start gap-4 flex-1">
                                        <type.icon className={`w-6 h-6 ${type.color} mt-0.5`} />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-white mb-1">{type.title}</h3>
                                            <p className="text-sm text-slate-400">{type.description}</p>
                                        </div>
                                    </div>

                                    {/* Toggle Switch */}
                                    <button
                                        onClick={() => handleToggle(type.key)}
                                        className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${preferences?.email_notifications[type.key]
                                                ? 'bg-emerald-500'
                                                : 'bg-slate-600'
                                            }`}
                                    >
                                        <span
                                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${preferences?.email_notifications[type.key]
                                                    ? 'translate-x-8'
                                                    : 'translate-x-1'
                                                }`}
                                        />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Action Buttons */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 flex items-center justify-between gap-4"
                    >
                        <button
                            onClick={handleReset}
                            disabled={saving}
                            className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset to Defaults
                        </button>

                        <button
                            onClick={handleSave}
                            disabled={!hasChanges || saving}
                            className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-lg transition-all disabled:opacity-50 flex items-center gap-2"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-4 h-4" />
                                    Save Preferences
                                </>
                            )}
                        </button>
                    </motion.div>

                    {hasChanges && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="mt-4 text-center text-sm text-yellow-400"
                        >
                            You have unsaved changes
                        </motion.p>
                    )}
                </div>
            </div>
        </>
    );
}
