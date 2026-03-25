import { useMemo } from 'react';
import * as THREE from 'three';

/**
 * Procedural texture for the heavy-duty truck tire tread.
 * Creates a bold, blocky pattern characteristic of off-road/truck tires.
 */
function useTireTexture() {
  return useMemo(() => {
    const size = 1024;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;

    // Base color/roughness
    ctx.fillStyle = '#444';
    ctx.fillRect(0, 0, size, size);

    const rows = 12;
    const cols = 20;
    const rowHeight = size / rows;
    const colWidth = size / cols;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * colWidth;
        const y = i * rowHeight;

        // Staggered block pattern
        const stagger = (i % 2) * (colWidth / 2);

        // Draw tread block
        ctx.fillStyle = '#888'; // Height map value (white is high)
        ctx.fillRect(x + stagger + 5, y + 5, colWidth - 10, rowHeight - 10);

        // Add "sipes" (little slits in the blocks)
        ctx.fillStyle = '#222';
        ctx.fillRect(x + stagger + colWidth / 2 - 1, y + 10, 2, rowHeight - 20);
      }
    }

    // Longitudinal grooves
    for (let k = 1; k < 4; k++) {
      ctx.fillStyle = '#000';
      ctx.fillRect((size / 4) * k - 8, 0, 16, size);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 4); // Repeat around the tire circumference
    return texture;
  }, []);
}

export function Wheel({
  position,
  rotation = [0, 0, 0],
}: {
  position: [number, number, number];
  rotation?: [number, number, number];
}) {
  const treadTexture = useTireTexture();

  // GIANT Truck Wheel Specs
  const tireRadius = 0.71;    // Giant outer radius
  const tireWidth = 0.48;    // Extremely wide tread
  const rimRadius = 0.38;    // Massive rim
  const lugCount = 6;

  return (
    <group position={position} rotation={rotation}>
      {/* 
        The Wheel is Y-up by default. 
        Axle.tsx rotates it [0, 0, ±PI/2] which aligns the Y-axis with the Axle's X-axis. 
      */}

      {/* ── Main Tire Body ── */}
      <mesh castShadow>
        <cylinderGeometry args={[tireRadius, tireRadius, tireWidth, 64, 1, false]} />
        <meshStandardMaterial
          color="#151515"
          roughness={0.9}
          metalness={0.05}
          bumpMap={treadTexture}
          bumpScale={0.08}
        />
      </mesh>

      {/* ── Tire Sidewalls (rounded parts) ── */}
      {[-1, 1].map((side) => (
        <mesh key={`sw-${side}`} position={[0, (tireWidth / 2 - 0.02) * side, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[tireRadius - 0.08, 0.08, 16, 64]} />
          <meshStandardMaterial color="#121212" roughness={0.8} metalness={0.02} />
        </mesh>
      ))}

      {/* ── Sidewall Inner Closure ── */}
      {[-1, 1].map((side) => (
        <mesh key={`sw-inner-${side}`} position={[0, (tireWidth / 2) * side, 0]} rotation={[Math.PI / 2, 0, 0]} >
          <ringGeometry args={[rimRadius - 0.02, tireRadius - 0.05, 64]} />
          <meshStandardMaterial color="#101010" roughness={0.9} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ── Rim ── */}
      <group position={[0, 0, 0]}>
        {/* Rim Barrel */}
        <mesh castShadow>
          <cylinderGeometry args={[rimRadius, rimRadius, tireWidth + 0.01, 32]} />
          <meshStandardMaterial color="#999" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* Outer Rim Lip (Visible side) */}
        <mesh position={[0, tireWidth / 2, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <torusGeometry args={[rimRadius, 0.025, 12, 32]} />
          <meshStandardMaterial color="#ccc" metalness={1} roughness={0.1} />
        </mesh>

        {/* ── Hub Components (Front and Back) ── */}
        {[-1, 1].map((side) => (
          <group key={`hub-side-${side}`} position={[0, (tireWidth / 2 + 0.01) * side, 0]} rotation={[side === -1 ? Math.PI : 0, 0, 0]}>
            {/* Hub / Center Piece face */}
            <mesh castShadow>
              <cylinderGeometry args={[0.26, 0.26, 0.08, 32]} />
              <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.2} />
            </mesh>

            {/* Lug Nuts Circle */}
            {Array.from({ length: lugCount }).map((_, i) => {
              const angle = (i / lugCount) * Math.PI * 2;
              const lugRingRadius = 0.21; // Scaled for the 0.5 rim
              return (
                <mesh
                  key={`lug-${side}-${i}`}
                  position={[Math.cos(angle) * lugRingRadius, 0.025, Math.sin(angle) * lugRingRadius]}
                >
                  <cylinderGeometry args={[0.018, 0.018, 0.06, 6]} />
                  <meshStandardMaterial color="#ddd" metalness={1} roughness={0.1} />
                </mesh>
              );
            })}

            {/* Center Hub Cap / Dome */}
            <mesh position={[0, -0.05, 0]} castShadow>
              <sphereGeometry args={[0.12, 12, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#999" metalness={0.95} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

// Keeping Fender and TrailerWheels for completeness as they were in the same file
function Fender({ position, mirror = false }: { position: [number, number, number]; mirror?: boolean }) {
  const scaleZ = mirror ? -1 : 1;

  return (
    <group position={position} scale={[1, 1, scaleZ]}>
      <mesh position={[0, 0.13, 0]} castShadow>
        <boxGeometry args={[1.22, 0.05, 0.45]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, -0.05, 0.21]} castShadow>
        <boxGeometry args={[1.22, 0.35, 0.02]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[-0.61, 0, 0.1]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.25]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0.61, 0, 0.1]} castShadow>
        <boxGeometry args={[0.02, 0.25, 0.25]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}


