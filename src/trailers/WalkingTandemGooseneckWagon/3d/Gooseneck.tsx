export function Gooseneck({ position }: { position: [number, number, number] }) {
  const width = 1.6;
  const height = 1.5;
  const forwardExt = 2.0;

  return (
    <group position={position}>
      {/* Upward Beams */}
      <mesh position={[-width / 2 + 0.1, height / 2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, height, 0.2]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[width / 2 - 0.1, height / 2, 0]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, height, 0.2]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Horizontal Forward Section */}
      <mesh position={[-width / 2 + 0.1, height + 0.1, -forwardExt / 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, forwardExt]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[width / 2 - 0.1, height + 0.1, -forwardExt / 2]} rotation={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, forwardExt]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Front Crossbeam */}
      <mesh position={[0, height + 0.1, -forwardExt]} rotation={[0, 0, 0]}>
        <boxGeometry args={[width, 0.2, 0.2]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Dropdown to Hitch */}
      <mesh position={[0, height / 2, -forwardExt - 0.1]}>
        <cylinderGeometry args={[0.15, 0.15, height, 16]} />
        <meshStandardMaterial color="#2d2d2d" metalness={0.8} roughness={0.4} />
      </mesh>

      {/* Hitch sphere */}
      <mesh position={[0, -0.1, -forwardExt - 0.1]}>
        <sphereGeometry args={[0.15, 16, 16]} />
        <meshStandardMaterial color="#bbbbbb" metalness={1.0} roughness={0.2} />
      </mesh>
    </group>
  );
}
