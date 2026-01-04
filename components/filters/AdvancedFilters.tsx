'use client';

import { useState } from 'react';
import { Calendar, X, ChevronDown } from 'lucide-react';

interface AdvancedFiltersProps {
    filters: {
        file_type?: string;
        category?: string;
        min_size?: number;
        max_size?: number;
        start_date?: string;
        end_date?: string;
    };
    onFilterChange: (filters: any) => void;
    onClear: () => void;
}

export default function AdvancedFilters({ filters, onFilterChange, onClear }: AdvancedFiltersProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    const handleChange = (key: string, value: any) => {
        onFilterChange({ ...filters, [key]: value });
    };

    const hasActiveFilters = Object.values(filters).some(v => v !== undefined && v !== '' && v !== 'all');

    return (
        <div className="bg-slate-900/50 rounded-xl border border-slate-800">
            {/* Header */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full px-5 py-4 flex items-center justify-between text-white hover:bg-slate-800/50 transition-colors rounded-t-xl"
            >
                <div className="flex items-center gap-3">
                    <span className="font-medium">Advanced Filters</span>
                    {hasActiveFilters && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full border border-emerald-500/30">
                            Active
                        </span>
                    )}
                </div>
                <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </button>

            {/* Filter Panel */}
            {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-slate-800 pt-4">
                    {/* File Type */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">File Type</label>
                        <select
                            value={filters.file_type || 'all'}
                            onChange={(e) => handleChange('file_type', e.target.value === 'all' ? undefined : e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Types</option>
                            <option value="pdf">PDF Documents</option>
                            <option value="image">Images</option>
                        </select>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-medium text-white mb-2">Category</label>
                        <select
                            value={filters.category || 'all'}
                            onChange={(e) => handleChange('category', e.target.value === 'all' ? undefined : e.target.value)}
                            className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        >
                            <option value="all">All Categories</option>
                            <option value="passport">Passport</option>
                            <option value="license">Driver's License</option>
                            <option value="id_card">ID Card</option>
                            <option value="certificate">Certificate</option>
                            <option value="contract">Contract</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Start Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={filters.start_date || ''}
                                    onChange={(e) => handleChange('start_date', e.target.value || undefined)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">End Date</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="date"
                                    value={filters.end_date || ''}
                                    onChange={(e) => handleChange('end_date', e.target.value || undefined)}
                                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* File Size Range */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Min Size (MB)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={filters.min_size ? (filters.min_size / 1024 / 1024).toFixed(1) : ''}
                                onChange={(e) => handleChange('min_size', e.target.value ? Math.floor(parseFloat(e.target.value) * 1024 * 1024) : undefined)}
                                placeholder="0"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-white mb-2">Max Size (MB)</label>
                            <input
                                type="number"
                                min="0"
                                step="0.1"
                                value={filters.max_size ? (filters.max_size / 1024 / 1024).toFixed(1) : ''}
                                onChange={(e) => handleChange('max_size', e.target.value ? Math.floor(parseFloat(e.target.value) * 1024 * 1024) : undefined)}
                                placeholder="∞"
                                className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onClear}
                            className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear All
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
