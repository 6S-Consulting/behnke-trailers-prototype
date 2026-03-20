export function TrailerAccessories() {
  const frameWidth = 2.0;
  const trailerLength = 7.2;
  const frontStartX = -trailerLength / 2;

  return (
    <group>
      {/* Hose reel - front mounted on the fixed deck section */}
      <group position={[frontStartX + 0.7, 0.45, 0]}>
        {/* Support frame */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.1, 0.35, 0.5]} />
          <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
        </mesh>
        {/* Spool drum */}
        <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.14, 0.14, 0.4, 24]} />
          <meshStandardMaterial color="#2855a0" metalness={0.7} roughness={0.4} />
        </mesh>
        {/* Spool flanges */}
        {[-0.22, 0.22].map((z, i) => (
          <mesh key={i} position={[0, 0, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.2, 0.2, 0.015, 24]} />
            <meshStandardMaterial color="#2855a0" metalness={0.75} roughness={0.35} />
          </mesh>
        ))}
        {/* Hose coils */}
        {[0.14, 0.16, 0.18].map((r, i) => (
          <mesh key={`hose-${i}`} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r, 0.012, 8, 32]} />
            <meshStandardMaterial color="#222" roughness={0.9} metalness={0.05} />
          </mesh>
        ))}
        {/* Support legs */}
        {[-0.22, 0.22].map((z, i) => (
          <mesh key={`leg-${i}`} position={[0, -0.2, z]} castShadow>
            <boxGeometry args={[0.05, 0.3, 0.05]} />
            <meshStandardMaterial color="#1a1a1e" metalness={0.8} roughness={0.35} />
          </mesh>
        ))}
      </group>

      {/* Toolbox - mounted on the fixed front section, near the wheels */}
      <group position={[frontStartX + 1.1, 0.4, frameWidth / 2 + 0.2]}>
        {/* Box body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 0.35, 0.35]} />
          <meshStandardMaterial color="#222226" metalness={0.75} roughness={0.4} />
        </mesh>
        {/* Lid */}
        <mesh position={[0, 0.19, 0]} castShadow>
          <boxGeometry args={[0.62, 0.03, 0.37]} />
          <meshStandardMaterial color="#2a2a2e" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Latch */}
        <mesh position={[0, 0.05, -0.18]} castShadow>
          <boxGeometry args={[0.06, 0.04, 0.01]} />
          <meshStandardMaterial color="#888" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>

      {/* Reflective safety strips along both side rails */}
      {Array.from({ length: 12 }, (_, i) => {
        const x = frontStartX + 0.3 + i * 0.55;
        const isRed = i % 2 === 0;
        const color = isRed ? '#cc2222' : '#dddddd';
        return (
          <group key={`strip-${i}`}>
            {[-frameWidth / 2 - 0.03, frameWidth / 2 + 0.03].map((z, j) => (
              <mesh key={`s-${i}-${j}`} position={[x, 0.16, z]}>
                <boxGeometry args={[0.2, 0.03, 0.005]} />
                <meshStandardMaterial
                  color={color}
                  emissive={color}
                  emissiveIntensity={0.3}
                  metalness={0.3}
                  roughness={0.5}
                />
              </mesh>
            ))}
          </group>
        );
      })}

      {/* Side marker lights */}
      {[-2.5, -0.5, 1.5, 3.0].map((x, i) => (
        <group key={`marker-${i}`}>
          {[-frameWidth / 2 - 0.03, frameWidth / 2 + 0.03].map((z, j) => (
            <mesh key={`m-${i}-${j}`} position={[x, 0.2, z]}>
              <boxGeometry args={[0.04, 0.03, 0.01]} />
              <meshStandardMaterial
                color={i < 2 ? '#cc8800' : '#cc1111'}
                emissive={i < 2 ? '#cc8800' : '#cc1111'}
                emissiveIntensity={0.4}
              />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
