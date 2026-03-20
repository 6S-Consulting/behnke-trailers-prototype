function Wheel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      {/* Tire */}
      <mesh castShadow>
        <torusGeometry args={[0.24, 0.1, 18, 36]} />
        <meshStandardMaterial color="#1a1a1a" roughness={0.92} metalness={0.05} />
      </mesh>

      {/* Tire sidewalls */}
      {[-0.06, 0.06].map((z, i) => (
        <mesh key={`sw-${i}`} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.02, 32]} />
          <meshStandardMaterial color="#141414" roughness={0.9} metalness={0.04} />
        </mesh>
      ))}

      {/* Rim */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.15, 0.14, 24]} />
        <meshStandardMaterial color="#757575" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Hub */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.16, 16]} />
        <meshStandardMaterial color="#939393" metalness={0.95} roughness={0.15} />
      </mesh>

      {/* Lug nuts */}
      {Array.from({ length: 6 }, (_, i) => {
        const angle = (i / 6) * Math.PI * 2;
        return (
          <mesh
            key={i}
            position={[Math.cos(angle) * 0.095, Math.sin(angle) * 0.095, 0.08]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.01, 0.01, 0.02, 8]} />
            <meshStandardMaterial color="#a0a0a0" metalness={0.9} roughness={0.2} />
          </mesh>
        );
      })}
    </group>
  );
}

function Fender({ position, mirror = false }: { position: [number, number, number]; mirror?: boolean }) {
  const scaleZ = mirror ? -1 : 1;

  return (
    <group position={position} scale={[1, 1, scaleZ]}>
      <mesh position={[0, 0.13, 0]} castShadow>
        <boxGeometry args={[1.22, 0.04, 0.32]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0, 0.15]} castShadow>
        <boxGeometry args={[1.22, 0.24, 0.02]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[-0.61, 0.04, 0.07]} castShadow>
        <boxGeometry args={[0.02, 0.2, 0.18]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
      </mesh>
      <mesh position={[0.61, 0.04, 0.07]} castShadow>
        <boxGeometry args={[0.02, 0.2, 0.18]} />
        <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
      </mesh>
    </group>
  );
}

export function TrailerWheels() {
  const axleSpacing = 0.92;
  const axleCenterX = 1.72;
  const axleY = -0.2;
  const wheelZ = 1.13;

  return (
    <group>
      {[0, axleSpacing].map((offset, i) => (
        <group key={`axle-${i}`}>
          <mesh position={[axleCenterX + offset, axleY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.035, 0.035, wheelZ * 2 + 0.3, 12]} />
            <meshStandardMaterial color="#333" metalness={0.9} roughness={0.3} />
          </mesh>

          {[-0.5, 0.5].map((z, j) => (
            <group key={`spring-${i}-${j}`} position={[axleCenterX + offset, axleY + 0.1, z]}>
              {[0, 0.012, 0.024].map((dy, k) => (
                <mesh key={k} position={[0, dy, 0]} castShadow>
                  <boxGeometry args={[0.56 - k * 0.12, 0.01, 0.07]} />
                  <meshStandardMaterial color="#2a2a2a" metalness={0.85} roughness={0.3} />
                </mesh>
              ))}
            </group>
          ))}
        </group>
      ))}

      <Wheel position={[axleCenterX, axleY, -wheelZ]} />
      <Wheel position={[axleCenterX, axleY, wheelZ]} />
      <Wheel position={[axleCenterX + axleSpacing, axleY, -wheelZ]} />
      <Wheel position={[axleCenterX + axleSpacing, axleY, wheelZ]} />

      <Fender position={[axleCenterX + axleSpacing / 2, 0.2, -wheelZ + 0.02]} />
      <Fender position={[axleCenterX + axleSpacing / 2, 0.2, wheelZ - 0.02]} mirror />
    </group>
  );
}
