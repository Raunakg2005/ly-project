'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { FileText, Image, File } from 'lucide-react';

interface DocumentTypesChartProps {
    documents: any[];
}

export default function DocumentTypesChart({ documents }: DocumentTypesChartProps) {
    // Calculate real document type distribution
    const calculateTypeDistribution = () => {
        const total = documents.length || 1;

        // Count by MIME type (e.g., "application/pdf", "image/png")
        const pdfCount = documents.filter(d =>
            d.fileType?.includes('pdf')
        ).length;

        const imageCount = documents.filter(d =>
            d.fileType?.startsWith('image/')
        ).length;

        const otherCount = total - pdfCount - imageCount;

        return [
            { name: 'PDF Files', value: Math.round((pdfCount / total) * 100), color: '#10b981', icon: FileText },
            { name: 'Images', value: Math.round((imageCount / total) * 100), color: '#06b6d4', icon: Image },
            { name: 'Others', value: Math.round((otherCount / total) * 100), color: '#64748b', icon: File }
        ].filter(item => item.value > 0); // Only show types that exist
    };

    const data = calculateTypeDistribution();

    const RADIAN = Math.PI / 180;
    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                className="text-sm font-semibold"
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-6 rounded-xl bg-slate-900/50 border border-slate-800"
        >
            {/* Header */}
            <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-1">Document Types</h3>
                <p className="text-sm text-slate-400">Distribution by file type</p>
            </div>

            {/* Chart */}
            <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomLabel}
                        outerRadius={90}
                        fill="#8884d8"
                        dataKey="value"
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

            {/* Legend */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2">
                {data.map((item, index) => {
                    const Icon = item.icon;
                    return (
                        <div key={index} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <Icon className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-300">{item.name}</span>
                            </div>
                            <span className="text-sm font-semibold text-white">{item.value}%</span>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
}
