import * as THREE from 'three';
import { DoubleSide, MeshStandardMaterial, Vector3 } from 'three';
import { CylinderConfiguration, DimensionalSpecs } from '../types/cylinder';
import { Line, Html } from '@react-three/drei';

// --- REFINED SUB-COMPONENTS ---

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

/**
 * FORGED TANG BASE (Matches image_db73c7 and image_e5dcd7)
 * A solid, tapered forged mount for the barrel end.
 */
const ForgedTangBase = ({ radius, thickness, color = "#000000", isStainless }: { radius: number, thickness: number, color?: string, isStainless: boolean }) => {
  const eyeRadius = radius * 1.2;
  const bearingHoleRad = radius * 0.6;
  const neckWidth = radius * 1.8; // The "Base" width that meets the barrel
  const totalLength = radius * 4;

  // Create the solid side profile shape
  const tangShape = new THREE.Shape();
  tangShape.moveTo(0, -neckWidth / 2);
  tangShape.lineTo(totalLength * 0.45, -eyeRadius);
  tangShape.absarc(totalLength * 0.45, 0, eyeRadius, -Math.PI / 2, Math.PI / 2, false);
  tangShape.lineTo(0, neckWidth / 2);
  tangShape.lineTo(0, -neckWidth / 2);

  return (
    <group>
      {/* 1. SOLID EXTRUDED BODY */}
      <group rotation={[0, 0, 0]} position={[0, 0, -0.8]}>
        <mesh castShadow>
          <extrudeGeometry args={[tangShape, { 
            depth: thickness, 
            bevelEnabled: true, 
            bevelThickness: 0.04, 
            bevelSize: 0.04 
          }]} />
          <meshStandardMaterial color={color} metalness={0.6} roughness={0.3} />
        </mesh>
      </group>

      {/* 2. THE HOLE (Dark inner to look solid) */}
      <group position={[totalLength * 0.45, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[bearingHoleRad , bearingHoleRad, thickness + 0.2, 32]} />
        <meshStandardMaterial 
            color={isStainless ? '#679ee1' : '#84b7ee'} 
            metalness={1} 
            roughness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
};

const CrossTubeEnd = ({ radius, tubeWidth, color = "#0a0a0b" }: { radius: number, tubeWidth: number, color?: string }) => {
  const tubeOuterRad = radius * 1.1;

  return (
    <group rotation={[Math.PI / 2, 0, 0]} position={[0.2,0,0]}>
      <mesh castShadow>
        <cylinderGeometry args={[tubeOuterRad, tubeOuterRad, tubeWidth + 0.5, 48, 1, true]} />
        <meshStandardMaterial color={color} metalness={0.7} roughness={0.2} side={DoubleSide} />
      </mesh>
      
    </group>
  );
};

// --- MASTER ASSEMBLY ---

export default function TelescopicTangCrossModel3D({ config, dimensions, showDimensions }: { config: CylinderConfiguration, dimensions: DimensionalSpecs, showDimensions?: boolean }) {
  const scale = 0.4;
  const mainOuterR = (dimensions.barrelDiameter / 2) * scale;
  const stage1R = mainOuterR * 0.85;
  const stage2R = mainOuterR * 0.72;
  const finalRodR = (config.rodDiameter / 2) * scale;

  const isStainless = config.rodMaterial?.includes('stainless');

  const bodyColor = "#0a0a0b";
  const stageMaterial = new MeshStandardMaterial({ color: '#cbd5e1', metalness: 1.0, roughness: 0.05 });

  const collapsedL = dimensions.retractedLength * scale;
  const totalStroke = (config.stroke * 0.25) * scale;
  const extPerStage = totalStroke / 3;

  return (
    <group rotation={[0, Math.PI / 2, 0]}>
      
      {/* 1. FORGED TANG BASE & BARREL */}
      <group position={[-collapsedL / 2, 0, 0]}>
        {/* Base Mount positioned with no gap against the barrel */}
        <group rotation={[0, Math.PI, 0]} position={[0.1, 0, 0]}>
          <ForgedTangBase radius={mainOuterR} thickness={mainOuterR * 1.9} color={bodyColor} isStainless={isStainless} />
        </group>
        
        {/* Main Barrel */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[collapsedL / 2, 0, 0]}>
          <cylinderGeometry args={[mainOuterR, mainOuterR, collapsedL, 50]} />
          <meshStandardMaterial color={bodyColor} metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* 2. TELESCOPIC STAGES */}
      <group position={[(-collapsedL / 2) + collapsedL + extPerStage, 0, 0]}>
        {/* Stages (Sleeves) */}
        <mesh rotation={[0, 0, Math.PI / 2]} position={[-collapsedL / 2, 0, 0]} material={stageMaterial}>
          <cylinderGeometry args={[stage1R, stage1R, collapsedL, 40]} />
        </mesh>

        <group position={[extPerStage, 0, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-collapsedL / 2, 0, 0]} material={stageMaterial}>
            <cylinderGeometry args={[stage2R, stage2R, collapsedL, 40]} />
          </mesh>

          {/* Final Rod with Cross Tube */}
          <group position={[extPerStage, 0, 0]}>
            <mesh rotation={[0, 0, Math.PI / 2]} position={[-collapsedL / 2, 0, 0]} material={stageMaterial}>
              <cylinderGeometry args={[finalRodR, finalRodR, collapsedL, 40]} />
            </mesh>
            
            <group position={[0, 0, 0]}>
              <CrossTubeEnd radius={finalRodR} tubeWidth={mainOuterR * 2.2} color={bodyColor} />
            </group>
          </group>
        </group>

      </group>
    {/* 3. MEASUREMENTS */}
      {showDimensions && (
        <>
          <CADMeasurement
            start={[-collapsedL / 2, 0, 0]}
            end={[collapsedL / 2 + totalStroke, 0, 0]}
            label={`RETRACTED: ${dimensions.retractedLength.toFixed(2)}"`}
            offset={-mainOuterR - 4}
            showDimensions={showDimensions ?? false}
          />

          <CADMeasurement
            start={[0, 0, 0]}
            end={[collapsedL / 2 + totalStroke, 0, 0]}
            label={`STROKE: ${config.stroke.toFixed(2)}"`}
            offset={finalRodR + 3}
            showDimensions={showDimensions ?? false}
          />

          <CADMeasurement
            start={[0, -mainOuterR, 0]}
            end={[0, mainOuterR, 0]}
            label={`BORE: ${config.bore.toFixed(2)}"`}
            offset={mainOuterR + 3}
            axis="z"
            showDimensions={showDimensions ?? false}
          />

          <CADMeasurement
            start={[(collapsedL / 2 + totalStroke) / 2, -finalRodR, 0]}
            end={[(collapsedL / 2 + totalStroke) / 2, finalRodR, 0]}
            label={`ROD DIA: ${config.rodDiameter.toFixed(2)}"`}
            offset={finalRodR + 3}
            axis="z"
            showDimensions={showDimensions ?? false}
          />
        </>
      )}
    </group>
  );
}