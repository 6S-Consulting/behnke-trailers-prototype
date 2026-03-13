import { DoubleSide, MeshStandardMaterial, Vector3 } from 'three';
import { CylinderConfiguration, DimensionalSpecs, ValidationResult } from '../types/cylinder';
import { Line, Html } from '@react-three/drei';
import * as THREE from 'three';
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

const RoundedSquareCap = ({ size, thickness, color = "#1a1a1a" }: { size: number, thickness: number, color?: string }) => {
  const radius = size * 0.15; // Corner roundness (Reference L)
  const s = size / 2;
  
  const shape = new THREE.Shape();
  shape.moveTo(-s + radius, -s);
  shape.lineTo(s - radius, -s);
  shape.absarc(s - radius, -s + radius, radius, -Math.PI / 2, 0, false);
  shape.lineTo(s, s - radius);
  shape.absarc(s - radius, s - radius, radius, 0, Math.PI / 2, false);
  shape.lineTo(-s + radius, s);
  shape.absarc(-s + radius, s - radius, radius, Math.PI / 2, Math.PI, false);
  shape.lineTo(-s, -s + radius);
  shape.absarc(-s + radius, -s + radius, radius, Math.PI, Math.PI * 1.5, false);

  return (
    <mesh rotation={[0, Math.PI / 2, 0]} castShadow>
      <extrudeGeometry args={[shape, { depth: thickness, bevelEnabled: false }]} />
      <meshStandardMaterial color={color} metalness={0.6} roughness={0.4} />
    </mesh>
  );
};

const ClevisMount = ({ scaleFactor = 1, material }: { scaleFactor?: number, material: MeshStandardMaterial }) => {
  const plateWidth = 0.8 * scaleFactor;
  const plateHeight = 0.75 * scaleFactor;
  const plateThickness = 0.15 * scaleFactor;
  const plateGap = 0.35 * scaleFactor; 
  
  return (
    <group>
      {/* SHIFTED PLATES: 
          Moving by (plateWidth / 2) aligns the BACK edge of the plate to x=0.
      */}
      {[-plateGap, plateGap].map((z, i) => (
        <mesh key={i} position={[plateWidth / 2, 0, z]} castShadow material={material}>
          <boxGeometry args={[plateWidth, plateHeight, plateThickness]} />
        </mesh>
      ))}

      {/* Pin (Reference M) positioned at the front-end of the plates */}
      <mesh position={[plateWidth * 0.7, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.18 * scaleFactor, 0.18 * scaleFactor, plateGap * 3, 20]} />
        <meshStandardMaterial color="#cbd5e1" metalness={1} roughness={0.1} />
      </mesh>
    </group>
  );
};

