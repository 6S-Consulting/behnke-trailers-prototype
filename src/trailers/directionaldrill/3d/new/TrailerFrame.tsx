const steelColor = '#1a1a1e';
const steelMetal = 0.85;
const steelRough = 0.35;

export function TrailerFrame() {
  const trailerLength = 7.2;
  const frameWidth = 2.0;
  const beamHeight = 0.18;
  const fixedFrontLength = 1.4;
  const frontStartX = -trailerLength / 2;
  const pivotX = frontStartX + fixedFrontLength;

  return (
    <group position={[0, -0.1, 0]}>
      {/* Main chassis beams lowered below deck to avoid overlap with tilt bed */}
      {[-frameWidth / 2 + 0.05, frameWidth / 2 - 0.05].map((z, i) => (
        <group key={`beam-${i}`}>
          <mesh position={[0, 0, z]} castShadow receiveShadow>
            <boxGeometry args={[trailerLength, 0.04, 0.12]} />
            <meshStandardMaterial color={steelColor} metalness={steelMetal} roughness={steelRough} />
          </mesh>
          <mesh position={[0, beamHeight / 2, z]} castShadow receiveShadow>
            <boxGeometry args={[trailerLength, beamHeight, 0.04]} />
            <meshStandardMaterial color={steelColor} metalness={steelMetal} roughness={steelRough} />
          </mesh>
          <mesh position={[0, beamHeight, z]} castShadow receiveShadow>
            <boxGeometry args={[trailerLength, 0.04, 0.12]} />
            <meshStandardMaterial color={steelColor} metalness={steelMetal} roughness={steelRough} />
          </mesh>
        </group>
      ))}

      {/* Cross members */}
      {Array.from({ length: 15 }, (_, i) => -trailerLength / 2 + 0.55 + i * 0.45).map((x, i) => (
        <mesh key={`cross-${i}`} position={[x, beamHeight / 2, 0]} castShadow>
          <boxGeometry args={[0.05, 0.1, frameWidth - 0.1]} />
          <meshStandardMaterial color={steelColor} metalness={steelMetal} roughness={steelRough} />
        </mesh>
      ))}

      {/* Fixed front upper rails (only front 20% section) */}
      {[-frameWidth / 2, frameWidth / 2].map((z, i) => (
        <mesh key={`front-rail-${i}`} position={[frontStartX + fixedFrontLength / 2, beamHeight + 0.11, z]} castShadow>
          <boxGeometry args={[fixedFrontLength, 0.06, 0.05]} />
          <meshStandardMaterial color={steelColor} metalness={steelMetal} roughness={steelRough} />
        </mesh>
      ))}

      {/* Pivot brackets at center joint */}
      {[-0.75, 0.75].map((z, i) => (
        <mesh key={`pivot-bracket-${i}`} position={[pivotX - 0.03, 0.12, z]} castShadow>
          <boxGeometry args={[0.08, 0.2, 0.08]} />
          <meshStandardMaterial color="#252529" metalness={0.88} roughness={0.28} />
        </mesh>
      ))}

      {/* A-frame hitch */}
      <group position={[-trailerLength / 2, 0.08, 0]}>
        {[-1, 1].map((side, i) => {
          const startZ = side * (frameWidth / 2 - 0.05);
          const armLength = 1.6;
          const angle = Math.atan2(startZ, armLength) * -1;
          const hypot = Math.sqrt(armLength * armLength + startZ * startZ);
          return (
            <mesh key={`hitch-arm-${i}`} position={[-armLength / 2, 0.04, startZ / 2]} rotation={[0, angle, 0]} castShadow>
              <boxGeometry args={[hypot, 0.1, 0.1]} />
              <meshStandardMaterial color={steelColor} metalness={steelMetal} roughness={steelRough} />
            </mesh>
          );
        })}

        <mesh position={[-1.8, 0.04, 0]} castShadow>
          <boxGeometry args={[0.8, 0.1, 0.1]} />
          <meshStandardMaterial color={steelColor} metalness={steelMetal} roughness={steelRough} />
        </mesh>

        <mesh position={[-2.25, 0.04, 0]} castShadow>
          <boxGeometry args={[0.25, 0.12, 0.16]} />
          <meshStandardMaterial color="#333" metalness={0.9} roughness={0.2} />
        </mesh>
        <mesh position={[-2.25, 0.14, 0]} castShadow>
          <cylinderGeometry args={[0.05, 0.05, 0.1, 16]} />
          <meshStandardMaterial color="#444" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Safety chains */}
      {[-0.12, 0.12].map((z, i) => (
        <group key={`chain-${i}`} position={[-trailerLength / 2 - 1.9, -0.05, z]}>
          {Array.from({ length: 10 }, (_, j) => (
            <mesh key={j} position={[j * 0.04, Math.sin(j * 0.8) * 0.03 - 0.06, 0]} rotation={[0, 0, j * 0.2]}>
              <torusGeometry args={[0.012, 0.004, 6, 10]} />
              <meshStandardMaterial color="#555" metalness={0.9} roughness={0.3} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Jack stand */}
      <group position={[-trailerLength / 2 - 1.5, 0, 0]}>
        <mesh position={[0, -0.15, 0]} castShadow>
          <boxGeometry args={[0.08, 0.5, 0.08]} />
          <meshStandardMaterial color="#444" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.42, 0]} castShadow>
          <boxGeometry args={[0.06, 0.2, 0.06]} />
          <meshStandardMaterial color="#666" metalness={0.85} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.53, 0]} castShadow>
          <boxGeometry args={[0.12, 0.03, 0.12]} />
          <meshStandardMaterial color="#333" metalness={0.8} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
