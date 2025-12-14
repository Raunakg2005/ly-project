'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Trail, Float } from '@react-three/drei';
import * as THREE from 'three';

function NetworkNode({ position, color }: { position: [number, number, number]; color: string }) {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.scale.setScalar(1 + Math.sin(state.clock.elapsedTime * 2) * 0.1);
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.8}>
            <Sphere ref={meshRef} args={[0.15, 16, 16]} position={position}>
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.5}
                    metalness={0.8}
                    roughness={0.2}
                />
            </Sphere>
        </Float>
    );
}

function ConnectionLine({ start, end }: { start: [number, number, number]; end: [number, number, number] }) {
    const lineRef = useRef<THREE.Line>(null);

    useFrame((state) => {
        if (lineRef.current && lineRef.current.material) {
            const material = lineRef.current.material as THREE.LineBasicMaterial;
            material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
    });

    const points = [new THREE.Vector3(...start), new THREE.Vector3(...end)];
    const geometry = new THREE.BufferGeometry().setFromPoints(points);

    return (
        <primitive object={new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: '#3B82F6', transparent: true, opacity: 0.3 }))} ref={lineRef} />
    );
}

export default function NetworkVisualization() {
    const nodes: Array<{ pos: [number, number, number]; color: string }> = [
        { pos: [0, 0, 0], color: '#3B82F6' },
        { pos: [2, 1, 0], color: '#A855F7' },
        { pos: [-2, 1, 0], color: '#EC4899' },
        { pos: [1, -1, 1], color: '#14B8A6' },
        { pos: [-1, -1, 1], color: '#F59E0B' },
        { pos: [0, 2, -1], color: '#EF4444' },
    ];

    const connections: Array<{ start: [number, number, number]; end: [number, number, number] }> = [
        { start: nodes[0].pos, end: nodes[1].pos },
        { start: nodes[0].pos, end: nodes[2].pos },
        { start: nodes[0].pos, end: nodes[3].pos },
        { start: nodes[0].pos, end: nodes[4].pos },
        { start: nodes[0].pos, end: nodes[5].pos },
        { start: nodes[1].pos, end: nodes[3].pos },
        { start: nodes[2].pos, end: nodes[4].pos },
        { start: nodes[3].pos, end: nodes[4].pos },
        { start: nodes[5].pos, end: nodes[1].pos },
        { start: nodes[5].pos, end: nodes[2].pos },
    ];

    return (
        <group>
            {connections.map((conn, i) => (
                <ConnectionLine key={i} start={conn.start} end={conn.end} />
            ))}
            {nodes.map((node, i) => (
                <NetworkNode key={i} position={node.pos} color={node.color} />
            ))}
        </group>
    );
}
