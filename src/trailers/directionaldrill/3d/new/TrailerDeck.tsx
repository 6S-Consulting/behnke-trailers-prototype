import { useMemo } from 'react';
import * as THREE from 'three';

export type DeckWood = 'treated-pine' | 'white-oak';

function useWoodPlankMaterials(deckWood: DeckWood) {
  return useMemo(() => {
    const tones =
      deckWood === 'white-oak'
        ? ['#9d7849', '#946f41', '#8f6c3f', '#a38051', '#8b673b', '#99764a']
        : ['#ad8551', '#a27a45', '#9c7440', '#b18d58', '#9a6f3f', '#a97f4d'];

    // Slightly more "wood-like" than a single flat color.
    return tones.map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.86,
          metalness: 0.04,
        }),
    );
  }, [deckWood]);
}

function WoodPlank({
  position,
  size,
  material,
}: {
  position: [number, number, number];
  size: [number, number, number];
  material: THREE.MeshStandardMaterial;
}) {
  return (
    <mesh position={position} castShadow receiveShadow material={material}>
      <boxGeometry args={size} />
    </mesh>
  );
}

export function TrailerDeck({
  tiltAngle = 0,
  deckWood = 'treated-pine',
}: {
  tiltAngle: number;
  deckWood?: DeckWood;
}) {
  const woodPlanks = useWoodPlankMaterials(deckWood);
  const deckWidth = 1.9;
  const plankThickness = deckWood === 'white-oak' ? 0.039375 : 0.035;
  const plankWidth = 0.16;
  const gap = 0.01;
  const deckY = 0.22;

  const totalLength = 7.2;
  const frontLength = 1.4; // fixed 20%
  const tiltLength = 5.8; // tilting 80%

  const frontStartX = -totalLength / 2;
  const tiltStartX = frontStartX + frontLength;
  // Pivot around the center of the tilting (wood 80%) section.
  // This prevents the tilting deck from dropping unrealistically into the ground.
  const tiltCenterX = tiltStartX + tiltLength / 2;

  const plankCount = Math.floor(deckWidth / (plankWidth + gap));
  const planksStartZ = -(plankCount * (plankWidth + gap)) / 2 + plankWidth / 2;

  return (
    <group>
      {/* Fixed front section */}
      <group position={[frontStartX + frontLength / 2, deckY, 0]}>
        {Array.from({ length: plankCount }, (_, i) => (
          <WoodPlank
            key={`front-${i}`}
            position={[0, 0, planksStartZ + i * (plankWidth + gap)]}
            size={[frontLength, plankThickness, plankWidth]}
            material={woodPlanks[i % woodPlanks.length]}
          />
        ))}
      </group>

      {/* Rear tilt section (pivots from center joint) */}
      <group position={[tiltCenterX, deckY, 0]}>
        <group rotation={[0, 0, -tiltAngle]}>
          {Array.from({ length: plankCount }, (_, i) => (
            <WoodPlank
              key={`tilt-${i}`}
              position={[0, 0, planksStartZ + i * (plankWidth + gap)]}
              size={[tiltLength, plankThickness, plankWidth]}
              material={woodPlanks[(i + plankCount) % woodPlanks.length]}
            />
          ))}

          {/* Tilt bed side rails */}
          {[-deckWidth / 2 - 0.01, deckWidth / 2 + 0.01].map((z, i) => (
            <mesh key={`side-${i}`} position={[0, 0.02, z]} castShadow>
              <boxGeometry args={[tiltLength, 0.06, 0.04]} />
              <meshStandardMaterial color="#1a1a1e" metalness={0.85} roughness={0.35} />
            </mesh>
          ))}

          {/* Tail ramp/gate exactly at rear end */}
          <group position={[tiltLength / 2 + 0.28, -0.03, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[0.58, 0.04, deckWidth]} />
              <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.25} />
            </mesh>
            {Array.from({ length: 5 }, (_, row) =>
              Array.from({ length: 8 }, (_, col) => (
                <mesh
                  key={`d-${row}-${col}`}
                  position={[-0.18 + row * 0.09, 0.024, -0.7 + col * 0.2]}
                  rotation={[0, Math.PI / 4, 0]}
                >
                  <boxGeometry args={[0.02, 0.005, 0.02]} />
                  <meshStandardMaterial color="#3a3a3e" metalness={0.85} roughness={0.2} />
                </mesh>
              ))
            ).flat()}
          </group>

          {/* Rear lights at very end */}
          {[-deckWidth / 2 + 0.12, -deckWidth / 2 + 0.32, deckWidth / 2 - 0.12, deckWidth / 2 - 0.32].map((z, i) => (
            <mesh key={`rearlight-${i}`} position={[tiltLength + 0.58, -0.01, z]}>
              <boxGeometry args={[0.03, 0.06, 0.1]} />
              <meshStandardMaterial color="#cc1111" emissive="#cc1111" emissiveIntensity={0.65} metalness={0.25} roughness={0.4} />
            </mesh>
          ))}

          {/* Hydraulic cylinders (tilt mechanism) near front underside */}
          {[-0.38, 0.38].map((z, i) => (
            <group key={`hydro-${i}`} position={[0.55 - tiltLength / 2, -0.09, z]}>
              <mesh rotation={[0, 0, Math.PI / 2 + tiltAngle * 0.35]} castShadow>
                <cylinderGeometry args={[0.035, 0.035, 0.62, 12]} />
                <meshStandardMaterial color="#3a3a3a" metalness={0.9} roughness={0.2} />
              </mesh>
              <mesh position={[0.31, -0.05, 0]} rotation={[0, 0, Math.PI / 2 + tiltAngle * 0.35]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.38, 12]} />
                <meshStandardMaterial color="#999" metalness={0.95} roughness={0.15} />
              </mesh>
            </group>
          ))}

          {/* Hydraulic pump at backside of tilt section */}
          <group position={[tiltLength / 2 - 0.65, -0.06, 0.72]}>
            <mesh castShadow>
              <boxGeometry args={[0.28, 0.12, 0.18]} />
              <meshStandardMaterial color="#2b2b2f" metalness={0.75} roughness={0.35} />
            </mesh>
            <mesh position={[0.15, 0.02, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
              <cylinderGeometry args={[0.03, 0.03, 0.1, 12]} />
              <meshStandardMaterial color="#4a4a4f" metalness={0.85} roughness={0.25} />
            </mesh>
          </group>
        </group>
      </group>

      {/* Pivot hardware at center joint */}
      {[-0.7, -0.35, 0, 0.35, 0.7].map((z, i) => (
        <mesh key={`hinge-${i}`} position={[tiltCenterX, deckY - 0.02, z]} castShadow>
          <cylinderGeometry args={[0.025, 0.025, 0.07, 10]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
}
