import { useMemo } from 'react';
import { Edges } from '@react-three/drei';
import * as THREE from 'three';

export function Wheel({ position = [0, 0, 0], rotation = [Math.PI / 2, 0, 0] }: { position?: [number, number, number], rotation?: [number, number, number] }) {
  const mats = useMemo(() => ({
    rubber: new THREE.MeshStandardMaterial({ color: '#151515', roughness: 0.8, metalness: 0 }),
    steelRim: new THREE.MeshStandardMaterial({ color: '#c0c0c0', metalness: 0.9, roughness: 0.2 }),
    hubCap: new THREE.MeshStandardMaterial({ color: '#2d3436', metalness: 0.8 })
  }), []);

  // Create a realistic tire cross-section profile
  const tireProfile = useMemo(() => {
    const points = [];
    // Creating the sidewall curve and tread face
    points.push(new THREE.Vector2(0.5, -0.25)); // Inner rim start
    points.push(new THREE.Vector2(0.85, -0.25)); // Outer sidewall bulge
    points.push(new THREE.Vector2(0.9, -0.15));  // Tread shoulder
    points.push(new THREE.Vector2(0.9, 0.15));   // Tread face
    points.push(new THREE.Vector2(0.85, 0.25));  // Tread shoulder
    points.push(new THREE.Vector2(0.5, 0.25));   // Inner rim end
    return points;
  }, []);

  return (
    <group position={position} rotation={rotation} name="Wheel Assembly">
      {/* 1. THE TIRE (Lathe Geometry for realistic sidewall bulge) */}
      <mesh castShadow name="Heavy Duty Tire">
        <latheGeometry args={[tireProfile, 32]} />
        <primitive object={mats.rubber} attach="material" />
      </mesh>

      {/* 2. THE RIM (Deep Dish Detail) */}
      <group name="Steel Rim">
        {/* Main Rim Plate */}
        <mesh position={[0, -0.05, 0]} name="Rim Plate">
          <cylinderGeometry args={[0.52, 0.52, 0.35, 32]} />
          <primitive object={mats.steelRim} attach="material" />
        </mesh>

        {/* Hub / Dust Cap */}
        <mesh position={[0, 0.2, 0]} name="Axle Hub Cap">
          <cylinderGeometry args={[0.18, 0.18, 0.25, 16]} />
          <primitive object={mats.hubCap} attach="material" />
          <Edges color="white" />
        </mesh>

        {/* 8-Bolt Pattern (Lug Nuts) */}
        {Array.from({ length: 8 }).map((_, i) => (
          <mesh
            key={i}
            name={`Lug Nut ${i + 1}`}
            position={[
              Math.cos((i / 8) * Math.PI * 2) * 0.35,
              0.1,
              Math.sin((i / 8) * Math.PI * 2) * 0.35
            ]}
          >
            <cylinderGeometry args={[0.025, 0.025, 0.05, 6]} />
            <meshStandardMaterial color="#888" metalness={1} />
          </mesh>
        ))}
      </group>
    </group>
  );
}
