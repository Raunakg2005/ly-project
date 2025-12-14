import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GradientTextProps {
    children: ReactNode;
    className?: string;
    animated?: boolean;
}

export default function GradientText({ children, className, animated = false }: GradientTextProps) {
    return (
        <span
            className={cn(
                'bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent',
                animated && 'animate-gradient bg-[length:200%_auto]',
                className
            )}
        >
            {children}
        </span>
    );
}
