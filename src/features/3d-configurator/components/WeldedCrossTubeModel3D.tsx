import { DoubleSide, Vector3 } from 'three';
import { Line, Html } from '@react-three/drei';
import { CylinderConfiguration, DimensionalSpecs, ValidationResult } from '../types/cylinder';

interface Props {
  config: CylinderConfiguration;
  dimensions: DimensionalSpecs;
  partErrors: ValidationResult['partErrors'];
  showDimensions?: boolean;
}

// --- 1. THE ACCURATE COMPONENT LIBRARY ---

const CrossTubeEnd = ({ color = "#333", width = 1.6, scaleFactor = 1 }) => {
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

const HydraulicPort = ({ position, boreSize }: { position: [number, number, number], boreSize: number }) => (
  <group position={position}>
    <mesh castShadow>
      <cylinderGeometry args={[0.25, 0.25, 0.3 + (boreSize * 0.05), 16]} />
      <meshStandardMaterial color="#333" metalness={0.8} roughness={0.2} />
    </mesh>
    <mesh position={[0, 0.16 + (boreSize * 0.025), 0]}>
      <cylinderGeometry args={[0.15, 0.15, 0.02, 16]} />
      <meshStandardMaterial color="#000" />
    </mesh>
  </group>
);

const GlandNut = ({ radius = 0.75 }) => (
  <mesh rotation={[0, 0, Math.PI / 2]}>
    <cylinderGeometry args={[radius + 0.1, radius + 0.1, 0.7, 32]} />
    <meshStandardMaterial color="#1a1a1a" metalness={1} roughness={0.2} />
  </mesh>
);

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

// --- 2. THE MASTER ASSEMBLY ---

export default function CylinderModel3D({ config, dimensions, partErrors, showDimensions }: Props) {
  const scale = 0.4;

  // Helpers to map UI strings to 3D properties
  const getRodMaterialProps = () => {
    // 1. Map Material Base Color
    let baseColor = '#f8fafc'; // Default Carbon Steel
    if (config.rodMaterial?.includes('stainless')) baseColor = '#e2e8f0';
    if (config.rodMaterial === '4140-alloy-steel') baseColor = '#94a3b8';

    // 2. Map Finish properties
    switch (config.rodFinish) {
      case 'hard-chrome':
        return { metalness: 1, roughness: 0.02, color: '#ffffff' };
      case 'induction-hardened':
        return { metalness: 0.8, roughness: 0.2, color: baseColor };
      default: // standard chrome
        return { metalness: 1, roughness: 0.1, color: baseColor };
    }
  };

  const getBarrelProps = () => {
    switch (config.barrelFinish) {
      case 'honed':
        return { metalness: 0.9, roughness: 0.1 };
      case 'skived-burnished':
        return { metalness: 1, roughness: 0.05 };
      default: // polished/standard
        return { metalness: 0.8, roughness: 0.3 };
    }
  };

  const boreScale = config.bore / 2.5; 
  const barrelRadius = (dimensions.barrelDiameter / 2) * scale;
  const visualBarrelLength = dimensions.retractedLength * scale;
  const rodRadius = (config.rodDiameter / 2) * scale;
  const rodScale = config.rodDiameter / 1.25;
  const extension = (config.stroke * 0.25) * scale; 
  const rodLength = visualBarrelLength + 2;

  // Mount Factory for welded cross tube (trunnion)
  const renderMount = (isRod: boolean) => {
    const color = isRod ? "#444" : "#222";
    const currentScale = isRod ? rodScale : boreScale;
    const width = isRod ? 1.2 : 2;

    return <CrossTubeEnd color={color} width={width} scaleFactor={currentScale} />;
  };

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      
      {/* BARREL GROUP */}
      <group position={[-visualBarrelLength / 2, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow receiveShadow>
          <cylinderGeometry args={[barrelRadius, barrelRadius, visualBarrelLength, 32]} />
          <meshStandardMaterial 
            color={partErrors.barrel ? "#ff4444" : "#2a2a2a"} 
            {...getBarrelProps()}
          />
        </mesh>

        <group position={[visualBarrelLength / 2, 0, 0]}>
          <GlandNut radius={barrelRadius} />
        </group>

        <HydraulicPort 
          position={[-(visualBarrelLength/2 * 0.85), barrelRadius + 0.05, 0]} 
          boreSize={boreScale}
        />
        <HydraulicPort 
          position={[(visualBarrelLength/2 * 0.85), barrelRadius + 0.05, 0]} 
          boreSize={boreScale}
        />

        {/* BASE END MOUNT */}
        <group position={[-visualBarrelLength / 2 - (0.5 * boreScale), 0, 0]} rotation={[0, 0, Math.PI]}>
          {renderMount(false)}
        </group>
      </group>

      {/* ROD GROUP */}
      <group position={[(visualBarrelLength / 2) + extension, 0, 0]}>
        <group position={[0, 0, 0]}>
          {renderMount(true)}
        </group>

        <mesh 
          position={[-(rodLength / 2) - (0.95 * rodScale), 0, 0]} 
          rotation={[0, 0, Math.PI / 2]} 
          castShadow
        >
          <cylinderGeometry args={[rodRadius, rodRadius, rodLength, 32]} />
          <meshStandardMaterial {...getRodMaterialProps()} />
        </mesh>
      </group>

      {/* MEASUREMENTS */}
      <CADMeasurement
        start={[-visualBarrelLength  - (0.5 * boreScale), 0, 0]}
        end={[visualBarrelLength / 2 + extension, 0, 0]}
        label={`RETRACTED: ${dimensions.retractedLength.toFixed(2)}"`}
        offset={-barrelRadius - 4}
        showDimensions={showDimensions ?? false}
      />

      <CADMeasurement
        start={[0, 0, 0]}
        end={[visualBarrelLength / 2 + extension, 0, 0]}
        label={`STROKE: ${config.stroke.toFixed(2)}"`}
        offset={rodRadius + 3}
        showDimensions={showDimensions ?? false}
      />

      <CADMeasurement
        start={[0, -barrelRadius, 0]}
        end={[0, barrelRadius, 0]}
        label={`BORE: ${config.bore.toFixed(2)}"`}
        offset={barrelRadius + 3}
        axis="z"
        showDimensions={showDimensions ?? false}
      />

      <CADMeasurement
        start={[visualBarrelLength / 2 + extension / 2, -rodRadius, 0]}
        end={[visualBarrelLength / 2 + extension / 2, rodRadius, 0]}
        label={`ROD DIA: ${config.rodDiameter.toFixed(2)}"`}
        offset={rodRadius + 3}
        axis="z"
        showDimensions={showDimensions ?? false}
      />
    </group>
  );
}