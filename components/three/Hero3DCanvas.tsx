'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import { Suspense } from 'react';
import SecurityScene from './SecurityScene';

export default function Hero3DCanvas() {
    return (
        <div className="absolute inset-0 pointer-events-none">
            <Canvas gl={{ alpha: true, antialias: true, preserveDrawingBuffer: true }} style={{ background: 'none' }}>
                <color attach="background" args={['#020617']} />
                <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    autoRotate
                    autoRotateSpeed={0.5}
                    maxPolarAngle={Math.PI / 2}
                    minPolarAngle={Math.PI / 2}
                />

                <ambientLight intensity={0.8} />
                <pointLight position={[10, 10, 10]} intensity={2} color="#10b981" />
                <pointLight position={[-10, -10, -5]} intensity={1.5} color="#0ea5e9" />
                <spotLight
                    position={[0, 5, 0]}
                    angle={0.3}
                    penumbra={1}
                    intensity={1}
                    color="#10b981"
                />

                <Suspense fallback={null}>
                    <SecurityScene />
                </Suspense>
            </Canvas>
        </div>
    );
}
