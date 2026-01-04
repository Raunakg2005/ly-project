'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api/client';
import CertificatePreviewModal from '@/components/modals/CertificatePreviewModal';

interface CertificateButtonProps {
    documentId: string;
    documentName: string;
    verificationStatus: string;
}

export default function CertificateButton({ documentId, documentName, verificationStatus }: CertificateButtonProps) {
    const [loading, setLoading] = useState(false);
    const [certificateId, setCertificateId] = useState<string | null>(null);
    const [showPreview, setShowPreview] = useState(false);

    // Only show for verified documents
    if (verificationStatus !== 'verified') {
        return null;
    }

    const handleGenerateOrView = async () => {
        if (certificateId) {
            // Certificate already generated, show preview
            setShowPreview(true);
            return;
        }

        // Generate certificate first
        setLoading(true);
        try {
            const result = await apiClient.generateCertificate(documentId);
            if (result.success) {
                setCertificateId(result.certificate.id);
                setShowPreview(true);
            }
        } catch (error) {
            console.error('Certificate generation failed:', error);
            alert('Failed to generate certificate. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGenerateOrView}
                disabled={loading}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-emerald-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={certificateId ? "View Certificate" : "Generate Certificate"}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                    </>
                ) : (
                    <>
                        <Award className="w-4 h-4" />
                        {certificateId ? 'View Certificate' : 'Get Certificate'}
                    </>
                )}
            </motion.button>

            {certificateId && (
                <CertificatePreviewModal
                    isOpen={showPreview}
                    onClose={() => setShowPreview(false)}
                    certificateId={certificateId}
                    documentName={documentName}
                />
            )}
        </>
    );
}
