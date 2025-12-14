'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox, Text, Float } from '@react-three/drei';
import * as THREE from 'three';

function Document({ position, rotation, color, delay = 0 }: { 
    position: [number, number, number]; 
    rotation?: [number, number, number];
    color: string;
    delay?: number;
}) {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5 + delay) * 0.2;
            groupRef.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.3 + delay) * 0.1;
        }
    });

    return (
        <Float speed={2} rotationIntensity={0.3} floatIntensity={0.5}>
            <group ref={groupRef} position={position} rotation={rotation}>
                {/* Document base */}
                <RoundedBox args={[1.2, 1.6, 0.05]} radius={0.05} smoothness={4}>
                    <meshStandardMaterial
                        color={color}
                        metalness={0.3}
                        roughness={0.4}
                        emissive={color}
                        emissiveIntensity={0.2}
                        transparent
                        opacity={0.9}
                    />
                </RoundedBox>

                {/* Document lines */}
                {[0, 1, 2, 3, 4].map((i) => (
                    <RoundedBox
                        key={i}
                        args={[0.9, 0.05, 0.051]}
                        position={[0, 0.5 - i * 0.25, 0.026]}
                        radius={0.02}
                        smoothness={2}
                    >
                        <meshStandardMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.6}
                        />
                    </RoundedBox>
                ))}

                {/* Shield icon representation */}
                <mesh position={[0, -0.5, 0.051]}>
                    <sphereGeometry args={[0.15, 16, 16]} />
                    <meshStandardMaterial
                        color="#FFD700"
                        metalness={0.8}
                        roughness={0.2}
                        emissive="#FFD700"
                        emissiveIntensity={0.5}
                    />
                </mesh>
            </group>
        </Float>
    );
}

export default function FloatingDocuments() {
    return (
        <group>
            <Document 
                position={[-3, 1, -2]} 
                rotation={[0.1, 0.3, 0]} 
                color="#3B82F6" 
                delay={0}
            />
            <Document 
                position={[3, -0.5, -3]} 
                rotation={[-0.1, -0.4, 0]} 
                color="#A855F7" 
                delay={1}
            />
            <Document 
                position={[0, 2, -4]} 
                rotation={[0.2, 0, 0]} 
                color="#EC4899" 
                delay={2}
            />
            <Document 
                position={[-2, -1.5, -2.5]} 
                rotation={[-0.15, 0.5, 0]} 
                color="#14B8A6" 
                delay={1.5}
            />
        </group>
    );
}
