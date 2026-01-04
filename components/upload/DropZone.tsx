'use client';

import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';

interface FileWithPreview extends File {
    preview?: string;
    id: string;
    progress?: number;
    status?: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

interface DropZoneProps {
    onFilesSelected: (files: File[]) => void;
    maxFiles?: number;
    maxSize?: number; // in bytes
}

export default function DropZone({
    onFilesSelected,
    maxFiles = 10,
    maxSize = 10 * 1024 * 1024, // 10MB default
}: DropZoneProps) {
    const [files, setFiles] = useState<FileWithPreview[]>([]);
    const [error, setError] = useState<string>('');
    const [isDragActive, setIsDragActive] = useState(false);

    const validateFile = (file: File): string | null => {
        // Check file size
        if (file.size > maxSize) {
            return `File size exceeds ${formatFileSize(maxSize)}`;
        }

        // Get file extension
        const fileName = file.name.toLowerCase();
        const extension = fileName.substring(fileName.lastIndexOf('.'));

        // Valid extensions
        const validExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.gif', '.webp'];

        // Check by extension first (more reliable than MIME type)
        if (validExtensions.includes(extension)) {
            return null; // Valid file
        }

        // If extension check fails, also check MIME type as fallback
        const validTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp'];
        if (validTypes.includes(file.type)) {
            return null; // Valid file
        }

        return 'Invalid file type. Please upload PDF or images only.';
    };

    const processFiles = (fileList: FileList | null) => {
        if (!fileList) return;

        setError('');
        const newFiles: FileWithPreview[] = [];
        const errors: string[] = [];
        const warnings: string[] = [];

        // Check total files limit
        if (files.length + fileList.length > maxFiles) {
            setError(`Maximum ${maxFiles} files allowed`);
            return;
        }

        for (let i = 0; i < fileList.length; i++) {
            const file = fileList[i];

            // Check if file with same name already exists in current selection
            const isDuplicate = files.some(f => f.name === file.name);
            if (isDuplicate) {
                warnings.push(`${file.name} is already selected`);
                continue;
            }

            const validationError = validateFile(file);

            if (validationError) {
                errors.push(`${file.name}: ${validationError}`);
                continue;
            }

            const fileWithPreview = Object.assign(file, {
                id: Math.random().toString(36).substring(7),
                preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined,
                status: 'pending' as const,
                progress: 0
            });

            newFiles.push(fileWithPreview);
        }

        if (errors.length > 0) {
            setError(errors.join('\n'));
        } else if (warnings.length > 0) {
            setError(warnings.join('\n'));
        }

        if (newFiles.length > 0) {
            const updatedFiles = [...files, ...newFiles];
            setFiles(updatedFiles);
            onFilesSelected(updatedFiles);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragActive(false);
        processFiles(e.dataTransfer.files);
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        processFiles(e.target.files);
    };

    const removeFile = (fileId: string) => {
        const updatedFiles = files.filter(f => f.id !== fileId);
        setFiles(updatedFiles);
        onFilesSelected(updatedFiles);
    };

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    return (
        <div className="space-y-6">
            {/* Drop Zone */}
            <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    relative p-12 rounded-xl border-2 border-dashed transition-all cursor-pointer
                    ${isDragActive
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-slate-900/70'
                    }
                `}
            >
                <input
                    type="file"
                    multiple
                    accept="application/pdf,image/*"
                    onChange={handleFileInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                    <motion.div
                        animate={{
                            y: isDragActive ? -10 : 0,
                            scale: isDragActive ? 1.1 : 1
                        }}
                        className={`
                            p-4 rounded-full mb-4 transition-colors
                            ${isDragActive ? 'bg-emerald-500/20' : 'bg-slate-800'}
                        `}
                    >
                        <Upload className={`w-12 h-12 ${isDragActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                    </motion.div>

                    <h3 className="text-xl font-semibold text-white mb-2">
                        {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
                    </h3>

                    <p className="text-slate-400 mb-4">
                        or click to browse from your computer
                    </p>

                    <div className="flex flex-wrap gap-2 justify-center">
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
                            PDF
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
                            Images
                        </span>
                        <span className="px-3 py-1 rounded-full bg-slate-800 text-xs text-slate-300">
                            Max {formatFileSize(maxSize)}
                        </span>
                    </div>
                </div>
            </div>

            {/* Error Message */}
            <AnimatePresence>
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                    >
                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-400 whitespace-pre-line">{error}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* File List */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-3"
                    >
                        <h4 className="text-sm font-semibold text-slate-400">
                            Selected Files ({files.length})
                        </h4>

                        {files.map((file) => (
                            <motion.div
                                key={file.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="p-4 rounded-lg bg-slate-900/50 border border-slate-800 hover:border-slate-700 transition-colors"
                            >
                                <div className="flex items-start gap-4">
                                    {/* Preview/Icon */}
                                    <div className="flex-shrink-0">
                                        {file.preview ? (
                                            <img
                                                src={file.preview}
                                                alt={file.name}
                                                className="w-12 h-12 rounded-lg object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center">
                                                {file.type === 'application/pdf' ? (
                                                    <FileText className="w-6 h-6 text-red-400" />
                                                ) : (
                                                    <ImageIcon className="w-6 h-6 text-slate-400" />
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* File Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate" title={file.name}>
                                            {file.name}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {formatFileSize(file.size)}
                                        </p>

                                        {/* Progress bar if uploading */}
                                        {file.status === 'uploading' && file.progress !== undefined && (
                                            <div className="mt-2 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${file.progress}%` }}
                                                    className="h-full bg-emerald-500"
                                                />
                                            </div>
                                        )}
                                    </div>

                                    {/* Status/Remove */}
                                    <div className="flex-shrink-0">
                                        {file.status === 'success' ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        ) : file.status === 'error' ? (
                                            <AlertCircle className="w-5 h-5 text-red-400" />
                                        ) : (
                                            <button
                                                onClick={() => removeFile(file.id)}
                                                className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Error message */}
                                {file.error && (
                                    <p className="mt-2 text-xs text-red-400">
                                        {file.error}
                                    </p>
                                )}
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
