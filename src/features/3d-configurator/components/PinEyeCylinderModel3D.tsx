import { DoubleSide, MeshStandardMaterial, Vector3 } from 'three';
import { CylinderConfiguration, DimensionalSpecs, ValidationResult } from '../types/cylinder';
import { Line, Html } from '@react-three/drei';

interface Props {
  config: CylinderConfiguration;
  dimensions: DimensionalSpecs;
  partErrors: ValidationResult['partErrors'];
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

const CrossTubeEnd = ({ color = "#333", width = 2.3, scaleFactor = 1 }) => {
  const outerRad = 0.95 * scaleFactor;
  const innerRad = 0.6 * scaleFactor;
  const actualWidth = width * scaleFactor;
  const halfWidth = actualWidth / 2;

  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh castShadow>
        <cylinderGeometry args={[outerRad, outerRad, actualWidth, 40, 1, true]} />
        <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} side={DoubleSide} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[innerRad, innerRad, actualWidth + 0.05, 40, 1, true]} />
        <meshStandardMaterial color="#111" metalness={0.9} roughness={0.1} side={DoubleSide} />
      </mesh>
      {[halfWidth, -halfWidth].map((yPos, i) => (
        <mesh key={i} position={[0, yPos, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[innerRad, outerRad, 40]} />
          <meshStandardMaterial color={color} metalness={0.8} roughness={0.2} side={DoubleSide} />
        </mesh>
      ))}
    </group>
  );
};

// --- MASTER ASSEMBLY ---

export default function PinEyeCylinderModel3D({ config, dimensions, showDimensions }: Props) {
  const scale = 0.4;
  const outerR = (dimensions.barrelDiameter / 2) * scale;
  const rodR = (config.rodDiameter / 2) * scale;
  
  const isStainless = config.rodMaterial?.includes('stainless');

  const bodyMaterial = new MeshStandardMaterial({
    color: '#03091b', 
    metalness: 0.5,
    roughness: 0.4,
    side: DoubleSide
  });

  const rodMaterial = new MeshStandardMaterial({
    color: isStainless ? '#cbd5e1' : '#f8fafc',
    metalness: 1.0,
    roughness: 0.05,
  });

  const visualBarrelLength = dimensions.retractedLength * scale;
  const extension = (config.stroke * 0.25) * scale; 

  // --- OVERLAP & ROD CALCS ---
  // The hole is centered at the "end of the stroke" (0,0,0 of the rod group)
  // We extend the rod slightly past the hole for a clean look
  const rodEndBuffer = 0.3; 
  const rodLength = visualBarrelLength + extension + rodEndBuffer;

  const baseClevisScale = outerR * 1.5;

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      
      {/* 1. BARREL & BASE (CLEVIS) */}
      <group position={[-visualBarrelLength / 2, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow material={bodyMaterial}>
          <cylinderGeometry args={[outerR, outerR, visualBarrelLength, 32]} />
        </mesh>

         <group position={[-visualBarrelLength / 2 - 0.5, 0, 0]} rotation={[0, Math.PI, 0]}>
           <CrossTubeEnd scaleFactor={baseClevisScale}  />
        </group>

        {/* Head Gland */}
        <mesh position={[visualBarrelLength / 2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[outerR * 1.1, outerR * 1.1, 0.5, 40]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      </group>

      {/* 2. PISTON ROD WITH THROUGH-HOLE */}
      <group position={[(visualBarrelLength / 2) + extension, 0, 0]}>
        
        {/* THE HOLE: Visualized as a black void cylinder through the rod */}
        <mesh rotation={[Math.PI / 2, 0, 0] } position={[-1, 0, 0]}>
          <cylinderGeometry args={[rodR * 0.5, rodR * 0.5, rodR * 2.2, 32]} />
         <meshStandardMaterial 
            color={isStainless ? '#11325b' : '#0b1c2e'} 
            metalness={1} 
            roughness={0.05}
          />
        </mesh>

        {/* THE ROD: Positioned to overlap and extend slightly past the hole */}
        <mesh 
          position={[-(rodLength / 2) + rodEndBuffer, 0, 0]} 
          rotation={[0, 0, Math.PI / 2]} 
          castShadow
          material={rodMaterial}
        >
          <cylinderGeometry args={[rodR, rodR, rodLength, 32]} />
        </mesh>
      </group>

      {/* 3. MEASUREMENTS */}
      {showDimensions && (
        <>
          <CADMeasurement
            start={[-visualBarrelLength , 0, 0]}
            end={[(visualBarrelLength / 2) + extension, 0, 0]}
            label={`RETRACTED: ${dimensions.retractedLength.toFixed(2)}"`}
            offset={-outerR - 4}
            showDimensions={showDimensions ?? false}
          />

          <CADMeasurement
            start={[0, 0, 0]}
            end={[(visualBarrelLength / 2) + extension, 0, 0]}
            label={`STROKE: ${config.stroke.toFixed(2)}"`}
            offset={rodR + 3}
            showDimensions={showDimensions ?? false}
          />

          <CADMeasurement
            start={[0, -outerR, 0]}
            end={[0, outerR, 0]}
            label={`BORE: ${config.bore.toFixed(2)}"`}
            offset={outerR + 3}
            axis="z"
            showDimensions={showDimensions ?? false}
          />

          <CADMeasurement
            start={[(visualBarrelLength / 2) + extension - 1, -rodR, 0]}
            end={[(visualBarrelLength / 2) + extension - 1, rodR, 0]}
            label={`ROD DIA: ${config.rodDiameter.toFixed(2)}"`}
            offset={rodR + 3}
            axis="z"
            showDimensions={showDimensions ?? false}
          />
        </>
      )}
    </group>
  );
}