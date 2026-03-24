import { Wheel } from './Wheel';

export function Axle({ position, type }: { position: [number, number, number], type: 'front' | 'rear' }) {
  // Widen axle slightly to mount the tandem hubs on the *outside* properly
  const axleWidth = 2.4;
  const hubOffset = axleWidth / 2 + 0.1;
  const wheelOffset = hubOffset + 0.45;
  const tandemGap = 1.9;

  if (type === 'rear') {
    return (
      <group position={position} name="Rear Tandem Axle Assembly">
        {/* Central main cross axle connecting the walking mechanisms */}
        <mesh position={[0, -0.1, 0]} rotation={[0, 0, Math.PI / 2]} name="Main Axle Beam">
          <cylinderGeometry args={[0.15, 0.15, axleWidth, 16]} />
          <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Left Walking Beam (Tandem mechanism) */}
        <group position={[-hubOffset, -0.1, 0]} name="Left Walking Beam">
          {/* Pivoting beam box */}
          <mesh rotation={[Math.PI / 2, 0, 0]} name="Beam Box">
            <boxGeometry args={[0.2, tandemGap + 0.3, 0.25]} />
            <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Front Left Hub/Spindle */}
          <mesh position={[0, 0, -tandemGap / 2]} rotation={[0, 0, Math.PI / 2]} name="Front Hub">
            <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
            <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Rear Left Hub/Spindle */}
          <mesh position={[0, 0, tandemGap / 2]} rotation={[0, 0, Math.PI / 2]} name="Rear Hub">
            <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
            <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>

        {/* Right Walking Beam (Tandem mechanism) */}
        <group position={[hubOffset, -0.1, 0]} name="Right Walking Beam">
          {/* Pivoting beam box */}
          <mesh rotation={[Math.PI / 2, 0, 0]} name="Beam Box">
            <boxGeometry args={[0.2, tandemGap + 0.3, 0.25]} />
            <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Front Right Hub/Spindle */}
          <mesh position={[0, 0, -tandemGap / 2]} rotation={[0, 0, Math.PI / 2]} name="Front Hub">
            <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
            <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
          </mesh>
          {/* Rear Right Hub/Spindle */}
          <mesh position={[0, 0, tandemGap / 2]} rotation={[0, 0, Math.PI / 2]} name="Rear Hub">
            <cylinderGeometry args={[0.12, 0.12, 0.4, 16]} />
            <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
          </mesh>
        </group>

        {/* Wheels Attached to Spindles */}
        <group name="Left Front Wheel"><Wheel position={[-wheelOffset, -0.1, -tandemGap / 2]} rotation={[0, 0, -Math.PI / 2]} /></group>
        <group name="Right Front Wheel"><Wheel position={[wheelOffset, -0.1, -tandemGap / 2]} rotation={[0, 0, Math.PI / 2]} /></group>
        <group name="Left Rear Wheel"><Wheel position={[-wheelOffset, -0.1, tandemGap / 2]} rotation={[0, 0, -Math.PI / 2]} /></group>
        <group name="Right Rear Wheel"><Wheel position={[wheelOffset, -0.1, tandemGap / 2]} rotation={[0, 0, Math.PI / 2]} /></group>
      </group>
    );
  }

  // FRONT AXLE (Single)
  return (
    <group position={position} name="Front Axle Assembly">
      {/* Front single axle tube */}
      <mesh position={[0, -0.1, -2.5]} rotation={[0, 0, Math.PI / 2]} name="Axle Tube">
        <cylinderGeometry args={[0.12, 0.12, axleWidth + 0.4, 16]} />
        <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Steering knuckle / Swivel Mounts */}
      <mesh position={[-wheelOffset + 0.2, -0.1, -2.5]} rotation={[0, 0, 0]} name="Left Steering Knuckle">
        <boxGeometry args={[0.25, 0.3, 0.25]} />
        <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
      </mesh>
      <mesh position={[wheelOffset - 0.2, -0.1, -2.5]} rotation={[0, 0, 0]} name="Right Steering Knuckle">
        <boxGeometry args={[0.25, 0.3, 0.25]} />
        <meshStandardMaterial color="#080808" metalness={0.7} roughness={0.2} />
      </mesh>

      {/* Wheels */}
      <group name="Left Front Wheel"><Wheel position={[-wheelOffset, -0.1, -2.5]} rotation={[0, 0, -Math.PI / 2]} /></group>
      <group name="Right Front Wheel"><Wheel position={[wheelOffset, -0.1, -2.5]} rotation={[0, 0, Math.PI / 2]} /></group>
    </group>
  );
}
