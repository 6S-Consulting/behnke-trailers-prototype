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
  tiltSide?: TiltSide;
  tiltAngleDeg?: number;
  cameraView?: CameraView;
  showOptionalEquipment?: boolean;
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
  color: "#ce1f2c",
  emissive: "#8d0f18",
  emissiveIntensity: 0.75,
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
  color: "#8B0000",
  emissive: "#FF0000",
  emissiveIntensity: 3.5,
  roughness: 0.25,
  metalness: 0.1,
});

const tailLightBaseMaterial = new THREE.MeshStandardMaterial({
  color: "#0a0a0a",
  roughness: 0.35,
  metalness: 0.85,
});

const tailLightLensMaterial = new THREE.MeshStandardMaterial({
  color: "#660000",
  emissive: "#cc0000",
  emissiveIntensity: 2.5,
  roughness: 0.15,
  metalness: 0.05,
  transparent: true,
  opacity: 0.95,
});

function deriveDimensions(
  frontDeckLengthFt: LengthOption,
  axleRating: AxleRating,
  deckWood: DeckWood,
): TrailerDimensions {
  const frontDeckLength = frontDeckLengthFt * 12;
  const deckLength = 18 * 12 + frontDeckLength;

  const tireData =
    axleRating === 8000
      ? { tireRadius: 14.2, tireWidth: 8.5 }
      : { tireRadius: 15.2, tireWidth: 9.2 };

  return {
    deckHeight: 25,
    deckLength,
    frontDeckLength,
    tiltDeckWidth: 55.5,
    stationaryDeckWidth: 26.5,
    betweenFenders: 83,
    lowerRailHeight: 8,
    lowerRailWidth: 2,
    upperRailSize: 5,
    crossmemberDepth: 3,
    plankThickness: deckWood === "white-oak" ? 3.375 : 3.0,
    axleSpacing: 34,
    axleCenterZ: deckLength * 0.23,
    tireRadius: tireData.tireRadius,
    tireWidth: tireData.tireWidth,
    wheelTrackHalf: 48.8,
    tongueLength: 64,
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
            position={[x, y + 7, z]}
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
  tireRadius,
  tireWidth,
  onPartHover,
  onPartLeave,
}: {
  tireRadius: number;
  tireWidth: number;
  onPartHover?: PartHoverFn;
  onPartLeave?: () => void;
}) {
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

  return (
    <group>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={rubberMaterial}
        castShadow
        receiveShadow
        {...hp("Tire")}
      >
        <cylinderGeometry args={[tireRadius, tireRadius, tireWidth, 38]} />
      </mesh>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={rimMaterial}
        castShadow
        {...hp("Rim")}
      >
        <cylinderGeometry
          args={[tireRadius * 0.56, tireRadius * 0.56, tireWidth + 0.26, 30]}
        />
      </mesh>
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (Math.PI * 2 * i) / 8;
        return (
          <mesh
            key={i}
            rotation={[0, 0, Math.PI / 2]}
            position={[
              tireWidth / 2 + 0.15,
              Math.cos(angle) * 2.05,
              Math.sin(angle) * 2.05,
            ]}
            material={rimMaterial}
            {...hp("Lug Bolt")}
          >
            <cylinderGeometry args={[0.16, 0.16, 0.45, 8]} />
          </mesh>
        );
      })}
    </group>
  );
}

