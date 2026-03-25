import * as THREE from 'three';
import { useMemo } from 'react';

const STEEL = { color: '#0a0a0a', metalness: 0.88, roughness: 0.22 } as const;

/**
 * The large inverted-cone hopper (bowl on top, narrowing cone underneath).
 * Matches the B&B single cone spreader trailer style.
 */
export function ConeHopper({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const topRimRadius = 2.7;     // The wide circular bowl top
  const topRimHeight = 0.55;    // Height of the vertical wall at the top
  const coneTopRadius = 2.7;    // Where the cone begins (same as bowl)
  const coneBottomRadius = 0.35; // Narrow exit at the bottom
  const coneHeight = 0.8;       // Depth of the cone section
  const wallThickness = 0.05;

  // Rim lip at the very top
  const lipHeight = 0.1;
  const lipOverhang = 0.08;

  return (
    <group position={position} name="Cone Hopper">

      {/* ── Top Rim Lip (the rolled-over edge at the top) ── */}
      <mesh position={[0, topRimHeight + coneHeight + lipHeight / 2 , 0]} castShadow>
        <cylinderGeometry args={[
          topRimRadius + lipOverhang,
          topRimRadius + lipOverhang,
          lipHeight, 64, 1, true
        ]} />
        <meshStandardMaterial {...STEEL} side={THREE.DoubleSide} />
      </mesh>

      {/* Lip top cap ring */}
      <mesh position={[0, topRimHeight + coneHeight + lipHeight, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[topRimRadius, topRimRadius + lipOverhang, 64]} />
        <meshStandardMaterial {...STEEL} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Vertical Cylindrical Wall (top portion of bowl) ── */}
      <mesh position={[0, coneHeight + topRimHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[
          topRimRadius, topRimRadius,
          topRimHeight, 64, 1, true
        ]} />
        <meshStandardMaterial {...STEEL} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Inner wall (slightly smaller to give thickness) ── */}
      <mesh position={[0, coneHeight + topRimHeight / 2, 0]}>
        <cylinderGeometry args={[
          topRimRadius - wallThickness, topRimRadius - wallThickness,
          topRimHeight, 64, 1, true
        ]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Inverted Cone Section ── */}
      <mesh position={[0, coneHeight / 2, 0]} castShadow>
        <cylinderGeometry args={[
          coneTopRadius, coneBottomRadius,
          coneHeight, 64, 1, true
        ]} />
        <meshStandardMaterial {...STEEL} side={THREE.DoubleSide} />
      </mesh>

      {/* Inner cone wall */}
      <mesh position={[0, coneHeight / 2, 0]}>
        <cylinderGeometry args={[
          coneTopRadius - wallThickness, coneBottomRadius - wallThickness,
          coneHeight, 64, 1, true
        ]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Discharge opening ring at the bottom ── */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[coneBottomRadius - wallThickness, coneBottomRadius + 0.04, 32]} />
        <meshStandardMaterial color="#050505" metalness={0.9} roughness={0.15} side={THREE.DoubleSide} />
      </mesh>

      {/* ── Reinforcement bands on the cone ── */}
    

      {/* ── Top edge reinforcement ring ── */}
      <mesh position={[0, coneHeight + topRimHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[topRimRadius, 0.035, 8, 64]} />
        <meshStandardMaterial color="#0d0d0d" metalness={0.9} roughness={0.15} />
      </mesh>

     
    </group>
  );
}
