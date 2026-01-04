'use client';

import { useState } from 'react';
import { X, Tag } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

interface EditCategoryModalProps {
    isOpen: boolean;
    document: any;
    onClose: () => void;
    onSuccess: () => void;
}

const CATEGORIES = [
    { value: 'passport', label: 'Passport' },
    { value: 'license', label: "Driver's License" },
    { value: 'id_card', label: 'ID Card' },
    { value: 'certificate', label: 'Certificate' },
    { value: 'contract', label: 'Contract' },
    { value: 'other', label: 'Other' },
];

export default function EditCategoryModal({ isOpen, document, onClose, onSuccess }: EditCategoryModalProps) {
    const [category, setCategory] = useState(document?.category || 'other');
    const [loading, setLoading] = useState(false);

    if (!isOpen || !document) return null;

    const handleSave = async () => {
        setLoading(true);
        try {
            await apiClient.updateDocumentCategory(document.id, category);
            onSuccess();
            onClose();
        } catch (error) {
            console.error('Failed to update category:', error);
            alert('Failed to update category');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-slate-900 rounded-2xl border border-slate-800 max-w-md w-full p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                            <Tag className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Edit Category</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                {/* Document Info */}
                <div className="mb-6 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                    <p className="text-sm text-slate-400 mb-1">Document</p>
                    <p className="text-white font-medium truncate">{document.fileName}</p>
                </div>

                {/* Category Select */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-white mb-3">
                        Select Category
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setCategory(cat.value)}
                                className={`p-3 rounded-lg border text-left transition-all ${category === cat.value
                                        ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400'
                                        : 'bg-slate-800 border-slate-700 text-slate-300 hover:border-slate-600'
                                    }`}
                            >
                                <p className="font-medium">{cat.label}</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-black font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
}
