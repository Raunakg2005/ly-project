'use client';

import { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

export default function CustomCursor() {
    const [isHovering, setIsHovering] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 300 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e: MouseEvent) => {
            cursorX.set(e.clientX - 16);
            cursorY.set(e.clientY - 16);
        };

        const handleMouseEnter = (e: Event) => {
            const target = e.target;
            if (target instanceof HTMLElement) {
                if (
                    target.tagName === 'A' ||
                    target.tagName === 'BUTTON' ||
                    target.closest('a') ||
                    target.closest('button')
                ) {
                    setIsHovering(true);
                }
            }
        };

        const handleMouseLeave = () => {
            setIsHovering(false);
        };

        window.addEventListener('mousemove', moveCursor);
        document.addEventListener('mouseenter', handleMouseEnter, true);
        document.addEventListener('mouseleave', handleMouseLeave, true);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            document.removeEventListener('mouseenter', handleMouseEnter, true);
            document.removeEventListener('mouseleave', handleMouseLeave, true);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            {/* Main cursor */}
            <motion.div
                className="fixed top-0 left-0 w-8 h-8 pointer-events-none z-[9999] hidden md:block"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                }}
            >
                <motion.div
                    className="w-full h-full rounded-full border-2 border-emerald-500"
                    animate={{
                        scale: isHovering ? 1.5 : 1,
                        borderColor: isHovering ? '#10b981' : '#10b981',
                    }}
                    transition={{ duration: 0.2 }}
                />
            </motion.div>

            {/* Cursor trail */}
            <motion.div
                className="fixed top-0 left-0 w-2 h-2 pointer-events-none z-[9998] hidden md:block"
                style={{
                    x: cursorXSpring,
                    y: cursorYSpring,
                    translateX: 13,
                    translateY: 13,
                }}
            >
                <motion.div
                    className="w-full h-full rounded-full bg-emerald-500"
                    animate={{
                        scale: isHovering ? 2 : 1,
                    }}
                    transition={{ duration: 0.2 }}
                />
            </motion.div>
        </>
    );
}
