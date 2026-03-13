import { DoubleSide } from 'three';
import { CylinderConfiguration, DimensionalSpecs } from '../types/cylinder';
import { Vector3 } from 'three';
import { Line, Html } from '@react-three/drei';

interface Props {
  config: CylinderConfiguration;
  dimensions: DimensionalSpecs;
  showDimensions?: boolean;
}

interface CADMeasurementProps {
    start: [number, number, number];
    end: [number, number, number];
    label: string;
    offset?: number;
    axis?: 'y' | 'z';
    showDimensions: boolean;
}

const CADMeasurement = ({ start, end, label, offset = 2, axis = 'y', showDimensions }: CADMeasurementProps) => {
    if (!showDimensions) return null;

    const startVec = new Vector3(...start);
    const endVec = new Vector3(...end);

    const offsetVec = new Vector3(0, 0, 0);
    offsetVec[axis] = offset;

    const dimStart = new Vector3().addVectors(startVec, offsetVec);
    const dimEnd = new Vector3().addVectors(endVec, offsetVec);

    const midPoint = new Vector3().addVectors(dimStart, dimEnd).multiplyScalar(0.5);

    return (
        <group>
            {/* Main Dimension Line */}
            <Line points={[dimStart, dimEnd]} color="#da789b" lineWidth={3} transparent opacity={0.8} />

            {/* Extension Lines */}
            <Line points={[startVec, dimStart]} color="#da789b" lineWidth={1} transparent opacity={0.4} />
            <Line points={[endVec, dimEnd]} color="#da789b" lineWidth={1} transparent opacity={0.4} />

            {/* Arrows/Ticks */}
            <mesh position={dimStart} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.15, 0.15, 0.15]} />
                <meshBasicMaterial color="#da789b" />
            </mesh>
            <mesh position={dimEnd} rotation={[0, 0, Math.PI / 4]}>
                <boxGeometry args={[0.15, 0.15, 0.15]} />
                <meshBasicMaterial color="#da789b" />
            </mesh>

            {/* Label */}
            <Html position={midPoint} center distanceFactor={15}>
                <div className="bg-black/90 px-2 py-1 rounded border border-[#da789b]/30 shadow-xl pointer-events-none">
                    <span className="text-[12px] font-black text-white whitespace-nowrap tracking-tighter">
                        {label}
                    </span>
                </div>
            </Html>
        </group>
    );
};

// --- SUB-COMPONENTS ---

const GreaseZerk = ({ position }: { position: [number, number, number] }) => (
  <group position={position}>
    <mesh castShadow>
      <cylinderGeometry args={[0.03, 0.05, 0.12, 12]} />
      <meshStandardMaterial color="#94a3b8" metalness={1} roughness={0.1} />
    </mesh>
    <mesh position={[0, 0.07, 0]}>
      <sphereGeometry args={[0.035, 8, 8]} />
      <meshStandardMaterial color="#94a3b8" metalness={1} />
    </mesh>
  </group>
);

const HollowTangMount = ({ radius, thickness, color = "#0f172a" }: { radius: number, thickness: number, color?: string }) => {
  const outerRad = radius * 0.95;
  const innerRad = radius * 0.59;
  // blockLength determines how far the block extends from the pin center back toward the barrel
  const blockLength = radius * 1.48;

  return (
    <group>
      {/* The Block: Extended toward the right (positive X) to meet the barrel weld */}
      <mesh position={[blockLength / 2 + 0.1, 0, 0]} castShadow>
        <boxGeometry args={[blockLength, radius * 1.9, thickness]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      
      {/* The Eyelet: Centered at [0,0,0] (the pin center) */}
      <group rotation={[Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[outerRad, outerRad, thickness, 48, 1, true]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} side={DoubleSide} />
        </mesh>
        <mesh>
          <cylinderGeometry args={[innerRad, innerRad, thickness + 0.05, 48, 1, true]} />
          <meshStandardMaterial color="#000" side={DoubleSide} />
        </mesh>
        {[thickness / 2, -thickness / 2].map((y, i) => (
          <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[innerRad, outerRad, 48]} />
            <meshStandardMaterial color={color} side={DoubleSide} />
          </mesh>
        ))}
      </group>
      <GreaseZerk position={[0, outerRad, 0]} />
    </group>
  );
};

const CrossTubeEnd = ({ color = "#0f172a", width = 1.6, scaleFactor = 1 }) => {
  const outerRad = 0.95 * scaleFactor;
  const innerRad = 0.6 * scaleFactor;
  const actualWidth = width * scaleFactor;

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[outerRad, outerRad, actualWidth, 48, 1, true]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[innerRad, innerRad, actualWidth + 0.05, 48, 1, true]} />
        <meshStandardMaterial color="#000" side={DoubleSide} />
      </mesh>
      {[actualWidth / 2, -actualWidth / 2].map((y, i) => (
        <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[innerRad, outerRad, 48]} />
          <meshStandardMaterial color={color} side={DoubleSide} />
        </mesh>
      ))}
      <GreaseZerk position={[0, outerRad, 0]} />
    </group>
  );
};

