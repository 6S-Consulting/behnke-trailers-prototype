import * as THREE from 'three';

const STEEL = { color: '#0a0a0a', metalness: 0.88, roughness: 0.22 } as const;

/**
 * Oriented tube between two 3D points (for diagonal braces).
 */
function TubeBetween({
  from, to, radius = 0.05,
}: {
  from: [number, number, number];
  to: [number, number, number];
  radius?: number;
}) {
  const vFrom = new THREE.Vector3(...from);
  const vTo = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(vTo, vFrom);
  const len = dir.length() + 0.25;
  const mid = new THREE.Vector3().addVectors(vFrom, vTo).multiplyScalar(0.5);
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());

  return (
    <mesh position={mid} quaternion={quat} castShadow>
      <cylinderGeometry args={[radius, radius, len, 16]} />
      <meshStandardMaterial {...STEEL} />
    </mesh>
  );
}

/**
 * Cube/box support frame for the cone hopper.
 * 
 * - All 12 edges of a rectangular box are rendered as steel tubes.
 * - 4 diagonal braces go from each bottom corner inward to the cone bottom radius.
 * - The cone sits centered on top, resting inside the top edges.
 */
export function SupportFrame({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const frameWidth = 3.8;    // X dimension (wide enough for cone to sit inside)
  const frameDepth = 3.8;    // Z dimension
  const frameHeight = 1.7;   // Y dimension (reduced height)
  const tube = 0.1;          // Square tube cross-section size

  const hw = frameWidth / 2;
  const hd = frameDepth / 2;


  // 4 bottom corners
  const botCorners: [number, number, number][] = [
    [-hw, 0, -hd],
    [hw, 0, -hd],
    [hw, 0, hd],
    [-hw, 0, hd],
  ];

  // 4 top corners
  const topCorners: [number, number, number][] = [
    [-hw, frameHeight, -hd],
    [hw, frameHeight, -hd],
    [hw, frameHeight, hd],
    [-hw, frameHeight, hd],
  ];

  // 4 diagonal targets — at the cone bottom radius, at the top of the frame
  const diagTargets: [number, number, number][] = [
    [-0.37, frameHeight - 0.9, -0.37],
    [ 0.37, frameHeight - 0.9, -0.37],
    [ 0.37, frameHeight - 0.9,  0.37],
    [-0.37, frameHeight - 0.9,  0.37],
  ];

  return (
    <group position={position} name="Support Frame">

      {/* ═══════════════════════════════════════════ */}
      {/* ── 12 EDGES OF THE CUBE FRAME ──           */}
      {/* ═══════════════════════════════════════════ */}

      {/* ── 4 Vertical Corner Legs ── */}
      {[[-hw, -hd], [hw, -hd], [hw, hd], [-hw, hd]].map(([x, z], i) => (
        <mesh key={`leg-${i}`} position={[x, frameHeight / 2, z]} castShadow name={`Vertical Leg ${i + 1}`}>
          <boxGeometry args={[tube, frameHeight, tube]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}

      {/* (Top edges removed — cone rests directly on the legs) */}

      {/* ── 4 Bottom Horizontal Edges ── */}
      {/* X-direction (front & back) */}
      {[-hd, hd].map((z, i) => (
        <mesh key={`bot-x-${i}`} position={[0, 0, z]} castShadow name={i === 0 ? "Front Bottom Rail" : "Back Bottom Rail"}>
          <boxGeometry args={[frameWidth, tube, tube]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}
      {/* Z-direction (left & right) */}
      {[-hw, hw].map((x, i) => (
        <mesh key={`bot-z-${i}`} position={[x, 0, 0]} castShadow name={x < 0 ? "Left Bottom Rail" : "Right Bottom Rail"}>
          <boxGeometry args={[tube, tube, frameDepth]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
      ))}

      {/* ═══════════════════════════════════════════ */}
      {/* ── 4 DIAGONAL BRACES ──                    */}
      {/* From each bottom corner → cone bottom area */}
      {/* ═══════════════════════════════════════════ */}
      {botCorners.map((bot, i) => (
        <group key={`diag-${i}`} name={`Diagonal Brace ${i + 1}`}>
          <TubeBetween
            from={bot}
            to={diagTargets[i]}
            radius={0.05}
          />
        </group>
      ))}

      {/* ═══════════════════════════════════════════ */}
      {/* ── GUSSET PLATES at bottom & top corners ──*/}
      {/* ═══════════════════════════════════════════ */}
      {[...botCorners, ...topCorners].map(([x, y, z], i) => {
        const isBottom = i < botCorners.length;
        const position = isBottom ? "bottom" : "top";
        return (
          <mesh key={`gusset-${i}`} position={[x, y, z]} castShadow name={`Gusset Plate ${position} ${i + 1}`}>
          <boxGeometry args={[0.18, 0.18, 0.18]} />
          <meshStandardMaterial {...STEEL} />
        </mesh>
        );
      })}
    </group>
  );
}
