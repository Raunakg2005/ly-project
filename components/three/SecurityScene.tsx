'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text3D, Float } from '@react-three/drei';
import * as THREE from 'three';

function ScanningDocument({ position }: { position: [number, number, number] }) {
    const groupRef = useRef<THREE.Group>(null);
    const scanLineRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
        }
        if (scanLineRef.current) {
            scanLineRef.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.8;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.2} floatIntensity={0.5}>
            <group ref={groupRef} position={position}>
                {/* Document */}
                <RoundedBox args={[1.5, 2, 0.05]} radius={0.05} smoothness={4}>
                    <meshStandardMaterial
                        color="#0f172a"
                        metalness={0.1}
                        roughness={0.3}
                        emissive="#10b981"
                        emissiveIntensity={0.1}
                    />
                </RoundedBox>

                {/* Document lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <RoundedBox
                        key={i}
                        args={[1.2, 0.06, 0.051]}
                        position={[0, 0.7 - i * 0.3, 0.026]}
                        radius={0.02}
                    >
                        <meshStandardMaterial color="#10b981" opacity={0.3} transparent />
                    </RoundedBox>
                ))}

                {/* Scanning line */}
                <mesh ref={scanLineRef} position={[0, 0, 0.051]}>
                    <planeGeometry args={[1.5, 0.1]} />
                    <meshBasicMaterial color="#10b981" transparent opacity={0.6} />
                </mesh>

                {/* Shield icon */}
                <mesh position={[0, -0.6, 0.051]}>
                    <boxGeometry args={[0.3, 0.3, 0.05]} />
                    <meshStandardMaterial
                        color="#10b981"
                        emissive="#10b981"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </group>
        </Float>
    );
}

function LockIcon({ position }: { position: [number, number, number] }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime) * 0.1;
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <cylinderGeometry args={[0.2, 0.2, 0.4, 32]} />
            <meshStandardMaterial
                color="#10b981"
                emissive="#10b981"
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.2}
            />
        </mesh>
    );
}

function DataParticles() {
    const particlesRef = useRef<THREE.Points>(null);
    
    const particleCount = 1000;
    const positions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }

    useFrame((state) => {
        if (particlesRef.current) {
            particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05;
        }
    });

    return (
        <points ref={particlesRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.02}
                color="#10b981"
                transparent
                opacity={0.6}
                sizeAttenuation
            />
        </points>
    );
}

function SecurityGrid() {
    const gridRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (gridRef.current) {
            gridRef.current.rotation.y = state.clock.elapsedTime * 0.1;
        }
    });

    return (
        <group ref={gridRef}>
            {[...Array(8)].map((_, i) => {
                const angle = (i / 8) * Math.PI * 2;
                const radius = 3;
                return (
                    <mesh
                        key={i}
                        position={[
                            Math.cos(angle) * radius,
                            0,
                            Math.sin(angle) * radius,
                        ]}
                    >
                        <boxGeometry args={[0.05, 2, 0.05]} />
                        <meshStandardMaterial
                            color="#10b981"
                            emissive="#10b981"
                            emissiveIntensity={0.2}
                            transparent
                            opacity={0.4}
                        />
                    </mesh>
                );
            })}
        </group>
    );
}

export default function SecurityScene() {
    return (
        <group>
            <ScanningDocument position={[0, 0, 0]} />
            <LockIcon position={[-2, 1, -1]} />
            <LockIcon position={[2, -1, -1]} />
            <DataParticles />
            <SecurityGrid />
        </group>
    );
}
