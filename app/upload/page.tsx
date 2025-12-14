'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';

export default function UploadPage() {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [error, setError] = useState<string>('');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
            setError('');
            setResult(null);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setError('');
            setResult(null);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError('');
        setResult(null);

        try {
            const response = await apiClient.uploadDocument(file);
            setResult(response);
            setFile(null);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-8 relative overflow-hidden">
            {/* Grid background */}
            <div className="absolute inset-0" style={{
                backgroundImage: `linear-gradient(rgba(16,185,129,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(16,185,129,0.03) 1px, transparent 1px)`,
                backgroundSize: '50px 50px'
            }} />

            {/* Gradient blobs */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />

            <div className="max-w-4xl mx-auto relative z-10">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
                        Upload Document
                    </h1>
                    <p className="text-slate-400">
                        Upload your PDF or image for quantum-safe verification
                    </p>
                </div>

                {/* Upload Area */}
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800/50 rounded-2xl shadow-2xl p-8 mb-8">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                                ? 'border-emerald-500 bg-emerald-500/10'
                                : 'border-slate-700 hover:border-emerald-500/50'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="h-16 w-16 mx-auto mb-4 text-emerald-400" />

                        {file ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="h-5 w-5 text-emerald-400" />
                                    <span className="font-medium text-white">{file.name}</span>
                                </div>
                                <p className="text-sm text-slate-400">
                                    Size: {(file.size / 1024).toFixed(2)} KB
                                </p>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-sm text-red-400 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-lg mb-2 text-white">
                                    Drag and drop your file here
                                </p>
                                <p className="text-slate-500 mb-4">or</p>
                                <label className="cursor-pointer">
                                    <span className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/20 transition-all inline-block font-medium">
                                        Browse Files
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="text-sm text-slate-500 mt-4">
                                    Supported: PDF, JPG, PNG (Max 10MB)
                                </p>
                            </>
                        )}
                    </div>

                    {/* Upload Button */}
                    {file && (
                        <button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium"
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Uploading & Analyzing...
                                </>
                            ) : (
                                <>
                                    <Upload className="h-5 w-5" />
                                    Upload Document
                                </>
                            )}
                        </button>
                    )}
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
                        <XCircle className="h-6 w-6 text-red-400" />
                        <div>
                            <p className="font-semibold text-red-400">Upload Failed</p>
                            <p className="text-sm text-red-300">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Result */}
                {result?.success && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="h-6 w-6 text-emerald-400" />
                            <h3 className="font-semibold text-emerald-400 text-lg">
                                Upload Successful!
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-slate-400">File Name:</p>
                                <p className="font-medium text-white">{result.document?.fileName}</p>
                            </div>
                            <div>
                                <p className="text-slate-400">File Size:</p>
                                <p className="font-medium text-white">
                                    {(result.document?.fileSize / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400">File Hash:</p>
                                <p className="font-mono text-xs text-slate-300">
                                    {result.document?.fileHash?.substring(0, 16)}...
                                </p>
                            </div>
                            <div>
                                <p className="text-slate-400">Status:</p>
                                <p className="font-medium capitalize text-white">
                                    {result.document?.verificationStatus}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
                            <p className="text-sm text-emerald-400">
                                ✅ Document digitally signed with RSA-2048
                            </p>
                            <p className="text-sm text-emerald-400">
                                ✅ SHA-256 hash generated
                            </p>
                            <p className="text-sm text-emerald-400">
                                ✅ PDF text extracted successfully
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
