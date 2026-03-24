import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Maximize2, X } from "lucide-react";

export type LengthOption = 4 | 6 | 8;
export type AxleRating = 8000 | 10000 | 12000;
export type DeckWood = "treated-pine" | "white-oak";
export type HitchType = "coupler" | "pintle";
export type TiltSide = "driver" | "passenger";
export type CameraView = "perspective" | "side" | "top";

type PartHoverFn = (name: string) => void;

export type TrailerViewerProps = {
  frontDeckLengthFt?: LengthOption;
  axleRating?: AxleRating;
  deckWood?: DeckWood;
  hitchType?: HitchType;
  isUnfolded?: boolean;
  cameraView?: CameraView;
  autoRotate?: boolean;
  showHoverLabels?: boolean;
};

type TrailerDimensions = {
  deckHeight: number;
  deckLength: number;
  frontDeckLength: number;
  tiltDeckWidth: number;
  stationaryDeckWidth: number;
  betweenFenders: number;
  lowerRailHeight: number;
  lowerRailWidth: number;
  upperRailSize: number;
  crossmemberDepth: number;
  plankThickness: number;
  axleSpacing: number;
  axleCenterZ: number;
  tireRadius: number;
  tireWidth: number;
  wheelTrackHalf: number;
  tongueLength: number;
  jackHeight: number;
};

const frameMaterial = new THREE.MeshStandardMaterial({
  color: "#111417",
  roughness: 0.34,
  metalness: 0.88,
});

const frameWearMaterial = new THREE.MeshStandardMaterial({
  color: "#222a31",
  roughness: 0.58,
  metalness: 0.76,
});

const rubberMaterial = new THREE.MeshStandardMaterial({
  color: "#0e0f11",
  roughness: 0.9,
  metalness: 0.07,
});

const rimMaterial = new THREE.MeshStandardMaterial({
  color: "#b8bfc8",
  roughness: 0.29,
  metalness: 0.91,
});

const ledMaterial = new THREE.MeshStandardMaterial({
  color: "#a00000",
  emissive: "#ff0000",
  emissiveIntensity: 1.2,
  roughness: 0.25,
  metalness: 0.12,
});

const reflectorRedMaterial = new THREE.MeshStandardMaterial({
  color: "#cb2d2d",
  roughness: 0.28,
  metalness: 0.18,
});

const reflectorWhiteMaterial = new THREE.MeshStandardMaterial({
  color: "#f1f3f5",
  roughness: 0.18,
  metalness: 0.2,
});

const deckStripeMaterial = new THREE.MeshStandardMaterial({
  color: "#25282e",
  roughness: 0.45,
  metalness: 0.62,
});

const blueReelMaterial = new THREE.MeshStandardMaterial({
  color: "#125bc9",
  roughness: 0.35,
  metalness: 0.54,
});

const hardwareSteelMaterial = new THREE.MeshStandardMaterial({
  color: "#1a1f25",
  roughness: 0.4,
  metalness: 0.82,
});

const chainMaterial = new THREE.MeshStandardMaterial({
  color: "#a8afb8",
  roughness: 0.2,
  metalness: 0.9,
});

const breakawayCableMaterial = new THREE.MeshStandardMaterial({
  color: "#1d62d1",
  emissive: "#0e3472",
  emissiveIntensity: 0.35,
  roughness: 0.44,
  metalness: 0.5,
});

const tailLightMaterial = new THREE.MeshStandardMaterial({
  color: "#600000",
  emissive: "#ff0000",
  emissiveIntensity: 2.2,
  roughness: 0.2,
  metalness: 0.1,
});

const tailLightBaseMaterial = new THREE.MeshStandardMaterial({
  color: "#0a0a0a",
  roughness: 0.35,
  metalness: 0.85,
});

const tailLightLensMaterial = new THREE.MeshStandardMaterial({
  color: "#400000",
  emissive: "#aa0000",
  emissiveIntensity: 1.5,
  roughness: 0.1,
  metalness: 0.1,
  transparent: true,
  opacity: 0.92,
});

function deriveDimensions(
  frontDeckLengthFt: LengthOption,
  axleRating: AxleRating,
  deckWood: DeckWood,
): TrailerDimensions {
  const frontDeckLength = frontDeckLengthFt * 12;
  // Reduced deck length by 20% as requested
  const deckLength = (30 * 12 * 0.8) + frontDeckLength;

  const tireData =
    axleRating === 8000
      ? { tireRadius: 14.2, tireWidth: 8.5 }
      : { tireRadius: 15.2, tireWidth: 9.2 };

  return {
    deckHeight: 34, // brochure says 34" unloaded height
    deckLength,
    frontDeckLength,
    tiltDeckWidth: 102, // full width deck over wheels
    stationaryDeckWidth: 0,
    betweenFenders: 102,
    lowerRailHeight: 4, // Reduced height
    lowerRailWidth: 2,
    upperRailSize: 2.5, // Reduced size (thinner/sharper)
    crossmemberDepth: 3,
    plankThickness: deckWood === "white-oak" ? 3.375 : 3.0,
    axleSpacing: 34, // Tightened axle spacing
    axleCenterZ: deckLength * 0.11, // Shift forward slightly towards the front of the trailer
    tireRadius: tireData.tireRadius,
    tireWidth: tireData.tireWidth,
    wheelTrackHalf: 48.5, // WHEEL END: pushed to the absolute widest left and right edges of 102" deck
    tongueLength: 72,
    jackHeight: 24,
  };
}

function useWoodPlankMaterials(deckWood: DeckWood) {
  return useMemo(() => {
    const tones =
      deckWood === "white-oak"
        ? ["#9d7849", "#946f41", "#8f6c3f", "#a38051", "#8b673b", "#99764a"]
        : ["#ad8551", "#a27a45", "#9c7440", "#b18d58", "#9a6f3f", "#a97f4d"];

    return tones.map(
      (color) =>
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.86,
          metalness: 0.04,
        }),
    );
  }, [deckWood]);
}

function CameraRig({
  cameraView,
  deckLength,
}: {
  cameraView: CameraView;
  deckLength: number;
}) {
  const { camera } = useThree();

  useEffect(() => {
    const base = Math.max(260, deckLength + 100);

    if (cameraView === "top") {
      camera.position.set(0, base * 2.0, 0.01);
      camera.up.set(0, 0, -1);
      camera.lookAt(0, 24, 0);
    } else if (cameraView === "side") {
      camera.position.set(base * 1.6, base * 0.3, 14);
      camera.up.set(0, 1, 0);
      camera.lookAt(0, 22, 0);
    } else {
      camera.position.set(base * 1.0, base * 0.5, base * 1.3);
      camera.up.set(0, 1, 0);
      camera.lookAt(-8, 21, 35);
    }

    camera.updateProjectionMatrix();
  }, [camera, cameraView, deckLength]);

  return null;
}