const TieRodAssembly = ({ length, radius, offset }: { length: number, radius: number, offset: number }) => {
  const corners: [number, number, number][] = [
    [0, offset, offset], [0, offset, -offset],
    [0, -offset, offset], [0, -offset, -offset]
  ];

  return (
    <group>
      {corners.map((pos, i) => (
        <group key={i} position={pos}>
          <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
            <cylinderGeometry args={[radius, radius, length, 16]} />
            <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.2} />
          </mesh>
          {[length / 2, -length / 2].map((x, j) => (
            <mesh key={j} position={[x, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[radius * 1.8, radius * 1.8, 0.12, 6]} />
              <meshStandardMaterial color="#64748b" metalness={1} roughness={0.2} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

// --- MASTER ASSEMBLY ---
export default function TieRodCylinderModel3D({ config, dimensions, showDimensions }: Props) {
  const scale = 0.4;
  
  const boreScale = config.bore / 2.5;
  const barrelRadius = (dimensions.barrelDiameter / 2) * scale;
  const rodRadius = (config.rodDiameter / 2) * scale;
  
  // 1. CONFIGURATION-DRIVEN MATERIALS
  const isStainless = config.rodMaterial?.includes('stainless');

  const bodyMaterial = new MeshStandardMaterial({
    color: '#0f172a',
    metalness: 0.6,
    roughness: 0.3,
    side: DoubleSide
  });

  const rodMaterial = new MeshStandardMaterial({
    color: isStainless ? '#cbd5e1' : '#f8fafc',
    metalness: 1.0,
    roughness: config.rodFinish === 'hard-chrome' ? 0.01 : 0.05,
  });

  const capSize = (barrelRadius * 2.2); 
  const capThickness = 0.6;
  const tieRodRadius = 0.05 * boreScale;
  const tieRodOffset = (capSize / 2) * 0.78;

  const visualBarrelLength = dimensions.retractedLength * scale;
  const extension = (config.stroke * 0.25) * scale; 

  // FIX: Increase rod length slightly (added 0.5) to ensure it penetrates the mount
  const overlapBuffer = 0.6; 
  const rodLength = (visualBarrelLength + extension) + overlapBuffer;

  // Pin offsets for measurement and placement
  const baseClevisScale = boreScale * 1.3;
  const rodClevisScale = rodRadius * 5;
  const basePinX = (0.8 * baseClevisScale) * 0.7; // X position of the pin relative to mount base

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      
      {/* 1. BARREL ASSEMBLY */}
      <group position={[-visualBarrelLength / 2, 0, 0]}>
        <mesh rotation={[0, 0, Math.PI / 2]} castShadow material={bodyMaterial}>
          <cylinderGeometry args={[barrelRadius, barrelRadius, visualBarrelLength, 32]} />
        </mesh>

        {/* Base End */}
        <group position={[-visualBarrelLength / 2 - capThickness, 0, 0]}>
          <RoundedSquareCap size={capSize} thickness={capThickness} />
          <group position={[0, 0, 0]} rotation={[0, 0, Math.PI]}>
            <ClevisMount scaleFactor={baseClevisScale} material={bodyMaterial} />
          </group>
        </group>

        {/* Head End */}
        <group position={[visualBarrelLength / 2, 0, 0]}>
          <RoundedSquareCap size={capSize} thickness={capThickness} />
          <mesh position={[0, capSize / 2 + 0.1, 0]}>
            <cylinderGeometry args={[0.15, 0.15, 0.25, 16]} />
            <meshStandardMaterial color="#333" />
          </mesh>
        </group>

        <TieRodAssembly 
          length={visualBarrelLength + (capThickness * 2) + 0.1} 
          radius={tieRodRadius} 
          offset={tieRodOffset} 
        />
      </group>

      {/* 2. PISTON ROD ASSEMBLY (GAP ELIMINATED) */}
      <group position={[(visualBarrelLength / 2) + capThickness + extension, 0, 0]}>
        
        {/* The Clevis Mount stays at the exact extension point */}
        <group position={[0, 0, 0]}>
           <ClevisMount scaleFactor={rodClevisScale} material={bodyMaterial} />
        </group>

        {/* FIX: The rod is shifted forward by the 'overlapBuffer'.
          This forces the tip of the rod to sit INSIDE the clevis plates, 
          guaranteeing there is no visible daylight.
        */}
        <mesh 
          position={[-(rodLength / 2) + overlapBuffer, 0, 0]} 
          rotation={[0, 0, Math.PI / 2]} 
          castShadow
          material={rodMaterial}
        >
          <cylinderGeometry args={[rodRadius, rodRadius, rodLength, 32]} />
        </mesh>
      </group>

      {/* 3. MEASUREMENTS */}
      {showDimensions && (
        <>
          <CADMeasurement
            start={[-visualBarrelLength  - basePinX, 0, 0]}
            end={[(visualBarrelLength / 2) + capThickness + extension + (0.8 * rodClevisScale * 0.7), 0, 0]}
            label={`RETRACTED: ${dimensions.retractedLength.toFixed(2)}"`}
            offset={-barrelRadius - 4}
            showDimensions={showDimensions ?? false}
          />

          <CADMeasurement
            start={[0, 0, 0]}
            end={[(visualBarrelLength / 2) + capThickness + extension, 0, 0]}
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
            start={[(visualBarrelLength / 2) + capThickness + extension / 2, -rodRadius, 0]}
            end={[(visualBarrelLength / 2) + capThickness + extension / 2, rodRadius, 0]}
            label={`ROD DIA: ${config.rodDiameter.toFixed(2)}"`}
            offset={rodRadius + 3}
            axis="z"
            showDimensions={showDimensions ?? false}
          />
        </>
      )}
    </group>
  );
}