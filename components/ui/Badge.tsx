import { cn } from '@/lib/utils';

interface BadgeProps {
    children: React.ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
    glow?: boolean;
    className?: string;
}

const variantStyles = {
    default: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
    success: 'bg-green-500/20 text-green-300 border-green-500/30',
    warning: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    error: 'bg-red-500/20 text-red-300 border-red-500/30',
    info: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const glowStyles = {
    default: 'shadow-lg shadow-gray-500/50',
    success: 'shadow-lg shadow-green-500/50',
    warning: 'shadow-lg shadow-yellow-500/50',
    error: 'shadow-lg shadow-red-500/50',
    info: 'shadow-lg shadow-blue-500/50',
};

export default function Badge({ children, variant = 'default', glow = false, className }: BadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border',
                variantStyles[variant],
                glow && glowStyles[variant],
                className
            )}
        >
            {children}
        </span>
    );
}