// --- MASTER ASSEMBLY ---

export default function WeldedTangCrossTubeModel3D({ config, dimensions, showDimensions }: Props) {
  const scale = 0.4;
  const outerR = (dimensions.barrelDiameter / 2) * scale;
  const rodR = (config.rodDiameter / 2) * scale;
  
  const baseTangWidth = outerR * 1.6;
  const strokeCrossTubeWidth = outerR * 1.1;

  // L is the Retracted Length (Pin center to Pin center)
  const L = dimensions.retractedLength * scale;
  const currentStroke = (config.stroke * 0.25) * scale; // Current extension

  // Distances to prevent overlap
  const tangOffset = outerR * 1.5; // distance from base pin to barrel start
  const rodEndOffset = rodR * 1.8; // distance from rod pin to rod end face
  const barrelLength = L - tangOffset - 0.5; // Barrel ends before reaching the head/gland

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      
      {/* 1. BASE PIN CENTER & TANG */}
      <group position={[-L / 2, 0, 0]} rotation={[Math.PI / 2,0,  0]}>
        <HollowTangMount radius={outerR * 1} thickness={baseTangWidth } />
      </group>

      {/* 2. BARREL ASSEMBLY */}
      {/* Positioned so the weld matches the Tang Block end */}
      <group position={[(-L / 2) + tangOffset, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} position={[barrelLength / 2, 0, 0]}>
          <cylinderGeometry args={[outerR, outerR, barrelLength, 50]} />
          <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.2} />
        </mesh>

        {/* Port Bosses */}
        <mesh position={[0.5, outerR, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 24]} />
          <meshStandardMaterial color="#020617" />
        </mesh>
        <mesh position={[barrelLength - 0.5, outerR, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.2, 24]} />
          <meshStandardMaterial color="#020617" />
        </mesh>

        {/* Head/Gland */}
        <mesh position={[barrelLength, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[outerR * 1.05, outerR * 1.05, 0.4, 40]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
      </group>

      {/* 3. ROD & STROKE PIN CENTER */}
      {/* Center of the CrossTube Pin is at L/2 + extension */}
      <group position={[L / 2 + currentStroke, 0, 0]}>
        <CrossTubeEnd color="#0f172a" scaleFactor={rodR * 1.8} width={strokeCrossTubeWidth / (rodR * 1.8)} />
        
        {/* Piston Rod: Extends from the pin back into the barrel */}
        <mesh 
          position={[-(L + currentStroke) / 2, 0, 0]} 
          rotation={[0, 0, Math.PI / 2]}
        >
          <cylinderGeometry args={[rodR, rodR, L + currentStroke - rodEndOffset, 40]} />
          <meshStandardMaterial color="#f8fafc" metalness={1} roughness={0.02} />
        </mesh>
      </group>

      {/* 4. MEASUREMENTS */}
      {showDimensions && (
        <>
          <CADMeasurement
            start={[-L / 2, -outerR, 0]}
            end={[L / 2 + currentStroke, -outerR, 0]}
            label={`RETRACTED: ${dimensions.retractedLength.toFixed(2)}"`}
            offset={-outerR - 4}
            showDimensions={showDimensions}
          />

          <CADMeasurement
            start={[(-L / 2) + tangOffset + barrelLength + 0.4, rodR, 0]}
            end={[L / 2 + currentStroke, rodR, 0]}
            label={`STROKE: ${config.stroke.toFixed(2)}"`}
            offset={rodR + 3}
            showDimensions={showDimensions}
          />

          <CADMeasurement
            start={[(-L / 2) + tangOffset + barrelLength / 2, -outerR, 0]}
            end={[(-L / 2) + tangOffset + barrelLength / 2, outerR, 0]}
            label={`BORE: ${config.bore.toFixed(2)}"`}
            offset={outerR + 3}
            axis="z"
            showDimensions={showDimensions}
          />

          <CADMeasurement
            start={[L / 2 + currentStroke - rodEndOffset / 2, -rodR, 0]}
            end={[L / 2 + currentStroke - rodEndOffset / 2, rodR, 0]}
            label={`ROD DIA: ${config.rodDiameter.toFixed(2)}"`}
            offset={rodR + 3}
            axis="z"
            showDimensions={showDimensions}
          />
        </>
      )}
    </group>
  );
}