'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface VerificationChartProps {
    documents: any[];
}

export default function VerificationChart({ documents }: VerificationChartProps) {
    // Calculate real verification status
    const calculateVerificationStatus = () => {
        const total = documents.length || 1;
        const verified = documents.filter(d => d.verificationStatus === 'verified').length;
        const pending = documents.filter(d => d.verificationStatus === 'pending').length;
        const flagged = documents.filter(d => d.verificationStatus === 'flagged').length;

        return [
            { name: 'Verified', value: verified, color: '#10b981', icon: CheckCircle },
            { name: 'Pending', value: pending, color: '#eab308', icon: Clock },
            { name: 'Flagged', value: flagged, color: '#ef4444', icon: AlertTriangle }
        ].filter(item => item.value > 0);
    };

    const data = calculateVerificationStatus();
    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-6 rounded-xl bg-slate-900/50 border border-slate-800"
        >
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">Verification Status</h3>
                <p className="text-sm text-slate-400">Document verification breakdown</p>
            </div>

            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
                {/* Doughnut Chart */}
                <div className="relative flex-shrink-0">
                    <ResponsiveContainer width={200} height={200}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                paddingAngle={2}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#0f172a',
                                    border: '1px solid #334155',
                                    borderRadius: '0.5rem',
                                    color: '#fff'
                                }}
                                itemStyle={{ color: '#fff' }}
                                labelStyle={{ color: '#fff' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <p className="text-3xl font-bold text-white">{total}</p>
                        <p className="text-xs text-slate-400">Total Docs</p>
                    </div>
                </div>

                {/* Stats */}
                <div className="flex-1 w-full lg:w-auto space-y-3 sm:space-y-4">
                    {data.map((item, index) => {
                        const Icon = item.icon;
                        const percentage = ((item.value / total) * 100).toFixed(0);
                        return (
                            <div key={index} className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div
                                        className="p-2 rounded-lg"
                                        style={{
                                            backgroundColor: `${item.color}20`,
                                            borderColor: `${item.color}50`,
                                            borderWidth: '1px'
                                        }}
                                    >
                                        <Icon className="w-4 h-4" style={{ color: item.color }} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">{item.name}</p>
                                        <p className="text-xs text-slate-400">{item.value} documents</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-bold text-white">{percentage}%</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </motion.div>
    );
}
