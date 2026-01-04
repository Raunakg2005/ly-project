'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import Sidebar from '@/components/layout/Sidebar';
import DropZone from '@/components/upload/DropZone';

export default function UploadPage() {
    const router = useRouter();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [uploadResults, setUploadResults] = useState<any[]>([]);
    const [error, setError] = useState('');

    const handleFilesSelected = (selectedFiles: File[]) => {
        setFiles(selectedFiles);
        setError('');
        setUploadResults([]);
    };

    const handleUpload = async () => {
        if (files.length === 0) return;

        setUploading(true);
        setError('');
        setUploadResults([]);

        try {
            const results = [];

            // Upload files sequentially
            for (const file of files) {
                try {
                    const result = await apiClient.uploadDocument(file);
                    results.push({
                        file: file.name,
                        success: true,
                        data: result
                    });
                } catch (err: any) {
                    const errorMessage = err.message || 'Upload failed';
                    const isDuplicate = errorMessage.includes('Duplicate') || errorMessage.includes('already exists');

                    results.push({
                        file: file.name,
                        success: false,
                        error: errorMessage,
                        isDuplicate
                    });
                }
            }

            setUploadResults(results);

            // If all successful, redirect after 2 seconds
            const allSuccess = results.every(r => r.success);
            if (allSuccess) {
                setTimeout(() => {
                    router.push('/documents');
                }, 2000);
            }
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-slate-950">
            <Sidebar />
            <main className="flex-1 p-4 lg:p-8">
                {/* Header */}
                <section className="relative py-8 px-4 mb-8">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }} />

                    <div className="max-w-4xl mx-auto relative z-10">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                                    <Shield className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold text-white">Upload Documents</h1>
                                    <p className="text-slate-400 mt-1">
                                        Securely upload your documents for quantum-safe verification
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </section>

                {/* Upload Section */}
                <section className="max-w-4xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-8 rounded-xl bg-slate-900/50 backdrop-blur-xl border border-slate-800/50"
                    >
                        <DropZone
                            onFilesSelected={handleFilesSelected}
                            maxFiles={10}
                            maxSize={10 * 1024 * 1024} // 10MB
                        />

                        {/* Upload Button */}
                        {files.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 flex justify-end"
                            >
                                <button
                                    onClick={handleUpload}
                                    disabled={uploading}
                                    className="px-8 py-3 rounded-lg bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:cursor-not-allowed text-black disabled:text-slate-500 font-semibold flex items-center gap-2 transition-all shadow-lg shadow-emerald-500/20 disabled:shadow-none"
                                >
                                    {uploading ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                            Uploading {files.length} file{files.length > 1 ? 's' : ''}...
                                        </>
                                    ) : (
                                        <>
                                            Upload {files.length} file{files.length > 1 ? 's' : ''}
                                            <ArrowRight className="w-5 h-5" />
                                        </>
                                    )}
                                </button>
                            </motion.div>
                        )}

                        {/* Error Message */}
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3"
                            >
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-red-400 mb-1">Upload Failed</p>
                                    <p className="text-sm text-red-400/80">{error}</p>
                                </div>
                            </motion.div>
                        )}

                        {/* Upload Results */}
                        {uploadResults.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-6 space-y-3"
                            >
                                <h3 className="text-sm font-semibold text-slate-400 mb-4">Upload Results</h3>

                                {uploadResults.map((result, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className={`p-4 rounded-lg border flex items-start gap-3 ${result.success
                                            ? 'bg-emerald-500/10 border-emerald-500/30'
                                            : 'bg-red-500/10 border-red-500/30'
                                            }`}
                                    >
                                        {result.success ? (
                                            <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                                        ) : (
                                            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        )}
                                        <div className="flex-1">
                                            <p className={`text-sm font-medium ${result.success ? 'text-emerald-400' : 'text-red-400'
                                                }`}>
                                                {result.file}
                                            </p>
                                            <p className={`text-xs mt-1 ${result.success ? 'text-emerald-400/70' : 'text-red-400/70'
                                                }`}>
                                                {result.success
                                                    ? 'Uploaded successfully'
                                                    : result.error || 'Upload failed'
                                                }
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}

                                {uploadResults.every(r => r.success) && (
                                    <motion.p
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                        className="text-sm text-center text-emerald-400 mt-4"
                                    >
                                        Redirecting to documents page...
                                    </motion.p>
                                )}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Features */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mt-8 grid md:grid-cols-3 gap-6"
                    >
                        {[
                            {
                                title: 'Quantum-Safe',
                                description: 'Post-quantum cryptographic hashing for future-proof security'
                            },
                            {
                                title: 'AI-Powered',
                                description: 'Automatic document analysis and authenticity verification'
                            },
                            {
                                title: 'Blockchain Ready',
                                description: 'Verification chain stored with immutable proof of authenticity'
                            }
                        ].map((feature, index) => (
                            <div
                                key={index}
                                className="p-6 rounded-lg bg-slate-900/30 border border-slate-800/50"
                            >
                                <h3 className="text-sm font-semibold text-emerald-400 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-slate-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </motion.div>
                </section>
            </main>
        </div>
    );
}
