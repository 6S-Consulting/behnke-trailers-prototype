import * as THREE from 'three';

const STEEL = { color: '#0a0a0a', metalness: 0.88, roughness: 0.22 } as const;

/**
 * A-frame tongue with hitch coupler, jack stand, and safety chains.
 * Designed for a single-axle cone spreader trailer.
 */
export function ConeTongue({ position = [0, 0, 0], rotation = [0, 0, 0] }: { position?: [number, number, number]; rotation?: [number, number, number] }) {
  const tongueLength = 3.2;
  const spread = 1.4;  // Width at frame attachment point
  const beamW = 0.12;
  const beamH = 0.12;
  const beamLen = Math.sqrt(tongueLength ** 2 + (spread / 2) ** 2);
  const beamAngle = Math.atan2(spread / 2, tongueLength);

  return (
    <group position={position} rotation={rotation} name="Tongue / Hitch">

      {/* ── A-Frame Left Beam ── */}
      <mesh
        position={[-spread / 4, 0, -tongueLength / 2]}
        rotation={[0, beamAngle, 0]}
        castShadow
      >
        <boxGeometry args={[beamW, beamH, beamLen]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* ── A-Frame Right Beam ── */}
      <mesh
        position={[spread / 4, 0, -tongueLength / 2]}
        rotation={[0, -beamAngle, 0]}
        castShadow
      >
        <boxGeometry args={[beamW, beamH, beamLen]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* ── Cross Brace near hitch end ── */}
      <mesh position={[0, 0, -tongueLength * 0.65]} castShadow>
        <boxGeometry args={[spread * 0.65, beamH, beamW]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* ── Hitch Coupler ── */}
      <group position={[2, 1.75, -tongueLength]}>
        {/* Coupler body */}
        <mesh castShadow>
          <boxGeometry args={[0.2, 0.14, 0.35]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        {/* Ball socket */}
        <mesh position={[0, -0.05, 0]} castShadow>
          <sphereGeometry args={[0.06, 12, 12]} />
          <meshStandardMaterial color="#555" metalness={0.95} roughness={0.1} />
        </mesh>
        {/* Latch handle */}
        <mesh position={[0.12, 0.05, 0]} rotation={[0, 0, Math.PI / 6]} castShadow>
          <boxGeometry args={[0.05, 0.04, 0.04]} />
          <meshStandardMaterial color="#cc2200" metalness={0.3} roughness={0.7} />
        </mesh>
        {/* Crank handle */}
        <mesh position={[0.12, 0.1, 0.1]} rotation={[0, 0, Math.PI / 4]} castShadow>
          <boxGeometry args={[0.5, 0.03, 0.03]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Handle grip */}
        <mesh position={[0.3, 0.28, 0.1]} castShadow>
          <cylinderGeometry args={[0.02, 0.02, 0.1, 8]} />
          <meshStandardMaterial color="#222" roughness={0.9} />
        </mesh>
        {[-1, 1].map((side) => (
        <group key={`chain-${side}`} position={[side * 0.08, 0, -tongueLength + 3.35]}>
          {/* Chain links (simplified as small tori) */}
          {Array.from({ length: 6 }).map((_, i) => (
            <mesh
              key={i}
              position={[0, -0.05 * i, -0.02 * i]}
              rotation={[Math.PI / 4, 0, i % 2 === 0 ? 0 : Math.PI / 2]}
            >
              <torusGeometry args={[0.025, 0.006, 6, 8]} />
              <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}
      </group>

      {/* ── Jack Stand ── */}
      <group position={[0, 0, -tongueLength + 1.1]}>
        {/* Outer tube */}
        <mesh position={[0, -0.4, 0]} castShadow>
          <cylinderGeometry args={[0.04, 0.04, 0.8, 12]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        {/* Inner tube (telescoping) */}
        <mesh position={[0, -0.85, 0]} castShadow>
          <cylinderGeometry args={[0.03, 0.03, 0.5, 12]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Foot pad */}
        <mesh position={[0, -1.1, 0]} castShadow>
          <cylinderGeometry args={[0.08, 0.1, 0.04, 12]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
       
        
      </group>

      {/* ── Safety Chains ── */}
      

      {/* ── Mounting plate (where tongue bolts to frame) ── */}
      <mesh position={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[spread + 0.1, 0.15, 0.08]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>
    </group>
  );
}