function FrameAssembly({
  dims,
  tiltSide,
  tiltAngleDeg,
  deckWood,
  showOptionalEquipment,
  hitchType,
  onPartHover,
  onPartLeave,
}: {
  dims: TrailerDimensions;
  tiltSide: TiltSide;
  tiltAngleDeg: number;
  deckWood: DeckWood;
  showOptionalEquipment: boolean;
  hitchType: HitchType;
  onPartHover: PartHoverFn;
  onPartLeave: () => void;
}) {
  const deckHalfLen = dims.deckLength / 2;
  const leftEdge = -dims.betweenFenders / 2;
  const rightEdge = dims.betweenFenders / 2;
  const tiltCenter = leftEdge + dims.tiltDeckWidth / 2;
  const stationaryCenter = rightEdge - dims.stationaryDeckWidth / 2;

  const frameTopY = dims.deckHeight - dims.plankThickness;
  const lowerRailCenterY = frameTopY - dims.lowerRailHeight / 2;
  const upperRailCenterY = frameTopY + dims.upperRailSize / 2;
  const axleCenterY = dims.tireRadius;

  const tiltSign = tiltSide === "driver" ? -1 : 1;
  const tiltPivotX = tiltSign < 0 ? tiltCenter : stationaryCenter;
  const tiltPivotZ = dims.axleCenterZ - 8;
  const tiltAngle = (Math.PI / 180) * tiltAngleDeg * (tiltSign < 0 ? 1 : -1);

  const tongueBaseZ = -deckHalfLen + 15;
  const tongueBeamLength = 59;
  const tongueBeamHeight = 5.9;
  const tongueBeamWidth = 3.15;
  const tongueHalfAngle = (Math.PI / 180) * 26;
  const tongueBeamSpreadX = 8.25;
  const tongueBeamCenterZ = tongueBaseZ - tongueBeamLength * 0.5 - 8;
  const hitchPlateZ = tongueBaseZ - tongueBeamLength - 8;
  const hitchCenterY = frameTopY - 0.8;

  const jackSleeveWidth = 3.95;
  const jackSleeveHeight = 23.6;
  const jackInnerWidth = 3.55;
  const jackInnerHeight = 16;
  const jackFootSize = 9.9;
  const jackCenterZ = tongueBaseZ - 33;
  const jackSleeveBottomY = frameTopY - 2.1;
  const jackSleeveCenterY = jackSleeveBottomY + jackSleeveHeight / 2;
  const jackInnerCenterY = jackSleeveBottomY - jackInnerHeight / 2 + 2.5;
  const jackFootCenterY = jackInnerCenterY - jackInnerHeight / 2 - 0.55;

  const chainAnchorZ = tongueBaseZ - 20;
  const chainEndZ = hitchPlateZ + 1.4;

  const breakawayCableCurve = useMemo(() => {
    const startZ = chainAnchorZ - 4;
    const endZ = hitchPlateZ + 2;
    const points = Array.from({ length: 24 }).map((_, i) => {
      const t = i / 23;
      const angle = t * Math.PI * 10;

      return new THREE.Vector3(
        3.1 + Math.cos(angle) * 0.55,
        frameTopY - 2.6 - 0.35 * t + Math.sin(angle) * 0.4,
        startZ + t * (endZ - startZ),
      );
    });

    return new THREE.CatmullRomCurve3(points);
  }, [chainAnchorZ, frameTopY, hitchPlateZ]);

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
  const tiltDeckLength = dims.deckLength * 0.8;
  const frontFixedLength = dims.deckLength - tiltDeckLength;
  const tiltDeckCenterZ = -deckHalfLen + frontFixedLength + tiltDeckLength / 2;
  const frontFixedCenterZ = -deckHalfLen + frontFixedLength / 2;
  const rearTiltEdgeZ = tiltDeckCenterZ + tiltDeckLength / 2;
  const beavertailLength = 27;

  const hp = (name: string) => ({
    onPointerOver: (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
      onPartHover(name);
    },
    onPointerOut: onPartLeave,
  });

  return (
    <group>
      {/* Main lower rails */}
      {/* Left Main Rail — front 80% only, rear 20% removed (tilts with deck) */}
      <mesh
        position={[
          leftEdge,
          lowerRailCenterY,
          -deckHalfLen + (dims.deckLength * 0.8) / 2,
        ]}
        material={frameMaterial}
        castShadow
        receiveShadow
        {...hp("Left Main Rail")}
      >
        <boxGeometry
          args={[
            dims.lowerRailWidth,
            dims.lowerRailHeight,
            dims.deckLength * 0.8,
          ]}
        />
      </mesh>
      <mesh
        position={[rightEdge, lowerRailCenterY, 0]}
        material={frameMaterial}
        castShadow
        receiveShadow
        {...hp("Right Main Rail")}
      >
        <boxGeometry
          args={[dims.lowerRailWidth, dims.lowerRailHeight, dims.deckLength]}
        />
      </mesh>

      {/* Upper rails / rub rails */}
      {/* Left Rub Rail — front 20% static; rear 80% tilts with deck (in tilt group) */}
      <mesh
        position={[
          leftEdge + 1.5,
          upperRailCenterY,
          -deckHalfLen + frontFixedLength / 2,
        ]}
        material={frameWearMaterial}
        castShadow
        {...hp("Left Rub Rail")}
      >
        <boxGeometry args={[3, dims.upperRailSize, frontFixedLength]} />
      </mesh>
      <mesh
        position={[rightEdge - 1.5, upperRailCenterY, 0]}
        material={frameWearMaterial}
        castShadow
        {...hp("Right Rub Rail")}
      >
        <boxGeometry args={[3, dims.upperRailSize, dims.deckLength]} />
      </mesh>

      {/* Crossmembers — first 60% of deck only */}
      {Array.from({ length: crossCount }).map((_, i) => {
        const z = -deckHalfLen + 6 + i * 12;
        if (z > -deckHalfLen + dims.deckLength * 0.6) return null;
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

      {/* Reflector stripes — left front 20% static, left rear 80% in tilt group, right full length */}
      <SideReflectorStrip
        x={leftEdge - 0.1}
        y={dims.deckHeight - 7}
        zStart={-deckHalfLen + 18}
        zEnd={-deckHalfLen + frontFixedLength}
        xOffset={1}
        onPartHover={onPartHover}
        onPartLeave={onPartLeave}
      />
      <SideReflectorStrip
        x={rightEdge + 0.1}
        y={dims.deckHeight - 7}
        zStart={-deckHalfLen + 18}
        zEnd={deckHalfLen - 10}
        xOffset={2}
        onPartHover={onPartHover}
        onPartLeave={onPartLeave}
      />

      {/* Stationary deck frame top surface */}
      <mesh
        position={[stationaryCenter, frameTopY + 2.8, 0]}
        material={frameMaterial}
        castShadow
        receiveShadow
        {...hp("Stationary Deck Frame")}
      >
        <boxGeometry args={[dims.stationaryDeckWidth, 0.2, dims.deckLength]} />
      </mesh>

      {/* Stationary deck — front 60% wood planks, rear 40% metal box */}
      {(() => {
        const woodLength = dims.deckLength * 0.6;
        const metalLength = dims.deckLength * 0.4;
        const woodCenterZ = -deckHalfLen + woodLength / 2;
        const metalCenterZ = -deckHalfLen + woodLength + metalLength / 2;
        const plankY = dims.deckHeight - dims.plankThickness / 2 + 0.015;
        const metalBoxHeight = dims.lowerRailHeight;
        const metalBoxCenterY = frameTopY - metalBoxHeight / 2;
        return (
          <>
            {/* Front 60% — black border backing */}
            <mesh
              position={[stationaryCenter, plankY - 0.1, woodCenterZ]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[
                  dims.stationaryDeckWidth,
                  dims.plankThickness * 0.25,
                  woodLength,
                ]}
              />
            </mesh>

            {/* Front 60% — left metal border */}
            <mesh
              position={[
                stationaryCenter -
                  dims.stationaryDeckWidth / 2 +
                  stationaryGap / 2,
                plankY,
                woodCenterZ,
              ]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[stationaryGap * 2, dims.plankThickness, woodLength]}
              />
            </mesh>

            {/* Front 60% — right metal border */}
            <mesh
              position={[
                stationaryCenter +
                  dims.stationaryDeckWidth / 2 -
                  stationaryGap / 2,
                plankY,
                woodCenterZ,
              ]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[stationaryGap * 2, dims.plankThickness, woodLength]}
              />
            </mesh>

            {/* Front 60% — front metal border */}
            <mesh
              position={[stationaryCenter, plankY, -deckHalfLen + 1.5]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[dims.stationaryDeckWidth, dims.plankThickness, 3]}
              />
            </mesh>

            {/* Front 60% — back metal border */}
            <mesh
              position={[
                stationaryCenter,
                plankY,
                -deckHalfLen + woodLength - 1.5,
              ]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[dims.stationaryDeckWidth, dims.plankThickness, 3]}
              />
            </mesh>

            {/* Front 60% — wood planks */}
            {Array.from({ length: stationaryPlankCount }).map((_, i) => {
              const x =
                stationaryCenter -
                dims.stationaryDeckWidth / 2 +
                stationaryPlankWidth / 2 +
                i * (stationaryPlankWidth + stationaryGap);
              const innerWoodLength = woodLength - 6;
              const innerWoodCenterZ = -deckHalfLen + 3 + innerWoodLength / 2;
              return (
                <mesh
                  key={`stationary-wood-${i}`}
                  position={[x, plankY, innerWoodCenterZ]}
                  material={woodPlanks[i % woodPlanks.length]}
                  castShadow
                  receiveShadow
                  {...hp("Deck Plank (Stationary)")}
                >
                  <boxGeometry
                    args={[
                      stationaryPlankWidth,
                      dims.plankThickness,
                      innerWoodLength,
                    ]}
                  />
                </mesh>
              );
            })}

            {/* Rear 40% — black metal box with rail height */}
            <mesh
              position={[stationaryCenter, metalBoxCenterY + 2.8, metalCenterZ]}
              material={frameMaterial}
              castShadow
              receiveShadow
              {...hp("Stationary Deck Surface (Metal)")}
            >
              <boxGeometry
                args={[dims.stationaryDeckWidth, metalBoxHeight, metalLength]}
              />
            </mesh>
          </>
        );
      })()}

      {/* Front fixed section frame top surface */}
      <mesh
        position={[tiltCenter, frameTopY + 0.01, frontFixedCenterZ]}
        material={frameMaterial}
        castShadow
        receiveShadow
        {...hp("Front Fixed Deck Frame")}
      >
        <boxGeometry args={[dims.tiltDeckWidth, 0.2, frontFixedLength]} />
      </mesh>

      {/* Front fixed section on the tilting side (non-tilting 20%) — wood with all-around metal border */}
      {(() => {
        const fixedPlankY = dims.deckHeight - dims.plankThickness / 2 + 0.015;
        const borderW = tiltGap * 2;
        return (
          <>
            {/* Left border */}
            <mesh
              position={[
                tiltCenter - dims.tiltDeckWidth / 2 + tiltGap / 2,
                fixedPlankY,
                frontFixedCenterZ,
              ]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[borderW, dims.plankThickness, frontFixedLength]}
              />
            </mesh>
            {/* Right border */}
            <mesh
              position={[
                tiltCenter + dims.tiltDeckWidth / 2 - tiltGap / 2,
                fixedPlankY,
                frontFixedCenterZ,
              ]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[borderW, dims.plankThickness, frontFixedLength]}
              />
            </mesh>
            {/* Front border */}
            <mesh
              position={[tiltCenter, fixedPlankY, -deckHalfLen + 1.5]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[dims.tiltDeckWidth, dims.plankThickness, 3]}
              />
            </mesh>
            {/* Back border */}
            <mesh
              position={[
                tiltCenter,
                fixedPlankY,
                -deckHalfLen + frontFixedLength - 1.5,
              ]}
              material={frameMaterial}
              castShadow
              receiveShadow
            >
              <boxGeometry
                args={[dims.tiltDeckWidth, dims.plankThickness, 3]}
              />
            </mesh>
            {/* Wood planks */}
            {Array.from({ length: tiltPlankCount }).map((_, i) => {
              const x =
                tiltCenter -
                dims.tiltDeckWidth / 2 +
                tiltPlankWidth / 2 +
                i * (tiltPlankWidth + tiltGap);
              const innerLength = frontFixedLength - 6;
              const innerCenterZ = -deckHalfLen + 3 + innerLength / 2;
              return (
                <mesh
                  key={`tilt-front-fixed-${i}`}
                  position={[x, fixedPlankY, innerCenterZ]}
                  material={woodPlanks[(i + 2) % woodPlanks.length]}
                  castShadow
                  receiveShadow
                  {...hp("Deck Plank (Front Fixed)")}
                >
                  <boxGeometry
                    args={[tiltPlankWidth, dims.plankThickness, innerLength]}
                  />
                </mesh>
              );
            })}
          </>
        );
      })()}

      {/* Raised center stripe between decks seen in references */}
      <mesh
        position={[0, dims.deckHeight - 1.35, -22]}
        material={deckStripeMaterial}
        castShadow
        {...hp("Center Deck Stripe")}
      >
        <boxGeometry args={[2.2, 0.55, dims.deckLength - 125]} />
      </mesh>

      {/* Tilt deck assembly */}
      <group
        position={[tiltPivotX, dims.deckHeight, tiltPivotZ]}
        rotation={[tiltAngle, 0, 0]}
      >
        {/* Metal frame support structure for tilt deck */}
        <mesh
          position={[0, -2.3, -8]}
          material={frameMaterial}
          castShadow
          {...hp("Tilt Deck Support Structure")}
        >
          <boxGeometry args={[dims.tiltDeckWidth * 0.45, 2.1, 2.2]} />
        </mesh>

        {/* Tilt deck frame top surface - positioned slightly below wood planks */}
        <mesh
          position={[
            0,
            -(dims.plankThickness + 0.02),
            tiltDeckCenterZ - tiltPivotZ,
          ]}
          material={frameMaterial}
          castShadow
          receiveShadow
          {...hp("Tilt Deck Frame")}
        >
          <boxGeometry args={[dims.tiltDeckWidth, 0.2, tiltDeckLength]} />
        </mesh>

        {/* Wood planks - with all-around metal border */}
        {/* Left border */}
        <mesh
          position={[
            -dims.tiltDeckWidth / 2 + tiltGap / 2,
            -(dims.plankThickness / 2) + 0.015,
            tiltDeckCenterZ - tiltPivotZ,
          ]}
          material={frameMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[tiltGap * 2, dims.plankThickness, tiltDeckLength]}
          />
        </mesh>
        {/* Right border */}
        <mesh
          position={[
            dims.tiltDeckWidth / 2 - tiltGap / 2,
            -(dims.plankThickness / 2) + 0.015,
            tiltDeckCenterZ - tiltPivotZ,
          ]}
          material={frameMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[tiltGap * 2, dims.plankThickness, tiltDeckLength]}
          />
        </mesh>
        {/* Front border */}
        <mesh
          position={[
            0,
            -(dims.plankThickness / 2) + 0.015,
            tiltDeckCenterZ - tiltPivotZ - tiltDeckLength / 2 + 1.5,
          ]}
          material={frameMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[dims.tiltDeckWidth, dims.plankThickness, 3]} />
        </mesh>
        {/* Rear border */}
        <mesh
          position={[
            0,
            -(dims.plankThickness / 2) + 0.015,
            tiltDeckCenterZ - tiltPivotZ + tiltDeckLength / 2 - 1.5,
          ]}
          material={frameMaterial}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[dims.tiltDeckWidth, dims.plankThickness, 3]} />
        </mesh>

        {Array.from({ length: tiltPlankCount }).map((_, i) => {
          const x =
            -dims.tiltDeckWidth / 2 +
            tiltPlankWidth / 2 +
            i * (tiltPlankWidth + tiltGap);
          const innerTiltLength = tiltDeckLength - 6;

          return (
            <mesh
              key={`tilt-${i}`}
              position={[
                x,
                -(dims.plankThickness / 2) + 0.015,
                tiltDeckCenterZ - tiltPivotZ,
              ]}
              material={woodPlanks[(i + 2) % woodPlanks.length]}
              castShadow
              receiveShadow
              {...hp("Tilt Deck Plank")}
            >
              <boxGeometry
                args={[tiltPlankWidth, dims.plankThickness, innerTiltLength]}
              />
            </mesh>
          );
        })}

        {/* Rear beavertail gate — wedge: thick front, sharp rear */}
        <group
          position={[
            0,
            -0.55,
            rearTiltEdgeZ - tiltPivotZ + beavertailLength / 2,
          ]}
        >
          <mesh
            material={frameMaterial}
            castShadow
            receiveShadow
            {...hp("Beavertail")}
            geometry={(() => {
              const w = dims.tiltDeckWidth / 2;
              const L = beavertailLength / 2;
              const fH = 2.2; // front half-height (thick)
              const rH = 0.05; // rear half-height (sharp)
              const verts = new Float32Array([
                -w,
                -fH,
                -L,
                w,
                -fH,
                -L,
                w,
                fH,
                -L,
                -w,
                fH,
                -L,
                -w,
                -rH,
                L,
                w,
                -rH,
                L,
                w,
                rH,
                L,
                -w,
                rH,
                L,
              ]);
              const idx = [
                0, 1, 2, 0, 2, 3, 5, 4, 7, 5, 7, 6, 4, 5, 1, 4, 1, 0, 3, 2, 6,
                3, 6, 7, 4, 0, 3, 4, 3, 7, 1, 5, 6, 1, 6, 2,
              ];
              const geo = new THREE.BufferGeometry();
              geo.setAttribute("position", new THREE.BufferAttribute(verts, 3));
              geo.setIndex(idx);
              geo.computeVertexNormals();
              return geo;
            })()}
          />
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
        </group>

        {/* Left Rub Rail — rear 80% tilts with deck */}
        <mesh
          position={[
            1.5 - dims.tiltDeckWidth / 2,
            -dims.plankThickness + dims.upperRailSize / 2,
            tiltDeckCenterZ - tiltPivotZ,
          ]}
          material={frameWearMaterial}
          castShadow
          {...hp("Left Rub Rail")}
        >
          <boxGeometry args={[3, dims.upperRailSize, tiltDeckLength]} />
        </mesh>

        {/* Left side reflector strip — rear 80% tilts with deck */}
        <SideReflectorStrip
          x={leftEdge - 1 - tiltPivotX}
          y={-7}
          zStart={-deckHalfLen + frontFixedLength - tiltPivotZ}
          zEnd={deckHalfLen - 10 - tiltPivotZ}
          xOffset={1}
          onPartHover={onPartHover}
          onPartLeave={onPartLeave}
        />

        {/* Left fender — tilts with deck. All coords are pivot-relative (local to tilt group) */}
        {(() => {
          const fW = dims.tireWidth + 7;
          const fThick = 1.4;
          const topYWorld = axleCenterY + dims.tireRadius + 5;
          const topYLocal = topYWorld - dims.deckHeight;
          const rubRailTopYWorld = upperRailCenterY + dims.upperRailSize / 2;
          const dropH = topYWorld - rubRailTopYWorld;
          const horizLen = 10;
          const hyp = Math.sqrt(dropH * dropH + horizLen * horizLen);
          const ang = Math.atan2(dropH, horizLen);
          const skirtCenterYLocal = topYLocal - dropH / 2;
          const fzFrontLocal =
            dims.axleCenterZ -
            dims.axleSpacing / 2 -
            dims.tireRadius +
            10 -
            20 -
            tiltPivotZ;
          const fzRearLocal =
            dims.axleCenterZ +
            dims.axleSpacing / 2 +
            dims.tireRadius -
            10 -
            20 -
            tiltPivotZ;
          const fTopLen = fzRearLocal - fzFrontLocal;
          const fCenterZLocal = (fzFrontLocal + fzRearLocal) / 2;
          // Shift inward so outer fender edge ≈ outer tire edge, inner side covers frame
          const xLocal =
            -dims.wheelTrackHalf + fW / 2 - dims.tireWidth / 2 - 2 - tiltPivotX;
          return (
            <>
              {/* Flat top plate */}
              <mesh
                position={[xLocal, topYLocal, fCenterZLocal]}
                material={frameMaterial}
                castShadow
                receiveShadow
                {...hp("Fender")}
              >
                <boxGeometry args={[fW, fThick, fTopLen]} />
              </mesh>
              {/* Front lip */}
              <mesh
                position={[
                  xLocal,
                  skirtCenterYLocal,
                  fzFrontLocal - horizLen / 2,
                ]}
                rotation={[-ang, 0, 0]}
                material={frameMaterial}
                castShadow
                receiveShadow
                {...hp("Fender")}
              >
                <boxGeometry args={[fW, fThick, hyp]} />
              </mesh>
              {/* Rear lip */}
              <mesh
                position={[
                  xLocal,
                  skirtCenterYLocal,
                  fzRearLocal + horizLen / 2,
                ]}
                rotation={[ang, 0, 0]}
                material={frameMaterial}
                castShadow
                receiveShadow
                {...hp("Fender")}
              >
                <boxGeometry args={[fW, fThick, hyp]} />
              </mesh>
            </>
          );
        })()}

        {/* Left tail light — tilts with deck */}
        {(() => {
          const boxW = 10;
          const boxH = 14;
          const boxDepth = 6;
          const wall = 0.65;
          const lightY = dims.deckHeight - 8;
          const localX = leftEdge - 11 - tiltPivotX;
          const localY = lightY + 5 - dims.deckHeight;
          const localZ = deckHalfLen - 5 - tiltPivotZ;
          return (
            <group
              position={[localX, localY, localZ]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <mesh
                position={[0, 0, boxDepth / 2]}
                material={tailLightBaseMaterial}
                castShadow
                receiveShadow
                {...hp("Tail Light Housing")}
              >
                <boxGeometry args={[boxW, boxH, boxDepth]} />
              </mesh>
              <mesh
                position={[0, 0, boxDepth + wall / 2]}
                material={hardwareSteelMaterial}
                castShadow
                {...hp("Tail Light Bracket")}
              >
                <boxGeometry args={[boxW + 1.6, boxH + 1.6, wall]} />
              </mesh>
              <mesh
                position={[0, boxH / 2 + 1.4, boxDepth * 0.35]}
                material={hardwareSteelMaterial}
                castShadow
                {...hp("Tail Light Bracket")}
              >
                <boxGeometry args={[boxW - 0.5, 2.2, boxDepth * 0.65]} />
              </mesh>
              <mesh
                position={[0, -(boxH / 2 + 1.4), boxDepth * 0.35]}
                material={hardwareSteelMaterial}
                castShadow
                {...hp("Tail Light Bracket")}
              >
                <boxGeometry args={[boxW - 0.5, 2.2, boxDepth * 0.65]} />
              </mesh>
              {[-3.2, 3.2].map((bx, bi) =>
                [boxH / 2 + 1.0, -(boxH / 2 + 1.0)].map((by, bj) => (
                  <mesh
                    key={`ltbolt-${bi}-${bj}`}
                    position={[bx, by, 0]}
                    material={chainMaterial}
                    castShadow
                    {...hp("Mounting Bolt")}
                  >
                    <cylinderGeometry args={[0.36, 0.36, 0.55, 10]} />
                  </mesh>
                )),
              )}
              <group position={[0, 3.6, boxDepth + 0.15]}>
                <mesh
                  scale={[3.8, 5.0, 0.6]}
                  material={tailLightBaseMaterial}
                  {...hp("Tail Light Housing")}
                >
                  <sphereGeometry args={[1, 28, 18]} />
                </mesh>
                <mesh
                  scale={[3.2, 4.3, 0.55]}
                  position={[0, 0, 0.28]}
                  material={tailLightLensMaterial}
                  {...hp("Tail Light Lens")}
                >
                  <sphereGeometry args={[1, 28, 18]} />
                </mesh>
                <mesh
                  scale={[2.0, 2.9, 0.38]}
                  position={[0, 0, 0.52]}
                  material={tailLightMaterial}
                  {...hp("Tail Light LED")}
                >
                  <sphereGeometry args={[1, 20, 14]} />
                </mesh>
              </group>
              <group position={[0, -3.6, boxDepth + 0.15]}>
                <mesh
                  scale={[3.8, 5.0, 0.6]}
                  material={tailLightBaseMaterial}
                  {...hp("Tail Light Housing")}
                >
                  <sphereGeometry args={[1, 28, 18]} />
                </mesh>
                <mesh
                  scale={[3.2, 4.3, 0.55]}
                  position={[0, 0, 0.28]}
                  material={tailLightLensMaterial}
                  {...hp("Tail Light Lens")}
                >
                  <sphereGeometry args={[1, 28, 18]} />
                </mesh>
                <mesh
                  scale={[2.0, 2.9, 0.38]}
                  position={[0, 0, 0.52]}
                  material={tailLightMaterial}
                  {...hp("Tail Light LED")}
                >
                  <sphereGeometry args={[1, 20, 14]} />
                </mesh>
              </group>
              <mesh
                position={[1.5, -(boxH / 2 + 3.5), boxDepth * 0.42]}
                material={reflectorRedMaterial}
                {...hp("Rear Reflector Strip")}
              >
                <boxGeometry args={[boxW + 3.0, 2.2, boxDepth * 0.75]} />
              </mesh>
              <mesh
                position={[1.5, -(boxH / 2 + 3.5), boxDepth * 0.42 + 0.14]}
                material={reflectorWhiteMaterial}
                {...hp("Rear Reflector Strip")}
              >
                <boxGeometry args={[boxW + 3.0, 0.9, boxDepth * 0.75 - 0.28]} />
              </mesh>
            </group>
          );
        })()}
      </group>
      {Array.from({ length: Math.floor((dims.deckLength - 24) / 24) }).map(
        (_, i) => {
          const z = -deckHalfLen + 20 + i * 24;
          return (
            <group key={`stake-${i}`}>
              <mesh
                position={[leftEdge + 1.4, frameTopY - 0.25, z]}
                material={frameMaterial}
                castShadow
                {...hp("Stake Pocket")}
              >
                <boxGeometry args={[1.1, 3, 2.4]} />
              </mesh>
              <mesh
                position={[rightEdge - 1.4, frameTopY - 0.25, z]}
                material={frameMaterial}
                castShadow
                {...hp("Stake Pocket")}
              >
                <boxGeometry args={[1.1, 3, 2.4]} />
              </mesh>
            </group>
          );
        },
      )}

      {/* Axles and wheels */}
      {[
        dims.axleCenterZ - dims.axleSpacing / 2 - 20,
        dims.axleCenterZ + dims.axleSpacing / 2 - 20,
      ].map((z, idx) => (
        <group key={`axle-${idx}`} position={[0, axleCenterY, z]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            material={frameMaterial}
            castShadow
            {...hp("Axle Shaft")}
          >
            <cylinderGeometry args={[1.35, 1.35, 84, 20]} />
          </mesh>
          {[-dims.wheelTrackHalf, dims.wheelTrackHalf].map((x, wheelIdx) => (
            <group key={wheelIdx} position={[x, 0, 0]}>
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

      {/* Straight fender — right side (static), flat top + angled front/rear lips to rub rail */}
      {(() => {
        const fW = dims.tireWidth + 7;
        const fThick = 1.4;
        const topY = axleCenterY + dims.tireRadius + 5;
        const fzFront =
          dims.axleCenterZ - dims.axleSpacing / 2 - dims.tireRadius + 10 - 20;
        const fzRear =
          dims.axleCenterZ + dims.axleSpacing / 2 + dims.tireRadius - 10 - 20;
        const fTopLen = fzRear - fzFront;
        const fCenterZ = (fzFront + fzRear) / 2;
        const rubRailTopY = upperRailCenterY + dims.upperRailSize / 2;
        const dropH = topY - rubRailTopY;
        const horizLen = 10;
        const hyp = Math.sqrt(dropH * dropH + horizLen * horizLen);
        const ang = Math.atan2(dropH, horizLen);
        const skirtCenterY = topY - dropH / 2;
        // Shift inward so outer fender edge ≈ outer tire edge, inner side covers frame
        const x = dims.wheelTrackHalf - fW / 2 + dims.tireWidth / 2 + 2;
        return (
          <>
            {/* Flat top plate */}
            <mesh
              position={[x, topY, fCenterZ]}
              material={frameMaterial}
              castShadow
              receiveShadow
              {...hp("Fender")}
            >
              <boxGeometry args={[fW, fThick, fTopLen]} />
            </mesh>
            {/* Front lip — angles down and forward to rub rail */}
            <mesh
              position={[x, skirtCenterY, fzFront - horizLen / 2]}
              rotation={[-ang, 0, 0]}
              material={frameMaterial}
              castShadow
              receiveShadow
              {...hp("Fender")}
            >
              <boxGeometry args={[fW, fThick, hyp]} />
            </mesh>
            {/* Rear lip — angles down and rearward to rub rail */}
            <mesh
              position={[x, skirtCenterY, fzRear + horizLen / 2]}
              rotation={[ang, 0, 0]}
              material={frameMaterial}
              castShadow
              receiveShadow
              {...hp("Fender")}
            >
              <boxGeometry args={[fW, fThick, hyp]} />
            </mesh>
          </>
        );
      })()}

      {/* Rear tail light assemblies — right side only; left is in tilt group */}
      {[leftEdge + 5, rightEdge - 5].map((cx, idx) => {
        if (idx === 0) return null; // left tail light tilts with deck
        const boxW = 10;
        const boxH = 14;
        const boxDepth = 6;
        const wall = 0.65;
        const lightY = dims.deckHeight - 8;

        return (
          <group
            key={`tail-asm-${idx}`}
            position={[
              cx + (idx === 0 ? -16 : 16),
              lightY + 5,
              deckHalfLen - 5,
            ]}
            rotation={[0, 0, idx === 0 ? Math.PI / 2 : -Math.PI / 2]}
          >
            {/* Main steel housing box — matte black, protrudes rearward */}
            <mesh
              position={[0, 0, boxDepth / 2]}
              material={tailLightBaseMaterial}
              castShadow
              receiveShadow
              {...hp("Tail Light Housing")}
            >
              <boxGeometry args={[boxW, boxH, boxDepth]} />
            </mesh>

            {/* Front bezel / rim plate — slightly proud of housing face */}
            <mesh
              position={[0, 0, boxDepth + wall / 2]}
              material={hardwareSteelMaterial}
              castShadow
              {...hp("Tail Light Bracket")}
            >
              <boxGeometry args={[boxW + 1.6, boxH + 1.6, wall]} />
            </mesh>

            {/* Mounting bracket — top */}
            <mesh
              position={[0, boxH / 2 + 1.4, boxDepth * 0.35]}
              material={hardwareSteelMaterial}
              castShadow
              {...hp("Tail Light Bracket")}
            >
              <boxGeometry args={[boxW - 0.5, 2.2, boxDepth * 0.65]} />
            </mesh>

            {/* Mounting bracket — bottom */}
            <mesh
              position={[0, -(boxH / 2 + 1.4), boxDepth * 0.35]}
              material={hardwareSteelMaterial}
              castShadow
              {...hp("Tail Light Bracket")}
            >
              <boxGeometry args={[boxW - 0.5, 2.2, boxDepth * 0.65]} />
            </mesh>

            {/* Corner mounting bolts */}
            {[-3.2, 3.2].map((bx, bi) =>
              [boxH / 2 + 1.0, -(boxH / 2 + 1.0)].map((by, bj) => (
                <mesh
                  key={`bolt-${bi}-${bj}`}
                  position={[bx, by, 0]}
                  material={chainMaterial}
                  castShadow
                  {...hp("Mounting Bolt")}
                >
                  <cylinderGeometry args={[0.36, 0.36, 0.55, 10]} />
                </mesh>
              )),
            )}

            {/* Top oval LED tail light */}
            <group position={[0, 3.6, boxDepth + 0.15]}>
              {/* Outer housing rim */}
              <mesh
                scale={[3.8, 5.0, 0.6]}
                material={tailLightBaseMaterial}
                {...hp("Tail Light Housing")}
              >
                <sphereGeometry args={[1, 28, 18]} />
              </mesh>
              {/* Red lens */}
              <mesh
                scale={[3.2, 4.3, 0.55]}
                position={[0, 0, 0.28]}
                material={tailLightLensMaterial}
                {...hp("Tail Light Lens")}
              >
                <sphereGeometry args={[1, 28, 18]} />
              </mesh>
              {/* LED emitter core */}
              <mesh
                scale={[2.0, 2.9, 0.38]}
                position={[0, 0, 0.52]}
                material={tailLightMaterial}
                {...hp("Tail Light LED")}
              >
                <sphereGeometry args={[1, 20, 14]} />
              </mesh>
            </group>

            {/* Bottom oval LED tail light */}
            <group position={[0, -3.6, boxDepth + 0.15]}>
              {/* Outer housing rim */}
              <mesh
                scale={[3.8, 5.0, 0.6]}
                material={tailLightBaseMaterial}
                {...hp("Tail Light Housing")}
              >
                <sphereGeometry args={[1, 28, 18]} />
              </mesh>
              {/* Red lens */}
              <mesh
                scale={[3.2, 4.3, 0.55]}
                position={[0, 0, 0.28]}
                material={tailLightLensMaterial}
                {...hp("Tail Light Lens")}
              >
                <sphereGeometry args={[1, 28, 18]} />
              </mesh>
              {/* LED emitter core */}
              <mesh
                scale={[2.0, 2.9, 0.38]}
                position={[0, 0, 0.52]}
                material={tailLightMaterial}
                {...hp("Tail Light LED")}
              >
                <sphereGeometry args={[1, 20, 14]} />
              </mesh>
            </group>

            {/* Horizontal reflective strip below housing */}
            <mesh
              position={[1.5, -(boxH / 2 + 3.5), boxDepth * 0.42]}
              material={reflectorRedMaterial}
              {...hp("Rear Reflector Strip")}
            >
              <boxGeometry args={[boxW + 3.0, 2.2, boxDepth * 0.75]} />
            </mesh>
            <mesh
              position={[1.5, -(boxH / 2 + 3.5), boxDepth * 0.42 + 0.14]}
              material={reflectorWhiteMaterial}
              {...hp("Rear Reflector Strip")}
            >
              <boxGeometry args={[boxW + 3.0, 0.9, boxDepth * 0.75 - 0.28]} />
            </mesh>
          </group>
        );
      })}

      {/* A-frame tongue with 50-60 degree included angle */}
      {[-1, 1].map((side) => (
        <mesh
          key={`tongue-beam-${side}`}
          position={[
            side * tongueBeamSpreadX,
            frameTopY - 2.1,
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

      {/* Front gusset plate */}
      <mesh
        position={[0, frameTopY - 2.0, hitchPlateZ + 7.6]}
        material={hardwareSteelMaterial}
        castShadow
        {...hp("Gusset Plate")}
      >
        <boxGeometry args={[6.8, 4.8, 0.7]} />
      </mesh>

      {/* Breakaway cable as a coiled blue tube */}
      <mesh
        material={breakawayCableMaterial}
        castShadow
        {...hp("Breakaway Cable")}
      >
        <tubeGeometry args={[breakawayCableCurve, 120, 0.13, 10, false]} />
      </mesh>

      {/* Vertical drop-leg jack with crank handle */}
      <group position={[-7, -7, jackCenterZ - 10]} rotation={[0, Math.PI, 0]}>
        <mesh
          position={[0, jackSleeveCenterY, 0]}
          material={hardwareSteelMaterial}
          castShadow
          {...hp("Jack Sleeve")}
        >
          <boxGeometry
            args={[jackSleeveWidth, jackSleeveHeight, jackSleeveWidth]}
          />
        </mesh>
        <mesh
          position={[0, jackInnerCenterY, 0]}
          material={frameWearMaterial}
          castShadow
          {...hp("Jack Inner Leg")}
        >
          <boxGeometry
            args={[jackInnerWidth, jackInnerHeight, jackInnerWidth]}
          />
        </mesh>
        <mesh
          position={[0, jackFootCenterY, 0]}
          material={hardwareSteelMaterial}
          castShadow
          {...hp("Jack Foot Plate")}
        >
          <boxGeometry args={[jackFootSize, 0.4, jackFootSize]} />
        </mesh>

        {/* Crank shaft */}
        <mesh
          position={[jackSleeveWidth / 2 + 1.5, jackSleeveCenterY + 4.4, 0]}
          rotation={[0, 0, Math.PI / 2]}
          material={frameMaterial}
          castShadow
          {...hp("Jack Crank Shaft")}
        >
          <cylinderGeometry args={[0.21, 0.21, 4.8, 12]} />
        </mesh>

        {/* Crank grip */}
        <mesh
          position={[jackSleeveWidth / 2 + 4, jackSleeveCenterY + 4.4, 0]}
          rotation={[Math.PI / 2, 0, Math.PI / 2]}
          material={frameWearMaterial}
          castShadow
          {...hp("Jack Crank Handle")}
        >
          <capsuleGeometry args={[0.42, 1.8, 8, 14]} />
        </mesh>
      </group>

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

      {/* Optional equipment from references */}
      {showOptionalEquipment && (
        <group>
          {/* Toolbox */}
          <mesh
            position={[
              stationaryCenter + 1,
              dims.deckHeight + 7.2,
              deckHalfLen - 15,
            ]}
            rotation={[0, Math.PI / 2, 0]}
            material={frameWearMaterial}
            castShadow
            {...hp("Toolbox")}
          >
            <boxGeometry args={[26, 12, 18]} />
          </mesh>
          <mesh
            position={[
              stationaryCenter + 1,
              dims.deckHeight + 13.6,
              deckHalfLen - 15,
            ]}
            rotation={[0, Math.PI / 2, 0]}
            material={frameMaterial}
            castShadow
            {...hp("Toolbox Lid")}
          >
            <boxGeometry args={[27, 1.3, 19]} />
          </mesh>

          {/* Blue hose reel */}
          <group
            position={[
              stationaryCenter + 5,
              dims.deckHeight + 8,
              -deckHalfLen + dims.frontDeckLength - 35,
            ]}
          >
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              material={blueReelMaterial}
              castShadow
              {...hp("Hose Reel")}
            >
              <cylinderGeometry args={[4.8, 4.8, 7.4, 24]} />
            </mesh>
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0, -3.9]}
              material={blueReelMaterial}
              castShadow
              {...hp("Hose Reel Flange")}
            >
              <cylinderGeometry args={[7.5, 7.5, 0.7, 22]} />
            </mesh>
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0, 3.9]}
              material={blueReelMaterial}
              castShadow
              {...hp("Hose Reel Flange")}
            >
              <cylinderGeometry args={[7.5, 7.5, 0.7, 22]} />
            </mesh>
          </group>
        </group>
      )}
    </group>
  );
}

function TrailerModel({
  frontDeckLengthFt,
  axleRating,
  deckWood,
  hitchType,
  tiltSide,
  tiltAngleDeg,
  showOptionalEquipment,
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
    | "tiltSide"
    | "tiltAngleDeg"
    | "showOptionalEquipment"
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
        tiltSide={tiltSide}
        tiltAngleDeg={tiltAngleDeg}
        deckWood={deckWood}
        showOptionalEquipment={showOptionalEquipment}
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
  tiltSide = "driver",
  tiltAngleDeg = 13,
  cameraView = "perspective",
  showOptionalEquipment = true,
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
              tiltSide={tiltSide}
              tiltAngleDeg={tiltAngleDeg}
              showOptionalEquipment={showOptionalEquipment}
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
                tiltSide={tiltSide}
                tiltAngleDeg={tiltAngleDeg}
                showOptionalEquipment={showOptionalEquipment}
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
