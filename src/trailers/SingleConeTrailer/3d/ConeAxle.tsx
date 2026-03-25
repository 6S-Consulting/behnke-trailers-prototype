import * as THREE from 'three';
import { Wheel } from '../../WalkingTandemGooseneckWagon/3d/Wheel';

const STEEL = { color: '#0a0a0a', metalness: 0.88, roughness: 0.22 } as const;
const STEEL_MID = { color: '#111', metalness: 0.85, roughness: 0.28 } as const;

import { HydraulicCylinder } from './HydraulicCylinder';

/**
 * Oriented beam between two 3D points.
 */
function BeamBetween({
  from, to, w = 0.07, h = 0.07,
}: {
  from: [number, number, number];
  to: [number, number, number];
  w?: number; h?: number;
}) {
  const vFrom = new THREE.Vector3(...from);
  const vTo = new THREE.Vector3(...to);
  const dir = new THREE.Vector3().subVectors(vTo, vFrom);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(vFrom, vTo).multiplyScalar(0.5);
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={quat} castShadow>
      <boxGeometry args={[w, len, h]} />
      <meshStandardMaterial {...STEEL_MID} />
    </mesh>
  );
}

/**
 * Single axle for the cone trailer, styled after the reference image.
 */
export function ConeAxle({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const axleWidth = 4.3;
  const wheelOffset = axleWidth / 2 + 0.18;

  // Bracket mounts at these X positions (inside the frame footprint ~±1.9)
  const bracketX = 1.9;

  // Frame base is at Y≈0.8 above the axle group origin.
  const bracketTopY = 0.82;   
  const bracketBottomY = 0.0; 

  // Trailing arm: runs from the front of the bracket down to the axle tube
  const armFrontZ = -0.55;  // front pivot
  const armRearZ  =  0.35;  // rear end at axle

  // Relative coordinates for frame landing points
  const frameFrontZ = -2.25; 
  const frameElevationY = 0.82;

  return (
    <group position={position}>

      {/* ── Main Axle Tube ── */}
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, axleWidth + 0.1, 32]} />
        <meshStandardMaterial {...STEEL} />
      </mesh>

      {/* ── Per-side mounting brackets ── */}
      {([-bracketX, bracketX] as number[]).map((x, side) => (
        <group key={`side-${side}`} position={[x, 0, 0]}>

          {/* Vertical bracket plate */}
          <mesh position={[0, bracketTopY / 2 - 0.1, armFrontZ]} castShadow>
            <boxGeometry args={[0.12, bracketTopY + 0.1, 0.08]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>

          {/* Top horizontal plate (bolts to frame sill) */}
          <mesh position={[0, bracketTopY - 0.04, armFrontZ + 0.15]} castShadow>
            <boxGeometry args={[0.22, 0.07, 0.4]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>

          {/* Bolt details on top plate */}
          {[-0.06, 0.06].map((bx, bi) => (
            <mesh key={bi} position={[bx, bracketTopY, armFrontZ + 0.22]} castShadow>
              <cylinderGeometry args={[0.012, 0.012, 0.04, 6]} />
              <meshStandardMaterial color="#bbb" metalness={0.95} roughness={0.1} />
            </mesh>
          ))}

          {/* Diagonal trailing arm (front pivot → axle) */}
          <BeamBetween
            from={[0, bracketTopY * 0.5, armFrontZ]}
            to={[0, bracketBottomY, armRearZ]}
            w={0.12} h={0.09}
          />
          <BeamBetween
            from={[0, bracketTopY * - 0.1, armFrontZ]}
            to={[0, bracketBottomY, armRearZ]}
            w={0.12} h={0.09}
          />

          {/* ── Hydraulic cylinder slanting forward to a raised frame bracket ── */}
          <group name="Hydraulic Cylinder">
            <HydraulicCylinder 
              from={[0, bracketTopY + 0.01, armFrontZ + 0.15]} 
              to={[0, frameElevationY + 0.462, frameFrontZ + 0.441]}
              barrelRadius={0.051}
              rodRadius={0.028}
            />
          </group>

          {/* Raised upright support bracket on the frame sill */}
          <group position={[0, frameElevationY, frameFrontZ ]} rotation={[Math.PI / 4, 0, 0]}>
            {/* Vertical upright plate */}
            <mesh position={[0, 0.3, 0]} 
castShadow>
              <boxGeometry args={[0.08, 0.7, 0.12]} />
              <meshStandardMaterial {...STEEL} />
            </mesh>
            {/* Clevis end for cylinder connector */}
            <mesh position={[0, 0.6, 0]} castShadow>
              <boxGeometry args={[0.12, 0.1, 0.08]} />
              <meshStandardMaterial color="#222" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>

        </group>
      ))}

      {/* ── Wheels ── */}
      <group name="Left Wheel">
        <Wheel position={[-wheelOffset, 0, 0]} rotation={[0, 0, -Math.PI / 2]} />
      </group>
      <group name="Right Wheel">
        <Wheel position={[ wheelOffset, 0, 0]} rotation={[0, 0,  Math.PI / 2]} />
      </group>
    </group>
  );
}