function SideReflectorStrip({
  x,
  y,
  zStart,
  zEnd,
  xOffset = 1,
  onPartHover,
  onPartLeave,
}: {
  x: number;
  y: number;
  zStart: number;
  zEnd: number;
  xOffset?: number;
  onPartHover?: PartHoverFn;
  onPartLeave?: () => void;
}) {
  const segLength = 8;
  const gap = 0.55;
  const total = zEnd - zStart;
  const count = Math.max(1, Math.floor(total / (segLength + gap)));

  return (
    <group>
      {Array.from({ length: count }).map((_, i) => {
        const z = zStart + i * (segLength + gap) + segLength / 2;
        const material =
          i % 2 === 0 ? reflectorWhiteMaterial : reflectorRedMaterial;
        return (
          <mesh
            key={i}
            position={[x, y, z]}
            material={material}
            onPointerOver={
              onPartHover
                ? (e) => {
                    e.stopPropagation();
                    onPartHover("Side Reflector Strip");
                  }
                : undefined
            }
            onPointerOut={onPartLeave}
          >
            <boxGeometry args={[0.22, 0.95, segLength]} />
          </mesh>
        );
      })}
    </group>
  );
}

function Wheel({
  tireRadius: originalTireRadius,
  tireWidth,
  onPartHover,
  onPartLeave,
}: {
  tireRadius: number;
  tireWidth: number;
  onPartHover?: PartHoverFn;
  onPartLeave?: () => void;
}) {
  const tireRadius = originalTireRadius - 0.7; // Reduced radius locally
  const hp = (name: string) =>
    onPartHover
      ? {
          onPointerOver: (e: { stopPropagation: () => void }) => {
            e.stopPropagation();
            onPartHover(name);
          },
          onPointerOut: onPartLeave,
        }
      : {};

  const shoulderRadius = 2.0;

  return (
    <group>
      {/* Tire main carcass */}
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={rubberMaterial}
        castShadow
        receiveShadow
        {...hp("Tire")}
      >
        <cylinderGeometry
          args={[
            tireRadius,
            tireRadius,
            tireWidth - shoulderRadius * 1.5,
            42,
            1,
          ]}
        />
      </mesh>

      {/* Tire shoulders (rounded edges) */}
      {[-(tireWidth / 2 - shoulderRadius / 2), tireWidth / 2 - shoulderRadius / 2].map(
        (offset, i) => (
          <mesh
            key={`shoulder-${i}`}
            position={[offset, 0, 0]}
            rotation={[0, Math.PI / 2, 0]}
            material={rubberMaterial}
            castShadow
          >
            <torusGeometry
              args={[tireRadius - shoulderRadius / 2, shoulderRadius / 2, 16, 42]}
            />
          </mesh>
        ),
      )}

      {/* Rim - Exterior deep dish section */}
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={rimMaterial}
        position={[tireWidth / 2 - 1.2, 0, 0]}
        castShadow
        {...hp("Rim")}
      >
        <cylinderGeometry args={[tireRadius * 0.58, tireRadius * 0.44, 2.4, 32, 1, true]} />
      </mesh>

      {/* Rim - Inner face/hub seat */}
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={rimMaterial}
        position={[tireWidth / 2 - 2.4, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[tireRadius * 0.44, tireRadius * 0.44, 0.4, 32]} />
      </mesh>

      {/* Rim - Backing interior section */}
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={rimMaterial}
        position={[-0.5, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[tireRadius * 0.6, tireRadius * 0.6, tireWidth - 1, 30]} />
      </mesh>

      {/* Heavy-duty steel hub center */}
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        position={[tireWidth / 2 + 0.1, 0, 0]}
        material={hardwareSteelMaterial}
        castShadow
        {...hp("Wheel Hub")}
      >
        <cylinderGeometry args={[2.8, 3.2, 1.4, 18]} />
      </mesh>

      {/* Hub Cover / Cap */}
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        position={[tireWidth / 2 + 0.8, 0, 0]}
        material={rimMaterial}
        castShadow
      >
        <cylinderGeometry args={[1.5, 1.5, 0.6, 18]} />
      </mesh>

      {/* Valve Stem (tiny detail) */}
      <mesh
        position={[tireWidth / 2 - 0.2, tireRadius * 0.42, 0]}
        rotation={[0, 0, Math.PI / 2]}
        material={hardwareSteelMaterial}
      >
        <cylinderGeometry args={[0.15, 0.15, 0.8, 8]} />
      </mesh>

      {/* 8 Lug Bolts circling the hub */}
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 8;
        const boltRadius = 2.15;
        return (
          <mesh
            key={i}
            rotation={[0, 0, Math.PI / 2]}
            position={[
              tireWidth / 2 - 0.5,
              Math.cos(angle) * boltRadius,
              Math.sin(angle) * boltRadius,
            ]}
            material={hardwareSteelMaterial}
            {...hp("Lug Bolt")}
          >
            <cylinderGeometry args={[0.22, 0.22, 0.6, 6]} />
          </mesh>
        );
      })}
    </group>
  );
}

