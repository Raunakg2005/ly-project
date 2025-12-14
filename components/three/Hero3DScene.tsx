'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense, useEffect, useState } from 'react';
import FloatingDocuments from './FloatingDocuments';

export default function Hero3DScene() {
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="absolute inset-0 pointer-events-none">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} />
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
                
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3B82F6" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#A855F7" />
                <spotLight position={[0, 5, 5]} angle={0.3} penumbra={1} intensity={1} color="#EC4899" />
                
                <Suspense fallback={null}>
                    <FloatingDocuments />
                </Suspense>
            </Canvas>
        </div>
    );
}
