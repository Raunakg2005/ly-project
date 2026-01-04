'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Shield, CheckCircle, XCircle, Clock, FileText, Hash, Calendar, User, AlertTriangle } from 'lucide-react';
import LoadingScreen from '@/components/animations/LoadingScreen';

interface CertificateData {
    valid: boolean;
    certificate: {
        id: string;
        document_name: string;
        verification_status: string;
        verification_date: string;
        verifier_name?: string;
        created_at: string;
    };
    document: {
        id: string;
        file_hash: string;
        status: string;
    } | null;
}

export default function VerifyCertificatePage() {
    const params = useParams();
    const router = useRouter();
    const certificateId = params.certificate_id as string;

    const [loading, setLoading] = useState(true);
    const [certificate, setCertificate] = useState<CertificateData | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCertificate = async () => {
            try {
                const response = await fetch(`http://127.0.0.1:8000/api/certificates/verify/${certificateId}`);

                if (!response.ok) {
                    throw new Error('Certificate not found');
                }

                const data = await response.json();
                setCertificate(data);
            } catch (err) {
                setError('Certificate not found or invalid');
            } finally {
                setLoading(false);
            }
        };

        if (certificateId) {
            fetchCertificate();
        }
    }, [certificateId]);

    if (loading) {
        return <LoadingScreen />;
    }

    if (error || !certificate) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="max-w-md w-full bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border border-red-500/30"
                >
                    <div className="text-center">
                        <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                        <h1 className="text-2xl font-bold text-white mb-2">Invalid Certificate</h1>
                        <p className="text-slate-400 mb-6">{error}</p>
                        <button
                            onClick={() => router.push('/')}
                            className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                        >
                            Go Home
                        </button>
                    </div>
                </motion.div>
            </div>
        );
    }

    const isValid = certificate.valid && certificate.certificate.verification_status === 'verified';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-2xl w-full"
            >
                {/* Header */}
                <div className="text-center mb-8">
                    <Shield className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                    <h1 className="text-3xl font-bold text-white mb-2">Certificate Verification</h1>
                    <p className="text-slate-400">DocShield - Quantum-Safe Document Verification</p>
                </div>

                {/* Certificate Card */}
                <div className={`bg-slate-800/50 backdrop-blur-md rounded-2xl p-8 border-2 ${isValid ? 'border-emerald-500/50' : 'border-yellow-500/50'
                    }`}>
                    {/* Status Badge */}
                    <div className="flex items-center justify-center mb-6">
                        {isValid ? (
                            <div className="flex items-center gap-3 px-6 py-3 bg-emerald-500/20 border border-emerald-500/50 rounded-full">
                                <CheckCircle className="w-6 h-6 text-emerald-400" />
                                <span className="text-emerald-400 font-bold text-lg">VALID CERTIFICATE</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3 px-6 py-3 bg-yellow-500/20 border border-yellow-500/50 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-yellow-400" />
                                <span className="text-yellow-400 font-bold text-lg">PENDING VERIFICATION</span>
                            </div>
                        )}
                    </div>

                    {/* Certificate Details */}
                    <div className="space-y-4">
                        {/* Certificate ID */}
                        <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                            <Shield className="w-5 h-5 text-emerald-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-slate-400">Certificate ID</p>
                                <p className="text-white font-mono text-sm break-all">{certificate.certificate.id}</p>
                            </div>
                        </div>

                        {/* Document Name */}
                        <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                            <FileText className="w-5 h-5 text-blue-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-slate-400">Document</p>
                                <p className="text-white font-medium">{certificate.certificate.document_name}</p>
                            </div>
                        </div>

                        {/* Verification Date */}
                        <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                            <Calendar className="w-5 h-5 text-purple-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-slate-400">Verified On</p>
                                <p className="text-white">{new Date(certificate.certificate.verification_date).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Verifier */}
                        {certificate.certificate.verifier_name && (
                            <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                                <User className="w-5 h-5 text-yellow-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-slate-400">Verified By</p>
                                    <p className="text-white">{certificate.certificate.verifier_name}</p>
                                </div>
                            </div>
                        )}

                        {/* Document Hash */}
                        {certificate.document && (
                            <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                                <Hash className="w-5 h-5 text-cyan-400 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm text-slate-400">Document Hash</p>
                                    <p className="text-white font-mono text-xs break-all">{certificate.document.file_hash}</p>
                                </div>
                            </div>
                        )}

                        {/* Issue Date */}
                        <div className="flex items-start gap-3 p-4 bg-slate-700/30 rounded-lg">
                            <Clock className="w-5 h-5 text-orange-400 mt-0.5" />
                            <div className="flex-1">
                                <p className="text-sm text-slate-400">Certificate Issued</p>
                                <p className="text-white">{new Date(certificate.certificate.created_at).toLocaleString()}</p>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-6 pt-6 border-t border-slate-700">
                        <p className="text-center text-sm text-slate-400">
                            This certificate is digitally signed and secured using quantum-safe cryptography
                        </p>
                    </div>
                </div>

                {/* Home Button */}
                <div className="text-center mt-6">
                    <button
                        onClick={() => router.push('/')}
                        className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
                    >
                        Go to DocShield
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
