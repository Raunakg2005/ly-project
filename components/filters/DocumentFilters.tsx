'use client';

import { Filter, X } from 'lucide-react';

export type DocumentStatus = 'all' | 'pending' | 'analyzed' | 'verified' | 'flagged';
export type DateRange = 'all' | 'last7' | 'last30' | 'last90';
export type SortOption = 'newest' | 'oldest' | 'name-asc' | 'name-desc';

interface FilterState {
    status: DocumentStatus;
    dateRange: DateRange;
    sortBy: SortOption;
}

interface DocumentFiltersProps {
    filters: FilterState;
    onChange: (filters: FilterState) => void;
    onClear: () => void;
}

export default function DocumentFilters({ filters, onChange, onClear }: DocumentFiltersProps) {
    const activeFiltersCount =
        (filters.status !== 'all' ? 1 : 0) +
        (filters.dateRange !== 'all' ? 1 : 0) +
        (filters.sortBy !== 'newest' ? 1 : 0);

    const updateFilter = (key: keyof FilterState, value: any) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-wrap items-center gap-3">
            {/* Status Filter */}
            <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value as DocumentStatus)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="analyzed">Analyzed</option>
                <option value="verified">Verified</option>
                <option value="flagged">Flagged</option>
            </select>

            {/* Date Range Filter */}
            <select
                value={filters.dateRange}
                onChange={(e) => updateFilter('dateRange', e.target.value as DateRange)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
                <option value="all">All Time</option>
                <option value="last7">Last 7 Days</option>
                <option value="last30">Last 30 Days</option>
                <option value="last90">Last 90 Days</option>
            </select>

            {/* Sort By */}
            <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value as SortOption)}
                className="px-4 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name-asc">Name (A-Z)</option>
                <option value="name-desc">Name (Z-A)</option>
            </select>

            {/* Active Filters & Clear */}
            {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">
                        <Filter className="w-4 h-4 inline mr-1" />
                        {activeFiltersCount} active
                    </span>
                    <button
                        onClick={onClear}
                        className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
