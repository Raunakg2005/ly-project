import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
}

export default function GlassCard({ children, className, hover = true }: GlassCardProps) {
    return (
        <div
            className={cn(
                'relative rounded-2xl p-6',
                'bg-white/5 backdrop-blur-xl',
                'border border-white/10',
                'shadow-xl shadow-black/20',
                hover && 'transition-all duration-300 hover:bg-white/10 hover:scale-105 hover:shadow-2xl',
                className
            )}
        >
            {/* Gradient glow effect */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative z-10">{children}</div>
        </div>
    );
}
