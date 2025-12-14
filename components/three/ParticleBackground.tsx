'use client';

import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial, MeshDistortMaterial, Sphere, Float } from '@react-three/drei';
import { useRef, useMemo, useState, useEffect } from 'react';
import * as THREE from 'three';

function Particles() {
    const ref = useRef<THREE.Points>(null);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePosition({
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: -(e.clientY / window.innerHeight) * 2 + 1,
            });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Generate particles in a more organic pattern
    const particlesCount = 5000;
    const [positions, colors] = useMemo(() => {
        const positions = new Float32Array(particlesCount * 3);
        const colors = new Float32Array(particlesCount * 3);
        
        for (let i = 0; i < particlesCount; i++) {
            // Create a sphere distribution
            const radius = Math.random() * 8 + 2;
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos((Math.random() * 2) - 1);
            
            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);
            
            // Gradient colors from blue to purple to pink
            const colorMix = Math.random();
            if (colorMix < 0.33) {
                colors[i * 3] = 0.2;     // R
                colors[i * 3 + 1] = 0.5; // G
                colors[i * 3 + 2] = 1;   // B (Blue)
            } else if (colorMix < 0.66) {
                colors[i * 3] = 0.6;     // R
                colors[i * 3 + 1] = 0.3; // G
                colors[i * 3 + 2] = 1;   // B (Purple)
            } else {
                colors[i * 3] = 1;       // R
                colors[i * 3 + 1] = 0.2; // G
                colors[i * 3 + 2] = 0.8; // B (Pink)
            }
        }
        return [positions, colors];
    }, []);

    // Animate particles with mouse interaction
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x = mousePosition.y * 0.1 + state.clock.elapsedTime * 0.05;
            ref.current.rotation.y = mousePosition.x * 0.1 + state.clock.elapsedTime * 0.05;
            
            // Pulse effect
            const scale = 1 + Math.sin(state.clock.elapsedTime * 0.5) * 0.05;
            ref.current.scale.setScalar(scale);
        }
    });

    return (
        <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                vertexColors
                size={0.015}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.8}
                blending={THREE.AdditiveBlending}
            />
            <bufferAttribute
                attach="attributes-color"
                count={colors.length / 3}
                array={colors}
                itemSize={3}
            />
        </Points>
    );
}

function FloatingOrbs() {
    return (
        <>
            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={2}>
                <Sphere args={[0.8, 32, 32]} position={[-4, 2, -3]}>
                    <MeshDistortMaterial
                        color="#3B82F6"
                        attach="material"
                        distort={0.4}
                        speed={2}
                        roughness={0.2}
                        metalness={0.8}
                        emissive="#3B82F6"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.6}
                    />
                </Sphere>
            </Float>
            
            <Float speed={2} rotationIntensity={0.8} floatIntensity={1.5}>
                <Sphere args={[0.6, 32, 32]} position={[4, -1, -2]}>
                    <MeshDistortMaterial
                        color="#A855F7"
                        attach="material"
                        distort={0.5}
                        speed={1.5}
                        roughness={0.2}
                        metalness={0.8}
                        emissive="#A855F7"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.6}
                    />
                </Sphere>
            </Float>
            
            <Float speed={1.8} rotationIntensity={0.6} floatIntensity={2.5}>
                <Sphere args={[0.5, 32, 32]} position={[2, 3, -4]}>
                    <MeshDistortMaterial
                        color="#EC4899"
                        attach="material"
                        distort={0.3}
                        speed={2.5}
                        roughness={0.2}
                        metalness={0.8}
                        emissive="#EC4899"
                        emissiveIntensity={0.5}
                        transparent
                        opacity={0.6}
                    />
                </Sphere>
            </Float>
        </>
    );
}

function CameraController() {
    const { camera } = useThree();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollY(window.scrollY);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useFrame(() => {
        camera.position.z = 1 + scrollY * 0.001;
        camera.rotation.x = scrollY * 0.0002;
    });

    return null;
}

export default function ParticleBackground() {
    return (
        <div className="fixed inset-0 -z-10">
            <Canvas
                camera={{ position: [0, 0, 1], fov: 75 }}
                className="bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900"
            >
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <Particles />
                <FloatingOrbs />
                <CameraController />
            </Canvas>
        </div>
    );
}
