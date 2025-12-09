import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ChatBot } from '@/components/chat/ChatBot';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'DocShield - Quantum-Safe Document Verification',
  description: 'Secure document verification platform with quantum-resistant cryptography and AI-powered analysis',
  keywords: ['document verification', 'quantum cryptography', 'AI analysis', 'cybersecurity'],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <ChatBot />
      </body>
    </html>
  );
}