function FrameAssembly({
  dims,
  isUnfolded,
  deckWood,
  hitchType,
  onPartHover,
  onPartLeave,
}: {
  dims: TrailerDimensions;
  isUnfolded: boolean;
  deckWood: DeckWood;
  hitchType: HitchType;
  onPartHover: PartHoverFn;
  onPartLeave: () => void;
}) {
  const deckHalfLen = dims.deckLength / 2;
  const leftEdge = -dims.betweenFenders / 2;
  const rightEdge = dims.betweenFenders / 2;
  const tiltCenter = 0;
  const stationaryCenter = 0; // Not used but keeps logic simple

  const frameTopY = dims.deckHeight - dims.plankThickness;
  const lowerRailCenterY = frameTopY - dims.lowerRailHeight / 2;
  const upperRailCenterY = frameTopY + dims.upperRailSize / 2;
  const axleCenterY = dims.tireRadius;

  const tiltPivotX = 0;
  const tiltPivotZ = dims.axleCenterZ - 8;
  const tiltAngle = isUnfolded ? 0 : 0; // We will use isUnfolded for ramps later

  const tongueBaseZ = -deckHalfLen + 15;
  const tongueHalfAngle = (Math.PI / 180) * 34;
  const tongueBeamHeight = 5.9;
  const tongueBeamWidth = 3.15;
  const tongueBeamSpreadX = 14.5;
  const tongueBeamLength = 54; // Adjusted length
  const tongueBeamCenterZ = tongueBaseZ - tongueBeamLength * 0.5 - 6;
  const hitchPlateZ = tongueBaseZ - tongueBeamLength - 1.5; // Apex connection point
  const hitchCenterY = frameTopY - 0.2; // Almost flush with top of wood deck

  const jackSleeveWidth = 3.95;
  const jackSleeveHeight =10.0;
  const jackInnerWidth = 3.55;
  const jackInnerHeight = 26; // Extended long stroke
  const jackFootSize = 9.9;
  const jackCenterZ = tongueBaseZ - 33;
  const jackSleeveBottomY = frameTopY + 2.2; // Even higher clearance for jack housing
  const jackSleeveCenterY = jackSleeveBottomY + jackSleeveHeight / 2;
  const jackInnerCenterY = jackSleeveBottomY - jackInnerHeight / 2; // Fully extended to ground
  const jackFootCenterY = jackInnerCenterY - jackInnerHeight / 2 - 0.55;

  const chainAnchorZ = tongueBaseZ - 20;
  const chainEndZ = hitchPlateZ + 1.4;

  const crossCount = Math.floor(dims.deckLength / 12);

  const woodPlanks = useWoodPlankMaterials(deckWood);

  const stationaryPlankCount = 4;
  const stationaryGap = 0.24;
  const stationaryPlankWidth =
    (dims.stationaryDeckWidth - stationaryGap * (stationaryPlankCount - 1)) /
    stationaryPlankCount;

  const tiltPlankCount = 8;
  const tiltGap = 0.24;
  const tiltPlankWidth =
    (dims.tiltDeckWidth - tiltGap * (tiltPlankCount - 1)) / tiltPlankCount;
  const beavertailLength = 72; // 6' wood beavertail
  const deckCenterZ = 0; // The deck occupies the full length centered

  const hp = (name: string) => ({
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onPartHover(name);
    },
    onPointerOut: onPartLeave,
  });

  return (
    <group>
      {/* Main lower rails — Split for beavertail bend */}
      {[-1, 1].map((side) => {
        const x = side * dims.betweenFenders / 2;
        const flatLen = dims.deckLength - beavertailLength;
        const zFlatCenter = -deckHalfLen + flatLen / 2;
        return (
          <group key={`lower-rail-${side}`}>
            {/* Flat section */}
            <mesh
              position={[x, lowerRailCenterY, zFlatCenter]}
              material={frameMaterial}
              castShadow receiveShadow
              {...hp(side < 0 ? "Left Main Rail" : "Right Main Rail")}
            >
              <boxGeometry args={[dims.lowerRailWidth, dims.lowerRailHeight, flatLen]} />
            </mesh>
            {/* Beavertail sloped section */}
            <group position={[side * dims.betweenFenders / 2, lowerRailCenterY, -deckHalfLen + (dims.deckLength - beavertailLength)]} rotation={[0.26, 0, 0]}>
              <mesh position={[0, 0, beavertailLength / 2]} material={frameMaterial} castShadow receiveShadow>
                <boxGeometry args={[dims.lowerRailWidth, dims.lowerRailHeight, beavertailLength]} />
              </mesh>
            </group>
          </group>
        );
      })}

      {/* Upper rails / rub rails — Split for beavertail bend */}
      {[-1, 1].map((side) => {
        const x = side * (dims.betweenFenders / 2 - 1.5);
        const flatLen = dims.deckLength - beavertailLength;
        const zFlatCenter = -deckHalfLen + flatLen / 2;
        return (
          <group key={`upper-rail-${side}`}>
            {/* Flat section */}
            <mesh
              position={[x, upperRailCenterY, zFlatCenter]}
              material={frameWearMaterial}
              castShadow
              {...hp(side < 0 ? "Left Rub Rail" : "Right Rub Rail")}
            >
              <boxGeometry args={[3, dims.upperRailSize, flatLen]} />
            </mesh>
            {/* Beavertail sloped section */}
            <group position={[side * (dims.betweenFenders / 2 - 1.5), upperRailCenterY, -deckHalfLen + (dims.deckLength - beavertailLength)]} rotation={[0.26, 0, 0]}>
               <mesh position={[0, 0, beavertailLength / 2]} material={frameWearMaterial} castShadow>
                 <boxGeometry args={[3, dims.upperRailSize, beavertailLength]} />
               </mesh>
            </group>
          </group>
        );
      })}

      {/* Crossmembers — full length of main deck flat part */}
      {Array.from({ length: Math.floor((dims.deckLength - beavertailLength) / 12) }).map((_, i) => {
        const z = -deckHalfLen + 6 + i * 12;
        return (
          <mesh
            key={i}
            position={[0, frameTopY - dims.crossmemberDepth / 2, z]}
            material={frameMaterial}
            castShadow
            {...hp("Crossmember")}
          >
            <boxGeometry
              args={[dims.betweenFenders, dims.crossmemberDepth, 1.85]}
            />
          </mesh>
        );
      })}

      {/* Reflector stripes — with beavertail bend */}
      {[-1, 1].map((side) => {
        const x = side < 0 ? leftEdge - 0.1 : rightEdge + 0.1;
        const flatLen = dims.deckLength - beavertailLength;
        return (
          <group key={`reflector-side-${side}`}>
             {/* Flat part reflectors */}
             <SideReflectorStrip
                x={x}
                y={upperRailCenterY}
                zStart={-deckHalfLen + 18}
                zEnd={-deckHalfLen + flatLen}
                onPartHover={onPartHover}
                onPartLeave={onPartLeave}
             />
             {/* Sloped beavertail reflectors */}
             <group position={[x, upperRailCenterY, -deckHalfLen + flatLen]} rotation={[0.26, 0, 0]}>
                <SideReflectorStrip
                  x={0} 
                  y={0}
                  zStart={0}
                  zEnd={beavertailLength}
                  onPartHover={onPartHover}
                  onPartLeave={onPartLeave}
                />
                
             </group>
          </group>
        );
      })}

      {/* Stationary deck frame top surface */}
      {/* Single, full-width front deck frame panel — no partition */}
      <mesh
        position={[0, frameTopY - 1.2, -deckHalfLen + (dims.deckLength * 0.05) / 2]}
        material={frameMaterial}
        castShadow
        receiveShadow
        {...hp("Front Main Frame Plate")}
      >
        <boxGeometry
          args={[dims.betweenFenders, 3.2, dims.deckLength * 0.05]}
        />
      </mesh>

      {/* Main Wood Deck (Full Length minus Beavertail) */}
      {(() => {
        const deckLengthMinusBeavertail = dims.deckLength - beavertailLength;
        const deckCenterZBeforeBeavertail = -deckHalfLen + deckLengthMinusBeavertail / 2;
        
        return (
          <group position={[0, dims.deckHeight, deckCenterZBeforeBeavertail]}>
            {/* Metal frame surface underneath planks */}
            <mesh
              position={[0, -(dims.plankThickness + 0.02), 0]}
              material={frameMaterial}
              castShadow
              receiveShadow
              {...hp("Main Deck Frame")}
            >
              <boxGeometry args={[dims.tiltDeckWidth, 0.2, deckLengthMinusBeavertail]} />
            </mesh>

            {/* Frame borders and dividers */}
            {/* Left outer border */}
            <mesh
              position={[-dims.tiltDeckWidth / 2 + 1.5, -(dims.plankThickness / 2) + 0.015, 0]}
              material={frameMaterial}
              castShadow receiveShadow
              {...hp("Main Deck Outer Border")}
            >
              <boxGeometry args={[3, dims.plankThickness, deckLengthMinusBeavertail]} />
            </mesh>
            {/* Right outer border */}
            <mesh
              position={[dims.tiltDeckWidth / 2 - 1.5, -(dims.plankThickness / 2) + 0.015, 0]}
              material={frameMaterial}
              castShadow receiveShadow
              {...hp("Main Deck Outer Border")}
            >
              <boxGeometry args={[3, dims.plankThickness, deckLengthMinusBeavertail]} />
            </mesh>
            {/* Internal Dividers */}
            {[-1, 1].map((side) => (
              <mesh
                key={`divider-${side}`}
                position={[side * (48/2 + 4/2), -(dims.plankThickness / 2) + 0.015, 0]}
                material={frameMaterial}
                castShadow receiveShadow
                {...hp("Deck Internal Divider")}
              >
                <boxGeometry args={[4, dims.plankThickness, deckLengthMinusBeavertail]} />
              </mesh>
            ))}

            {/* Front border */}
            <mesh
              position={[0, -(dims.plankThickness / 2) + 0.015, -deckLengthMinusBeavertail / 2 + 1.5]}
              material={frameMaterial}
              castShadow receiveShadow
              {...hp("Deck Front Rail")}
            >
              <boxGeometry args={[dims.tiltDeckWidth, dims.plankThickness, 3]} />
            </mesh>
            {/* Rear border */}
            <mesh
              position={[0, -(dims.plankThickness / 2) + 0.015, deckLengthMinusBeavertail / 2 - 1.5]}
              material={frameMaterial}
              castShadow receiveShadow
              {...hp("Deck Rear Internal Rail")}
            >
              <boxGeometry args={[dims.tiltDeckWidth, dims.plankThickness, 3]} />
            </mesh>

            {/* Wood Planks - 3 partitioned sections */}
            {[
              { xStart: -dims.tiltDeckWidth / 2 + 3, width: 20, count: 3, sectionIdx: 0 },
              { xStart: -48/2, width: 48, count: 7, sectionIdx: 1 },
              { xStart: 48/2 + 4, width: 20, count: 3, sectionIdx: 2 }
            ].map((section) => (
              <group key={`section-${section.sectionIdx}`}>
                {Array.from({ length: section.count }).map((_, i) => {
                  const pW = (section.width - (section.count - 1) * tiltGap) / section.count;
                  const x = section.xStart + pW / 2 + i * (pW + tiltGap);
                  const innerLength = deckLengthMinusBeavertail - 6;

                  return (
                    <mesh
                      key={`plank-${section.sectionIdx}-${i}`}
                      position={[x, -(dims.plankThickness / 2) + 0.015, 0]}
                      material={woodPlanks[(i + section.sectionIdx * 5) % woodPlanks.length]}
                      castShadow
                      receiveShadow
                      {...hp("Deck Plank")}
                    >
                      <boxGeometry args={[pW, dims.plankThickness, innerLength]} />
                    </mesh>
                  );
                })}
              </group>
            ))}
          </group>
        );
      })()}

      {(() => {
        const deckLengthMinusBeavertail = dims.deckLength - beavertailLength;
        const beavertailCenterZ = -deckHalfLen + deckLengthMinusBeavertail + beavertailLength / 2;
        const beavertailAngle = 0.26; // More pronounced drop (approx 15 degrees)
        const ramp1Angle = isUnfolded ? 0.6 : Math.PI; 
        const ramp2Angle = isUnfolded ? 0 : -Math.PI + 0.2;

        return (
        <group position={[0, dims.deckHeight-9.5, beavertailCenterZ]} rotation={[beavertailAngle, 0, 0]}>
          {/* Rear beavertail gate — Flat wood top, wedge bottom frame */}
          <group {...hp("Wood Beavertail")}>
            <mesh castShadow receiveShadow>
              <meshStandardMaterial
                color="#1a1f25"
                roughness={0.4}
                metalness={0.82}
                side={THREE.DoubleSide}
              />
              <bufferGeometry
                onUpdate={(self) => {
                  const w = dims.tiltDeckWidth / 2;
                  const L = beavertailLength / 2;
                         // Top of the frame is significantly below the planks
                  const topY = -(dims.plankThickness / 2) - 0.8; 
                  const fHBot = topY - 5.5; // Deeper front structure
                  const rHBot = topY - 0.05; // Sharp rear
                  
                  const verts = new Float32Array([
                    -w, fHBot, -L, // 0: front bottom left
                     w, fHBot, -L, // 1: front bottom right
                     w, topY,  -L, // 2: front top right
                    -w, topY,  -L, // 3: front top left
                    -w, rHBot,  L, // 4: rear bottom left
                     w, rHBot,  L, // 5: rear bottom right
                     w, topY,   L, // 6: rear top right
                    -w, topY,   L, // 7: rear top left
                  ]);
                  const idx = [
                    0, 1, 2, 0, 2, 3, 5, 4, 7, 5, 7, 6, 4, 5, 1, 4, 1, 0, 3, 2, 6,
                    3, 6, 7, 4, 0, 3, 4, 3, 7, 1, 5, 6, 1, 6, 2,
                  ];
                  self.setAttribute("position", new THREE.BufferAttribute(verts, 3));
                  self.setIndex(idx);
                  self.computeVertexNormals();
                }}
              />
            </mesh>
            
            {/* Frame borders and dividers */}
            {/* Left outer border */}
            <mesh
              position={[-dims.tiltDeckWidth / 2 + 1.5, -(dims.plankThickness / 2) + 0.015, 0]}
              material={frameMaterial}
              castShadow receiveShadow
              {...hp("Beavertail Side Border")}
            >
              <boxGeometry args={[3, dims.plankThickness, beavertailLength]} />
            </mesh>
            {/* Right outer border */}
            <mesh
              position={[dims.tiltDeckWidth / 2 - 1.5, -(dims.plankThickness / 2) + 0.015, 0]}
              material={frameMaterial}
              castShadow receiveShadow
              {...hp("Beavertail Side Border")}
            >
              <boxGeometry args={[3, dims.plankThickness, beavertailLength]} />
            </mesh>
            {/* Internal Dividers */}
            {[-1, 1].map((side) => (
              <mesh
                key={`divider-${side}`}
                position={[side * (48/2 + 4/2), -(dims.plankThickness / 2) + 0.015, 0]}
                material={frameMaterial}
                castShadow receiveShadow
                {...hp("Beavertail Divider")}
              >
                <boxGeometry args={[4, dims.plankThickness, beavertailLength]} />
              </mesh>
            ))}
            {/* Rear border */}
            {/* Rear border - Expanded to 10" for ramp connection */}
            <mesh
              position={[0, -(dims.plankThickness / 2) + 0.015, beavertailLength / 2 - 5]}
              material={frameMaterial}
              castShadow receiveShadow
              {...hp("Beavertail Tail End Rail")}
            >
              <boxGeometry args={[dims.tiltDeckWidth, dims.plankThickness, 10]} />
            </mesh>

            {/* Wood Planks for Beavertail - 3 partitioned sections */}
            {[
              { xStart: -dims.tiltDeckWidth / 2 + 3, width: 20, count: 3, sectionIdx: 0 },
              { xStart: -48/2, width: 48, count: 7, sectionIdx: 1 },
              { xStart: 48/2 + 4, width: 20, count: 3, sectionIdx: 2 }
            ].map((section) => (
              <group key={`bt-section-${section.sectionIdx}`}>
                {Array.from({ length: section.count }).map((_, i) => {
                  const pW = (section.width - (section.count - 1) * tiltGap) / section.count;
                  const x = section.xStart + pW / 2 + i * (pW + tiltGap);
                  const innerLength = beavertailLength - 10; // Accounts for 10" rear border

                  return (
                    <mesh
                      key={`bt-plank-${section.sectionIdx}-${i}`}
                      position={[x, -(dims.plankThickness / 2) + 0.015, -5]}
                      material={woodPlanks[(i + section.sectionIdx * 5) % woodPlanks.length]}
                      castShadow
                      receiveShadow
                      {...hp("Beavertail Wood Plank")}
                    >
                      <boxGeometry args={[pW, dims.plankThickness, innerLength]} />
                    </mesh>
                  );
                })}
              </group>
            ))}
          </group>
          {[-8, 0, 8].map((x, i) => (
            <mesh
              key={i}
              position={[x, 0.4, 6]}
              material={frameWearMaterial}
              {...hp("Roller Support")}
            >
              <cylinderGeometry args={[1.25, 1.25, 0.72, 18]} />
            </mesh>
          ))}
        {/* Foldable Ramps: Highly Detailed Wood and Steel Bi-Fold */}
        {(() => {
          const r1Angle = isUnfolded ? 2.9 : -Math.PI*1.6;
          const r2Angle = isUnfolded ? 0.2 : Math.PI - 0.1;

          const rWidth = 46;
          const rGap = 4;
          const rLen1 = beavertailLength - 4; // First segment
          const rLen2 = rLen1 * 0.65; // User asked to reduce size of second ramp
          const wedgeLen = 14; // Sharp end beaver tail like thing
          const rThick = 4.5;
          const woodThick = 3.0;
          
          return (
            <group position={[0, -rThick / 2, beavertailLength / 2]} rotation={[r1Angle, 0, 0]}>
              {[-1, 1].map((side) => {
                const xPos = side * (rWidth / 2 + rGap / 2);
                return (
                  <group key={side} position={[xPos, 0, 0]}>
                    <group position={[0, -rThick / 2, -rLen1 / 2]}>
                                  {/* Section 1: Main Ramp Segment */}
                      <group>
                        <mesh position={[-rWidth / 2 + 1.5, 0, 0]} material={frameMaterial} castShadow receiveShadow {...hp("Ramp Main Rail")}>
                          <boxGeometry args={[3, rThick, rLen1]} />
                        </mesh>
                        <mesh position={[rWidth / 2 - 1.5, 0, 0]} material={frameMaterial} castShadow receiveShadow {...hp("Ramp Main Rail")}>
                          <boxGeometry args={[3, rThick, rLen1]} />
                        </mesh>
                        <mesh position={[0, 0, -rLen1 / 2 + 1.5]} material={frameMaterial} castShadow receiveShadow {...hp("Ramp Connection Rail")}>
                          <boxGeometry args={[rWidth - 6, rThick, 3]} />
                        </mesh>
                        <mesh position={[0, 0, rLen1 / 2 - 5]} material={frameMaterial} castShadow receiveShadow {...hp("Ramp Hinge Rail")}>
                          <boxGeometry args={[rWidth - 6, rThick, 10]} />
                        </mesh>
                        
                        {/* 4 Support Stands (Stabilizer Legs) — 2 per ramp at the corners */}
                        {[-1, 1].map((xSide) => (
                           <group key={`stand-${xSide}`} position={[xSide * (rWidth / 2 - 4.5), rThick / 2 + 6.5, rLen1 / 2 - 6]}>
                              <mesh material={hardwareSteelMaterial} castShadow {...hp("Support Stand")}>
                                 <boxGeometry args={[3.2, 14.0, 3.2]} />
                              </mesh>
                              <mesh position={[0, 7.0, 0]} material={hardwareSteelMaterial} castShadow {...hp("Support Foot")}>
                                 <boxGeometry args={[5.2, 1.2, 5.2]} />
                              </mesh>
                           </group>
                        ))}
                        
                        {Array.from({ length: 4 }).map((_, cIdx) => (
                           <mesh key={`cross-${cIdx}`} position={[0, rThick / 2 - 0.2, -rLen1 / 2 + 10 + cIdx * 12]} material={hardwareSteelMaterial} castShadow {...hp("Ramp Crossmember")}>
                              <boxGeometry args={[rWidth - 6, 0.4, 2]} />
                           </mesh>
                        ))}
                        
                        {[-rWidth / 2 + 2.5, rWidth / 2 - 2.5].map((hx, hi) => (
                           <mesh key={`hinge-${hi}`} position={[hx, 0, rLen1 / 2]} rotation={[0, Math.PI / 2, 0]} material={hardwareSteelMaterial} castShadow {...hp("Main Ramp Hinge")}>
                              <cylinderGeometry args={[2.5, 2.5, 4, 16]} />
                           </mesh>
                        ))}

                        {Array.from({ length: 4 }).map((_, wIdx) => {
                          const wCount = 4;
                          const wWidth = (rWidth - 6 - (0.24 * (wCount - 1))) / wCount;
                          const wx = -rWidth / 2 + 3 + wWidth / 2 + wIdx * (wWidth + 0.24);
                          return (
                            <mesh key={`wood-${wIdx}`} position={[wx, (woodThick - rThick) / 2 + 0.5, -3.5]} material={woodPlanks[(wIdx + side + 3) % woodPlanks.length]} castShadow receiveShadow {...hp("Ramp Wood Plank")}>
                                <boxGeometry args={[wWidth, woodThick, rLen1 - 13]} />
                            </mesh>
                          );
                        })}
                          {/* Section 2: Bi-fold Segment (Reduced Size) */}
                        <group position={[0, rThick / 2, -rLen1 / 2]} rotation={[r2Angle, 0, 0]}>
                          <group position={[0, -rThick / 2, -rLen2 / 2]}>
                             {[-rWidth / 2 + 2.5, rWidth / 2 - 2.5].map((hx, hi) => (
                               <mesh key={`hinge-mid-${hi}`} position={[hx, 0, rLen2 / 2]} rotation={[0, Math.PI / 2, 0]} material={hardwareSteelMaterial} castShadow {...hp("Bi-fold Hinge")}>
                                  <cylinderGeometry args={[2.5, 2.5, 4, 16]} />
                               </mesh>
                             ))}
                             
                             <mesh position={[0, rThick / 2 + 1.5, rLen2 / 2 - 3]} material={frameMaterial} castShadow {...hp("Ramp Handle")}>
                                <boxGeometry args={[8, 4, 3]} />
                             </mesh>

                             <mesh position={[-rWidth / 2 + 1.5, 0, 0]} material={frameMaterial} castShadow receiveShadow {...hp("Ramp Bi-fold Rail")}>
                               <boxGeometry args={[3, rThick, rLen2]} />
                             </mesh>
                             <mesh position={[rWidth / 2 - 1.5, 0, 0]} material={frameMaterial} castShadow receiveShadow {...hp("Ramp Bi-fold Rail")}>
                               <boxGeometry args={[3, rThick, rLen2]} />
                             </mesh>
                             <mesh position={[0, 0, -rLen2 / 2 + 1.5]} material={frameMaterial} castShadow receiveShadow {...hp("Ramp End Rail")}>
                               <boxGeometry args={[rWidth - 6, rThick, 3]} />
                             </mesh>
                             <mesh position={[0, 0, rLen2 / 2 - 1.5]} material={frameMaterial} castShadow receiveShadow {...hp("Ramp End Rail")}>
                               <boxGeometry args={[rWidth - 6, rThick, 3]} />
                             </mesh>

                             {Array.from({ length: 4 }).map((_, wIdx) => {
                                const wCount = 4;
                                const wWidth = (rWidth - 6 - (0.24 * (wCount - 1))) / wCount;
                                const wx = -rWidth / 2 + 3 + wWidth / 2 + wIdx * (wWidth + 0.24);
                                return (
                                  <mesh key={`wood-2-${wIdx}`} position={[wx, (woodThick - rThick) / 2 + 0.5, 0]} material={woodPlanks[(wIdx + side + 1) % woodPlanks.length]} castShadow receiveShadow {...hp("Bi-fold Wood Plank")}>
                                      <boxGeometry args={[wWidth, woodThick, rLen2 - 6]} />
                                  </mesh>
                                );
                             })}

                             {/* Section 3: Sharp end beaver tail like thing */}
                             <group position={[0, 0, -rLen2 / 2]}>
                                <mesh castShadow receiveShadow {...hp("Ramp Wedge End")}>
                                  <meshStandardMaterial color="#1a1f25" roughness={0.4} metalness={0.82} side={THREE.DoubleSide} />
                                  <bufferGeometry onUpdate={(self) => {
                                    const w = rWidth / 2;
                                    const L = wedgeLen;
                                    const t = rThick;
                                    const rHBot = t/2 - 0.1; // almost top
                                    
                                    const verts = new Float32Array([
                                      -w, -t/2, 0,  // 0: bottom front left
                                       w, -t/2, 0,  // 1: bottom front right
                                       w,  t/2, 0,  // 2: top front right
                                      -w,  t/2, 0,  // 3: top front left
                                      -w,  rHBot, -L, // 4: bottom rear left (sharp)
                                       w,  rHBot, -L, // 5: bottom rear right (sharp)
                                       w,  t/2,  -L, // 6: top rear right
                                      -w,  t/2,  -L, // 7: top rear left
                                    ]);
                                    const idx = [
                                      0, 1, 2, 0, 2, 3, // front
                                      5, 4, 7, 5, 7, 6, // back (tiny)
                                      4, 5, 1, 4, 1, 0, // bottom
                                      3, 2, 6, 3, 6, 7, // top
                                      4, 0, 3, 4, 3, 7, // left
                                      1, 5, 6, 1, 6, 2  // right
                                    ];
                                    self.setAttribute("position", new THREE.BufferAttribute(verts, 3));
                                    self.setIndex(idx);
                                    self.computeVertexNormals();
                                  }} />
                                </mesh>
                             </group>
                          </group>
                        </group>
                      </group>
                    </group>
                  </group>
                );
              })}
            </group>
          );
        })()}

        {/* Safety Transport Belt - Connecting wood beavertail border to folded ramp bifold rail */}
        {!isUnfolded && (
          <group>
            {[-1, 1].map((side) => {
              const ax = side * 52.8;
              const ay = -4.5;
              const az = 21.6; // 80% mark: (72 * 0.8) - 36 = 21.6
              
              // Coordinates for the folded ramp bifold center (Ramp 2 center when folded over Ramp 1)
              const bx = side * 48.5;
              const by = 47.0; 
              const bz = 25.0;
              
              const midX = (ax + bx) / 2;
              const midY = (ay + by) / 2;
              const midZ = (az + bz) / 2;
              
              const dx = bx - ax;
              const dy = by - ay;
              const dz = bz - az;
              const dist = Math.sqrt(dx*dx + dy*dy + dz*dz) + 0.5;
              
              return (
                <group key={`belt-side-${side}`}>
                   {/* The main belt strap connecting the two points */}
                   <mesh 
                    position={[midX, midY, midZ]}
                    rotation={[
                      -Math.atan2(dy, dz),
                      Math.atan2(dx, Math.sqrt(dy*dy + dz*dz)),
                      0
                    ]}
                    castShadow
                    {...hp("Safety Transport Belt")}
                   >
                     <boxGeometry args={[1.6, 0.3, dist]} />
                     <meshStandardMaterial color="#b8860b" roughness={0.9} />
                   </mesh>
                   
                   {/* Anchor point on the beavertail side border */}
                   <mesh position={[ax, ay, az]} material={hardwareSteelMaterial} {...hp("Belt Frame Anchor")}>
                      <boxGeometry args={[2.0, 2.0, 2.2]} />
                   </mesh>
                   
                   {/* Bracket/attachment point on the ramp bifold rail center */}
                   <mesh 
                    position={[bx, by-1, bz]} 
                    rotation={[-0.2, 0, 0]}
                    material={hardwareSteelMaterial} 
                    {...hp("Ramp Belt Bracket")}
                   >
                      <boxGeometry args={[2.5, 0.8, 3.5]} />
                   </mesh>
                </group>
              );
            })}
          </group>
        )}

        </group>
        );
      })()}


      {/* Axles and wheels: Triple 22.5k setup with Dual Tires */}
      {[
        dims.axleCenterZ - dims.axleSpacing,
        dims.axleCenterZ,
        dims.axleCenterZ + dims.axleSpacing,
      ].map((z, idx) => (
        <group key={`axle-${idx}`} position={[0, axleCenterY, z]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            material={frameMaterial}
            castShadow
            {...hp("Axle Shaft")}
          >
            <cylinderGeometry args={[1.8, 1.8, 102, 22]} />
          </mesh>
          {[-dims.wheelTrackHalf, dims.wheelTrackHalf].map((x, sideIdx) => (
            <group
              key={sideIdx}
              position={[x, 0, 0]}
              rotation={[0, x < 0 ? Math.PI : 0, 0]} // Face hubs outwards
            >
              {/* Dual Tire Setup: Inner and Outer wheels */}
              {[0, -11.5].map((xOffset, dualIdx) => (
                <group key={dualIdx} position={[xOffset, 0, 0]}>
                  <Wheel
                    tireRadius={dims.tireRadius}
                    tireWidth={dims.tireWidth}
                    onPartHover={onPartHover}
                    onPartLeave={onPartLeave}
                  />
                </group>
              ))}
            </group>
          ))}
        </group>
      ))}

      {/* Rear tail lights moved into tilt group */}


      {/* A-frame tongue with 50-60 degree included angle */}
      {[-1, 1].map((side) => (
        <mesh
          key={`tongue-beam-${side}`}
          position={[
            side * tongueBeamSpreadX,
            hitchCenterY,
            tongueBeamCenterZ,
          ]}
          rotation={[0, side * tongueHalfAngle, 0]}
          material={hardwareSteelMaterial}
          castShadow
          receiveShadow
          {...hp("A-Frame Tongue Beam")}
        >
          <boxGeometry
            args={[tongueBeamWidth, tongueBeamHeight, tongueBeamLength]}
          />
        </mesh>
      ))}

      {/* Gusset Plate with light gap from A-frame */}
      <mesh
        position={[0, hitchCenterY - 0.5, hitchPlateZ + 5.5]}
        material={hardwareSteelMaterial}
        castShadow
        {...hp("Gusset Plate")}
      >
        <boxGeometry args={[11.8, 4.8, 0.7]} />
      </mesh>

      {/* Hitch Box at A-frame apex */}
      <mesh
        position={[0, hitchCenterY, hitchPlateZ + 1.2]}
        material={hardwareSteelMaterial}
        castShadow
        {...hp("Hitch Box")}
      >
        <boxGeometry args={[8.8, 6.4, 6.2]} />
      </mesh>

      {/* Dual tongue-mounted stabilizing jacks */}
      {[-1, 1].map((side) => (
        <group key={`front-jack-${side}`} position={[side * 26.5, -7, -deckHalfLen - 4]} rotation={[0, Math.PI, 0]}>
          <mesh
            position={[0, jackSleeveCenterY, 0]}
            material={hardwareSteelMaterial}
            castShadow
            {...hp("Corner Jack Sleeve")}
          >
            <boxGeometry
              args={[jackSleeveWidth, jackSleeveHeight, jackSleeveWidth]}
            />
          </mesh>
          <mesh
            position={[0, jackInnerCenterY, 0]}
            material={frameWearMaterial}
            castShadow
            {...hp("Corner Jack Inner Leg")}
          >
            <boxGeometry
              args={[jackInnerWidth, jackInnerHeight, jackInnerWidth]}
            />
          </mesh>
          <mesh
            position={[0, jackFootCenterY, 0]}
            material={hardwareSteelMaterial}
            castShadow
            {...hp("Corner Jack Foot Plate")}
          >
            <boxGeometry args={[jackFootSize, 0.4, jackFootSize]} />
          </mesh>

          {/* Crank shaft */}
          <mesh
            position={[jackSleeveWidth / 2 + 1.5, jackSleeveCenterY + 4.4, 0]}
            rotation={[0, 0, Math.PI / 2]}
            material={frameMaterial}
            castShadow
          >
            <cylinderGeometry args={[0.21, 0.21, 4.8, 12]} />
          </mesh>

          {/* Crank grip */}
          <mesh
            position={[jackSleeveWidth / 2 + 4, jackSleeveCenterY + 4.4, 0]}
            rotation={[Math.PI / 2, 0, Math.PI / 2]}
            material={frameWearMaterial}
            castShadow
          >
            <capsuleGeometry args={[0.42, 1.8, 8, 14]} />
          </mesh>
        </group>
      ))}

      {/* Hitch */}
      {hitchType === "coupler" ? (
        <group position={[0, hitchCenterY, hitchPlateZ]}>
          <mesh
            material={hardwareSteelMaterial}
            castShadow
            {...hp("Coupler Mounting Plate")}
          >
            <boxGeometry args={[7.8, 8.8, 0.7]} />
          </mesh>
          <mesh
            position={[1, 0, 2.3]}
            rotation={[Math.PI / 2, 0, 0]}
            material={frameMaterial}
            castShadow
            {...hp("Ball Coupler")}
          >
            <coneGeometry args={[3.2, 8, 20]} />
          </mesh>
        </group>
      ) : (
        <group position={[0, hitchCenterY, hitchPlateZ]}>
          {/* Adjustable front channel */}
          <mesh
            material={hardwareSteelMaterial}
            castShadow
            {...hp("Pintle Channel")}
          >
            <boxGeometry args={[8.4, 12, 1.1]} />
          </mesh>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={`channel-hole-${i}`}
              position={[0, -4 + i * 2, 0.58]}
              material={frameWearMaterial}
              {...hp("Pin Hole")}
            >
              <cylinderGeometry args={[0.42, 0.42, 0.22, 16]} />
            </mesh>
          ))}

          {/* Pintle mounting plate and bolt pattern */}
          <mesh
            position={[0, 0, 0.98]}
            material={frameMaterial}
            castShadow
            {...hp("Pintle Mounting Plate")}
          >
            <boxGeometry args={[7.9, 9.8, 0.65]} />
          </mesh>
          {[-2.2, 2.2].map((bx) =>
            [-2.8, 2.8].map((by) => (
              <mesh
                key={`bolt-${bx}-${by}`}
                position={[bx, by, 1.28]}
                material={chainMaterial}
                castShadow
                {...hp("Mounting Bolt")}
              >
                <cylinderGeometry args={[0.28, 0.28, 0.85, 14]} />
              </mesh>
            )),
          )}

          {/* Pintle eye ring: inner diameter ~7.5 cm with 3-4 cm tube */}
          <mesh
            position={[0, 0, 2.65]}
            rotation={[Math.PI / 2, 0, 0]}
            material={hardwareSteelMaterial}
            castShadow
            {...hp("Pintle Eye Ring")}
          >
            <torusGeometry args={[2.75, 1.28, 16, 34]} />
          </mesh>
        </group>
      )}

      {/* Optional equipment removed */}
    </group>
  );
}

