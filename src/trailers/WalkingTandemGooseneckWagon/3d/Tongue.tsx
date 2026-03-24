export function Tongue({ position }: { position: [number, number, number] }) {
  const tongueLength = 3.5;
  const spread = 1.0;
const tongueEndZ = -tongueLength +0.02;

  return (
    <group position={position} name="Trailer Tongue Assembly">
      {/* A-Frame Left Beam */}
      <mesh position={[-spread / 2, -0.1, -tongueLength / 2]} rotation={[0, -Math.atan2(spread, tongueLength), 0]} name="Tongue Left Beam">
        <boxGeometry args={[0.15, 0.15, Math.sqrt(tongueLength ** 2 + spread ** 2)]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* A-Frame Right Beam */}
      <mesh position={[spread / 2, -0.1, -tongueLength / 2]} rotation={[0, Math.atan2(spread, tongueLength), 0]} name="Tongue Right Beam">
        <boxGeometry args={[0.15, 0.15, Math.sqrt(tongueLength ** 2 + spread ** 2)]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Cross Brace */}
      <mesh position={[0, -0.1, -tongueLength / 2]} name="Tongue Cross Brace">
        <boxGeometry args={[spread * 0.85, 0.15, 0.15]} />
        <meshStandardMaterial color="#111" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Hitch clevis at the front */}
      <mesh position={[0, -0.09, tongueEndZ - 0.15]} rotation={[Math.PI / 2, 0, 0]} name="Hitch Clevis">
          <torusGeometry args={[0.12, 0.032, 16, 32]} />
          <meshStandardMaterial color="#555" metalness={0.9} roughness={0.2} />
        </mesh>
    </group>
  );
}
