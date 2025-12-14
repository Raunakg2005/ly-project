'use client';

import { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { api } from '@/lib/api/client';

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
            const response = await api.uploadDocument(file);
            setResult(response);
            setFile(null);
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
                        Upload Document
                    </h1>
                    <p className="text-gray-600">
                        Upload your PDF or image for quantum-safe verification
                    </p>
                </div>

                {/* Upload Area */}
                <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                    <div
                        className={`border-2 border-dashed rounded-xl p-12 text-center transition-all ${dragActive
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-300 hover:border-blue-400'
                            }`}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <Upload className="h-16 w-16 mx-auto mb-4 text-blue-500" />

                        {file ? (
                            <div className="space-y-4">
                                <div className="flex items-center justify-center gap-2">
                                    <FileText className="h-5 w-5 text-blue-600" />
                                    <span className="font-medium">{file.name}</span>
                                </div>
                                <p className="text-sm text-gray-500">
                                    Size: {(file.size / 1024).toFixed(2)} KB
                                </p>
                                <button
                                    onClick={() => setFile(null)}
                                    className="text-sm text-red-600 hover:underline"
                                >
                                    Remove
                                </button>
                            </div>
                        ) : (
                            <>
                                <p className="text-lg mb-2">
                                    Drag and drop your file here
                                </p>
                                <p className="text-gray-500 mb-4">or</p>
                                <label className="cursor-pointer">
                                    <span className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:shadow-lg transition-all inline-block">
                                        Browse Files
                                    </span>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept=".pdf,image/*"
                                        onChange={handleFileChange}
                                    />
                                </label>
                                <p className="text-sm text-gray-500 mt-4">
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
                            className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-8 flex items-center gap-3">
                        <XCircle className="h-6 w-6 text-red-600" />
                        <div>
                            <p className="font-semibold text-red-800">Upload Failed</p>
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Result */}
                {result?.success && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                            <h3 className="font-semibold text-green-800 text-lg">
                                Upload Successful!
                            </h3>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600">File Name:</p>
                                <p className="font-medium">{result.document?.fileName}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">File Size:</p>
                                <p className="font-medium">
                                    {(result.document?.fileSize / 1024).toFixed(2)} KB
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">File Hash:</p>
                                <p className="font-mono text-xs">
                                    {result.document?.fileHash?.substring(0, 16)}...
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Status:</p>
                                <p className="font-medium capitalize">
                                    {result.document?.verificationStatus}
                                </p>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-blue-800">
                                ✅ Document digitally signed with RSA-2048
                            </p>
                            <p className="text-sm text-blue-800">
                                ✅ SHA-256 hash generated
                            </p>
                            <p className="text-sm text-blue-800">
                                ✅ PDF text extracted successfully
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