function TrailerModel({
  frontDeckLengthFt,
  axleRating,
  deckWood,
  hitchType,
  isUnfolded,
  autoRotate,
  onPartHover,
  onPartLeave,
}: Required<
  Pick<
    TrailerViewerProps,
    | "frontDeckLengthFt"
    | "axleRating"
    | "deckWood"
    | "hitchType"
    | "isUnfolded"
    | "autoRotate"
  >
> & {
  onPartHover: PartHoverFn;
  onPartLeave: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const dims = useMemo(
    () => deriveDimensions(frontDeckLengthFt, axleRating, deckWood),
    [frontDeckLengthFt, axleRating, deckWood],
  );

  useFrame((_, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.11;
    }
  });

  return (
    <group ref={groupRef}>
      <FrameAssembly
        dims={dims}
        isUnfolded={isUnfolded}
        deckWood={deckWood}
        hitchType={hitchType}
        onPartHover={onPartHover}
        onPartLeave={onPartLeave}
      />
    </group>
  );
}

export default function TrailerViewer({
  frontDeckLengthFt = 4,
  axleRating = 10000,
  deckWood = "treated-pine",
  hitchType = "coupler",
  isUnfolded = false,
  cameraView = "perspective",
  autoRotate = false,
  showHoverLabels = true,
}: TrailerViewerProps) {
  const dims = useMemo(
    () => deriveDimensions(frontDeckLengthFt, axleRating, deckWood),
    [frontDeckLengthFt, axleRating, deckWood],
  );

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);

  const handlePartHover = (name: string) => {
    if (showHoverLabels && !isDragging.current) setHoveredPart(name);
  };
  const handlePartLeave = () => {
    if (!isDragging.current) setHoveredPart(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handlePointerDown = () => {
    isDragging.current = true;
    setHoveredPart(null);
  };
  const handlePointerUp = () => {
    isDragging.current = false;
  };
  // Called by OrbitControls onStart/onEnd directly

  return (
    <>
      <div
        className="relative w-full h-[700px] bg-gray-200 rounded-lg overflow-hidden border border-slate-300"
        onMouseMove={handleMouseMove}
        onMouseLeave={handlePartLeave}
      >
        <Canvas
          camera={{ position: [360, 180, 520], fov: 40, near: 1, far: 3200 }}
          shadows
        >
          <CameraRig cameraView={cameraView} deckLength={dims.deckLength} />
          <color attach="background" args={["#9ca3af"]} />

          <ambientLight intensity={0.55} />
          <hemisphereLight
            intensity={0.33}
            groundColor="#4b8a43"
            color="#f8fcff"
          />
          <directionalLight
            position={[180, 230, 140]}
            intensity={1.1}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />

          <Environment preset="city" />

          <group position={[0, 0, 0]}>
            <TrailerModel
              frontDeckLengthFt={frontDeckLengthFt}
              axleRating={axleRating}
              deckWood={deckWood}
              hitchType={hitchType}
              isUnfolded={isUnfolded}
              autoRotate={autoRotate}
              onPartHover={handlePartHover}
              onPartLeave={handlePartLeave}
            />
          </group>

          <mesh
            position={[0, -0.4, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[1200, 1200]} />
            <meshStandardMaterial
              color="#6b7280"
              roughness={0.96}
              metalness={0.02}
            />
          </mesh>

          <ContactShadows
            position={[0, 0, 0]}
            opacity={0.42}
            scale={Math.max(560, dims.deckLength + 250)}
            blur={2.7}
            far={240}
          />

          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={cameraView === "perspective"}
            minPolarAngle={0.01}
            maxPolarAngle={Math.PI / 2 - 0.02}
            onStart={handlePointerDown}
            onEnd={handlePointerUp}
          />
        </Canvas>

        {hoveredPart && (
          <div
            className="absolute pointer-events-none z-20 bg-black/80 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg border border-white/20 whitespace-nowrap"
            style={{ left: mousePos.x + 14, top: mousePos.y - 32 }}
          >
            {hoveredPart}
          </div>
        )}

        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {isFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-gray-300"
          onMouseMove={handleMouseMove}
          onMouseLeave={handlePartLeave}
        >
          <Canvas
            camera={{ position: [360, 180, 520], fov: 40, near: 1, far: 3200 }}
            shadows
          >
            <CameraRig cameraView="perspective" deckLength={dims.deckLength} />
            <color attach="background" args={["#9ca3af"]} />

            <ambientLight intensity={0.55} />
            <hemisphereLight
              intensity={0.33}
              groundColor="#6b7280"
              color="#f8fcff"
            />
            <directionalLight
              position={[180, 230, 140]}
              intensity={1.1}
              castShadow
              shadow-mapSize={[2048, 2048]}
            />

            <Environment preset="city" />

            <group position={[0, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
              <TrailerModel
                frontDeckLengthFt={frontDeckLengthFt}
                axleRating={axleRating}
                deckWood={deckWood}
                hitchType={hitchType}
                isUnfolded={isUnfolded}
                autoRotate={true}
                onPartHover={handlePartHover}
                onPartLeave={handlePartLeave}
              />
            </group>

            <mesh
              position={[0, -0.4, 0]}
              rotation={[-Math.PI / 2, 0, 0]}
              receiveShadow
            >
              <planeGeometry args={[1200, 1200]} />
              <meshStandardMaterial
                color="#6b7280"
                roughness={0.96}
                metalness={0.02}
              />
            </mesh>

            <ContactShadows
              position={[0, 0, 0]}
              opacity={0.42}
              scale={Math.max(560, dims.deckLength + 250)}
              blur={2.7}
              far={240}
            />

            <OrbitControls
              enablePan={true}
              enableZoom={true}
              enableRotate={true}
              minPolarAngle={0}
              maxPolarAngle={Math.PI}
              onStart={handlePointerDown}
              onEnd={handlePointerUp}
            />
          </Canvas>

          {hoveredPart && (
            <div
              className="absolute pointer-events-none z-20 bg-black/80 text-white text-xs font-semibold px-2.5 py-1 rounded-md shadow-lg border border-white/20 whitespace-nowrap"
              style={{ left: mousePos.x + 14, top: mousePos.y - 32 }}
            >
              {hoveredPart}
            </div>
          )}

          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 bg-white/90 hover:bg-white p-3 rounded-lg shadow-lg transition-colors"
            title="Exit Fullscreen"
          >
            <X className="w-6 h-6 text-slate-700" />
          </button>
        </div>
      )}
    </>
  );
}
