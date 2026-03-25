import * as THREE from 'three';

const STEEL = { color: '#0a0a0a', metalness: 0.88, roughness: 0.22 } as const;

/**
 * Simple hydraulic cylinder that stretches between two 3D points.
 * Barrel at `from`, piston rod extends toward `to`.
 */
export function HydraulicCylinder({
  from,
  to,
  barrelRadius = 0.055,
  rodRadius = 0.025,
}: {
  from: [number, number, number];
  to: [number, number, number];
  barrelRadius?: number;
  rodRadius?: number;
}) {
  const vFrom = new THREE.Vector3(...from);
  const vTo   = new THREE.Vector3(...to);
  const dir   = new THREE.Vector3().subVectors(vTo, vFrom);
  const totalLen = dir.length();
  const mid   = new THREE.Vector3().addVectors(vFrom, vTo).multiplyScalar(0.5);
  const up    = new THREE.Vector3(0, 1, 0);
  const quat  = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

  const barrelLen = totalLen * 0.6;
  const rodLen    = totalLen * 0.55;

  // Offset positions along the local Y axis of the oriented group
  const barrelOffset = (totalLen / 2) - (barrelLen / 2); // barrel sits near `from`
  const rodOffset    = -(totalLen / 2) + (rodLen / 2);   // rod extends toward `to`

  return (
    <group position={mid} quaternion={quat}>

      {/* ── Barrel (body) ── */}
      <mesh position={[0, barrelOffset, 0]} castShadow>
        <cylinderGeometry args={[barrelRadius, barrelRadius, barrelLen, 12]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* End cap on barrel */}
      <mesh position={[0, barrelOffset + barrelLen / 2, 0]} castShadow>
        <cylinderGeometry args={[barrelRadius + 0.012, barrelRadius + 0.012, 0.04, 12]} />
        <meshStandardMaterial color="#222" metalness={0.85} roughness={0.25} />
      </mesh>

      {/* ── Rod (chrome piston) ── */}
      <mesh position={[0, rodOffset, 0]} castShadow>
        <cylinderGeometry args={[rodRadius, rodRadius, rodLen, 12]} />
        <meshStandardMaterial color="#bbb" metalness={0.95} roughness={0.08} />
      </mesh>

      {/* ── Clevis mount (from end — top) ── */}
      <group position={[0, totalLen / 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.03, 0.01, 8, 12]} />
          <meshStandardMaterial color="#666" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Pin */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
          <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* ── Clevis mount (to end — bottom) ── */}
      <group position={[0, -totalLen / 2, 0]}>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.03, 0.01, 8, 12]} />
          <meshStandardMaterial color="#666" metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Pin */}
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.012, 0.012, 0.1, 6]} />
          <meshStandardMaterial color="#aaa" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>
    </group>
  );
}