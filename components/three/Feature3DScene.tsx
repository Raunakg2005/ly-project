'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Suspense } from 'react';
import NetworkVisualization from './NetworkVisualization';

export default function Feature3DScene() {
    return (
        <div className="w-full h-full">
            <Canvas>
                <PerspectiveCamera makeDefault position={[0, 0, 6]} />
                <OrbitControls 
                    enableZoom={false} 
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                />
                
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} color="#3B82F6" />
                <pointLight position={[-10, -10, -5]} intensity={0.5} color="#A855F7" />
                
                <Suspense fallback={null}>
                    <NetworkVisualization />
                </Suspense>
            </Canvas>
        </div>
    );
}
