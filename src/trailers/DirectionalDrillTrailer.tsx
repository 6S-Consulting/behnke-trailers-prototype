import { useMemo, useRef, useState } from "react";
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
      ? { tireRadius: 15.2, tireWidth: 8.5 }
      : { tireRadius: 16.2, tireWidth: 9.2 };

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
    plankThickness: deckWood === "white-oak" ? 1.6875 : 1.5,
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
  return null;
}

function SideReflectorStrip({
  x,
  y,
  zStart,
  zEnd,
}: {
  x: number;
  y: number;
  zStart: number;
  zEnd: number;
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
          <mesh key={i} position={[x, y, z]} material={material}>
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
}: {
  tireRadius: number;
  tireWidth: number;
}) {
  return (
    <group>
      <mesh
        rotation={[0, 0, Math.PI / 2]}
        material={rubberMaterial}
        castShadow
        receiveShadow
      >
        <cylinderGeometry args={[tireRadius, tireRadius, tireWidth, 38]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={rimMaterial} castShadow>
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
}: {
  dims: TrailerDimensions;
  tiltSide: TiltSide;
  tiltAngleDeg: number;
  deckWood: DeckWood;
  showOptionalEquipment: boolean;
  hitchType: HitchType;
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

  const tongueBaseZ = -deckHalfLen;
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
  const jackFootSize = 7.9;
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

  return (
    <group>
      {/* Main lower rails */}
      <mesh
        position={[leftEdge, lowerRailCenterY, 0]}
        material={frameMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[dims.lowerRailWidth, dims.lowerRailHeight, dims.deckLength]}
        />
      </mesh>
      <mesh
        position={[rightEdge, lowerRailCenterY, 0]}
        material={frameMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[dims.lowerRailWidth, dims.lowerRailHeight, dims.deckLength]}
        />
      </mesh>

      {/* Upper rails / rub rails */}
      <mesh
        position={[leftEdge + 1.5, upperRailCenterY, 0]}
        material={frameWearMaterial}
        castShadow
      >
        <boxGeometry args={[3, dims.upperRailSize, dims.deckLength]} />
      </mesh>
      <mesh
        position={[rightEdge - 1.5, upperRailCenterY, 0]}
        material={frameWearMaterial}
        castShadow
      >
        <boxGeometry args={[3, dims.upperRailSize, dims.deckLength]} />
      </mesh>

      {/* Crossmembers */}
      {Array.from({ length: crossCount }).map((_, i) => {
        const z = -deckHalfLen + 6 + i * 12;
        return (
          <mesh
            key={i}
            position={[0, frameTopY - dims.crossmemberDepth / 2, z]}
            material={frameMaterial}
            castShadow
          >
            <boxGeometry
              args={[dims.betweenFenders, dims.crossmemberDepth, 1.85]}
            />
          </mesh>
        );
      })}

      {/* Reflector stripes inspired by reference */}
      <SideReflectorStrip
        x={leftEdge + 0.45}
        y={dims.deckHeight - 15.7}
        zStart={-deckHalfLen + 18}
        zEnd={deckHalfLen - 10}
      />
      <SideReflectorStrip
        x={rightEdge - 0.45}
        y={dims.deckHeight - 15.7}
        zStart={-deckHalfLen + 18}
        zEnd={deckHalfLen - 10}
      />

      {/* Stationary deck frame top surface */}
      <mesh
        position={[stationaryCenter, frameTopY + 0.01, 0]}
        material={frameMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[dims.stationaryDeckWidth, 0.2, dims.deckLength]} />
      </mesh>

      {/* Stationary deck planks - elevated 0.015 units above metal frame */}
      {Array.from({ length: stationaryPlankCount }).map((_, i) => {
        const x =
          stationaryCenter -
          dims.stationaryDeckWidth / 2 +
          stationaryPlankWidth / 2 +
          i * (stationaryPlankWidth + stationaryGap);

        return (
          <mesh
            key={`stationary-${i}`}
            position={[x, dims.deckHeight - dims.plankThickness / 2 + 0.015, 0]}
            material={woodPlanks[i % woodPlanks.length]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[
                stationaryPlankWidth,
                dims.plankThickness,
                dims.deckLength,
              ]}
            />
          </mesh>
        );
      })}

      {/* Front fixed section frame top surface */}
      <mesh
        position={[tiltCenter, frameTopY + 0.01, frontFixedCenterZ]}
        material={frameMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[dims.tiltDeckWidth, 0.2, frontFixedLength]} />
      </mesh>

      {/* Front fixed section on the tilting side (non-tilting 20%) */}
      {/* Wood planks elevated 0.015 units above metal frame */}
      {Array.from({ length: tiltPlankCount }).map((_, i) => {
        const x =
          tiltCenter -
          dims.tiltDeckWidth / 2 +
          tiltPlankWidth / 2 +
          i * (tiltPlankWidth + tiltGap);

        return (
          <mesh
            key={`tilt-front-fixed-${i}`}
            position={[
              x,
              dims.deckHeight - dims.plankThickness / 2 + 0.015,
              frontFixedCenterZ,
            ]}
            material={woodPlanks[(i + 2) % woodPlanks.length]}
            castShadow
            receiveShadow
          >
            <boxGeometry
              args={[tiltPlankWidth, dims.plankThickness, frontFixedLength]}
            />
          </mesh>
        );
      })}

      {/* Raised center stripe between decks seen in references */}
      <mesh
        position={[0, dims.deckHeight + 0.35, -22]}
        material={deckStripeMaterial}
        castShadow
      >
        <boxGeometry args={[2.2, 0.55, dims.deckLength - 24]} />
      </mesh>

      {/* Tilt deck assembly */}
      <group
        position={[tiltPivotX, dims.deckHeight, tiltPivotZ]}
        rotation={[tiltAngle, 0, 0]}
      >
        {/* Metal frame support structure for tilt deck */}
        <mesh position={[0, -2.3, -8]} material={frameMaterial} castShadow>
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
        >
          <boxGeometry args={[dims.tiltDeckWidth, 0.2, tiltDeckLength]} />
        </mesh>

        {/* Wood planks - elevated 0.015 units above metal frame */}
        {Array.from({ length: tiltPlankCount }).map((_, i) => {
          const x =
            -dims.tiltDeckWidth / 2 +
            tiltPlankWidth / 2 +
            i * (tiltPlankWidth + tiltGap);

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
            >
              <boxGeometry
                args={[tiltPlankWidth, dims.plankThickness, tiltDeckLength]}
              />
            </mesh>
          );
        })}

        {[-82, -36, 24, 88].map((z, idx) => (
          <mesh
            key={idx}
            rotation={[Math.PI / 2, 0, 0]}
            position={[tiltSign * 21.6, 0.6, z]}
            material={frameMaterial}
            castShadow
          >
            <torusGeometry args={[1.95, 0.45, 10, 18]} />
          </mesh>
        ))}

        {/* Rear beavertail gate aligned with the tilted deck */}
        <group
          position={[
            0,
            -0.55,
            rearTiltEdgeZ - tiltPivotZ + beavertailLength / 2,
          ]}
        >
          <mesh material={frameMaterial} castShadow receiveShadow>
            <boxGeometry args={[dims.tiltDeckWidth, 0.7, beavertailLength]} />
          </mesh>
          {[-8, 0, 8].map((x, i) => (
            <mesh key={i} position={[x, 0.4, 6]} material={frameWearMaterial}>
              <cylinderGeometry args={[1.25, 1.25, 0.72, 18]} />
            </mesh>
          ))}
        </group>
      </group>

      {/* Stake pockets */}
      {Array.from({ length: Math.floor((dims.deckLength - 24) / 24) }).map(
        (_, i) => {
          const z = -deckHalfLen + 20 + i * 24;
          return (
            <group key={`stake-${i}`}>
              <mesh
                position={[leftEdge + 1.4, frameTopY - 0.25, z]}
                material={frameMaterial}
                castShadow
              >
                <boxGeometry args={[1.1, 3, 2.4]} />
              </mesh>
              <mesh
                position={[rightEdge - 1.4, frameTopY - 0.25, z]}
                material={frameMaterial}
                castShadow
              >
                <boxGeometry args={[1.1, 3, 2.4]} />
              </mesh>
            </group>
          );
        },
      )}

      {/* Axles and wheels */}
      {[
        dims.axleCenterZ - dims.axleSpacing / 2,
        dims.axleCenterZ + dims.axleSpacing / 2,
      ].map((z, idx) => (
        <group key={`axle-${idx}`} position={[0, axleCenterY, z]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            material={frameMaterial}
            castShadow
          >
            <cylinderGeometry args={[1.35, 1.35, 84, 20]} />
          </mesh>
          {[-dims.wheelTrackHalf, dims.wheelTrackHalf].map((x, wheelIdx) => (
            <group key={wheelIdx} position={[x, 0, 0]}>
              <Wheel tireRadius={dims.tireRadius} tireWidth={dims.tireWidth} />
            </group>
          ))}
        </group>
      ))}

      {/* Rounded fenders */}
      {[-dims.wheelTrackHalf, dims.wheelTrackHalf].map((x, idx) => (
        <group
          key={`fender-${idx}`}
          position={[x, dims.tireRadius + 11.45, dims.axleCenterZ]}
        >
          <mesh
            rotation={[-Math.PI / 2, -Math.PI / 2, 0]}
            material={frameMaterial}
            castShadow
          >
            <cylinderGeometry
              args={[6.7, 6.7, dims.axleSpacing + 36, 20, 1, true, 0, Math.PI]}
            />
          </mesh>
          <mesh position={[0, -6.5, 0]} material={frameMaterial} castShadow>
            <boxGeometry args={[13.6, 0.9, dims.axleSpacing + 36]} />
          </mesh>
        </group>
      ))}

      {/* Rear LED modules */}
      {[leftEdge + 4, rightEdge - 4].map((x, idx) => (
        <group
          key={`light-${idx}`}
          position={[x, dims.deckHeight - 14, deckHalfLen + 0.95]}
        >
          <mesh position={[0, 2.2, 0]} material={ledMaterial}>
            <boxGeometry args={[4.8, 1.75, 0.85]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={ledMaterial}>
            <boxGeometry args={[4.8, 1.75, 0.85]} />
          </mesh>
        </group>
      ))}

      {/* Rear tail lights - Enhanced realistic design */}
      {[leftEdge, rightEdge].map((x, idx) => (
        <group
          key={`tail-light-${idx}`}
          position={[
            x + (idx === 0 ? 1.2 : -1.2),
            dims.deckHeight - 13,
            deckHalfLen + 0.8,
          ]}
        >
          {/* Mounting bracket */}
          <mesh
            position={[0, 0, -0.4]}
            material={tailLightBaseMaterial}
            castShadow
          >
            <boxGeometry args={[2.8, 6.5, 0.3]} />
          </mesh>

          {/* Top light housing */}
          <group position={[0, 1.8, 0]}>
            {/* Housing base */}
            <mesh
              position={[0, 0, 0]}
              material={tailLightBaseMaterial}
              castShadow
            >
              <boxGeometry args={[2.4, 2.2, 0.8]} />
            </mesh>
            {/* Light lens - rounded rectangle effect */}
            <mesh position={[0, 0, 0.45]} material={tailLightLensMaterial}>
              <boxGeometry args={[2.0, 1.8, 0.3]} />
            </mesh>
            {/* Corner rounds */}
            {[
              [-0.9, 0.8],
              [0.9, 0.8],
              [-0.9, -0.8],
              [0.9, -0.8],
            ].map(([cx, cy], i) => (
              <mesh
                key={i}
                position={[cx, cy, 0.45]}
                material={tailLightLensMaterial}
              >
                <sphereGeometry args={[0.25, 12, 12]} />
              </mesh>
            ))}
            {/* Inner bright LED element */}
            <mesh position={[0, 0, 0.55]} material={tailLightMaterial}>
              <boxGeometry args={[1.4, 1.2, 0.15]} />
            </mesh>
          </group>

          {/* Bottom light housing */}
          <group position={[0, -1.8, 0]}>
            {/* Housing base */}
            <mesh
              position={[0, 0, 0]}
              material={tailLightBaseMaterial}
              castShadow
            >
              <boxGeometry args={[2.4, 2.2, 0.8]} />
            </mesh>
            {/* Light lens - rounded rectangle effect */}
            <mesh position={[0, 0, 0.45]} material={tailLightLensMaterial}>
              <boxGeometry args={[2.0, 1.8, 0.3]} />
            </mesh>
            {/* Corner rounds */}
            {[
              [-0.9, 0.8],
              [0.9, 0.8],
              [-0.9, -0.8],
              [0.9, -0.8],
            ].map(([cx, cy], i) => (
              <mesh
                key={i}
                position={[cx, cy, 0.45]}
                material={tailLightLensMaterial}
              >
                <sphereGeometry args={[0.25, 12, 12]} />
              </mesh>
            ))}
            {/* Inner bright LED element */}
            <mesh position={[0, 0, 0.55]} material={tailLightMaterial}>
              <boxGeometry args={[1.4, 1.2, 0.15]} />
            </mesh>
          </group>
        </group>
      ))}

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
        >
          <boxGeometry
            args={[tongueBeamWidth, tongueBeamHeight, tongueBeamLength]}
          />
        </mesh>
      ))}

      {/* Rear tie plate and front gusset plates */}
      <mesh
        position={[0, frameTopY + 0.6, tongueBaseZ - 14]}
        material={frameWearMaterial}
        castShadow
      >
        <boxGeometry args={[14.5, 2.8, 9.5]} />
      </mesh>
      <mesh
        position={[0, frameTopY - 2.0, hitchPlateZ + 7.6]}
        material={hardwareSteelMaterial}
        castShadow
      >
        <boxGeometry args={[6.8, 4.8, 0.7]} />
      </mesh>

      {/* Safety chains with individual links in a catenary-like hang */}
      {[-1, 1].map((side) => (
        <group key={`safety-chain-${side}`}>
          {Array.from({ length: 14 }).map((_, i) => {
            const t = i / 13;
            const x = side * (4.9 - t * 2.25);
            const y = frameTopY - 4.7 - Math.sin(Math.PI * t) * 3.7 - t * 0.8;
            const z = chainAnchorZ + t * (chainEndZ - chainAnchorZ);

            return (
              <mesh
                key={i}
                position={[x, y, z]}
                rotation={[
                  Math.PI / 2 + (i % 2 === 0 ? 0.2 : -0.2),
                  0,
                  side * (i % 2 === 0 ? 0.48 : -0.48),
                ]}
                material={chainMaterial}
                castShadow
              >
                <torusGeometry args={[0.78, 0.14, 10, 16]} />
              </mesh>
            );
          })}
        </group>
      ))}

      {/* Breakaway cable as a coiled blue tube */}
      <mesh material={breakawayCableMaterial} castShadow>
        <tubeGeometry args={[breakawayCableCurve, 120, 0.13, 10, false]} />
      </mesh>

      {/* Vertical drop-leg jack with crank handle */}
      <group position={[0, 0, jackCenterZ]}>
        <mesh
          position={[0, jackSleeveCenterY, 0]}
          material={hardwareSteelMaterial}
          castShadow
        >
          <boxGeometry
            args={[jackSleeveWidth, jackSleeveHeight, jackSleeveWidth]}
          />
        </mesh>
        <mesh
          position={[0, jackInnerCenterY, 0]}
          material={frameWearMaterial}
          castShadow
        >
          <boxGeometry
            args={[jackInnerWidth, jackInnerHeight, jackInnerWidth]}
          />
        </mesh>
        <mesh
          position={[0, jackFootCenterY, 0]}
          material={hardwareSteelMaterial}
          castShadow
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

      {/* Hitch */}
      {hitchType === "coupler" ? (
        <group position={[0, hitchCenterY, hitchPlateZ]}>
          <mesh material={hardwareSteelMaterial} castShadow>
            <boxGeometry args={[7.8, 8.8, 0.7]} />
          </mesh>
          <mesh
            position={[0, 0, 2.3]}
            rotation={[Math.PI / 2, 0, 0]}
            material={frameMaterial}
            castShadow
          >
            <coneGeometry args={[3.2, 8, 20]} />
          </mesh>
        </group>
      ) : (
        <group position={[0, hitchCenterY, hitchPlateZ]}>
          {/* Adjustable front channel */}
          <mesh material={hardwareSteelMaterial} castShadow>
            <boxGeometry args={[8.4, 12, 1.1]} />
          </mesh>
          {Array.from({ length: 5 }).map((_, i) => (
            <mesh
              key={`channel-hole-${i}`}
              position={[0, -4 + i * 2, 0.58]}
              material={frameWearMaterial}
            >
              <cylinderGeometry args={[0.42, 0.42, 0.22, 16]} />
            </mesh>
          ))}

          {/* Pintle mounting plate and bolt pattern */}
          <mesh position={[0, 0, 0.98]} material={frameMaterial} castShadow>
            <boxGeometry args={[7.9, 9.8, 0.65]} />
          </mesh>
          {[-2.2, 2.2].map((bx) =>
            [-2.8, 2.8].map((by) => (
              <mesh
                key={`bolt-${bx}-${by}`}
                position={[bx, by, 1.28]}
                material={chainMaterial}
                castShadow
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
              stationaryCenter + 4.5,
              dims.deckHeight + 7.2,
              deckHalfLen - 48,
            ]}
            material={frameWearMaterial}
            castShadow
          >
            <boxGeometry args={[26, 12, 18]} />
          </mesh>
          <mesh
            position={[
              stationaryCenter + 4.5,
              dims.deckHeight + 13.6,
              deckHalfLen - 48,
            ]}
            material={frameMaterial}
            castShadow
          >
            <boxGeometry args={[27, 1.3, 19]} />
          </mesh>

          {/* Blue hose reel */}
          <group
            position={[
              stationaryCenter - 7.6,
              dims.deckHeight + 4.2,
              -deckHalfLen + dims.frontDeckLength - 3,
            ]}
          >
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              material={blueReelMaterial}
              castShadow
            >
              <cylinderGeometry args={[4.8, 4.8, 7.4, 24]} />
            </mesh>
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0, -3.9]}
              material={blueReelMaterial}
              castShadow
            >
              <cylinderGeometry args={[7.5, 7.5, 0.7, 22]} />
            </mesh>
            <mesh
              rotation={[Math.PI / 2, 0, 0]}
              position={[0, 0, 3.9]}
              material={blueReelMaterial}
              castShadow
            >
              <cylinderGeometry args={[7.5, 7.5, 0.7, 22]} />
            </mesh>
          </group>

          {/* Boring bar holders */}
          {[-14, -5, 4, 13].map((x, idx) => (
            <mesh
              key={idx}
              position={[
                x,
                dims.deckHeight + 3,
                -deckHalfLen + dims.frontDeckLength - 10,
              ]}
              material={frameMaterial}
              castShadow
            >
              <boxGeometry args={[2.2, 6.5, 2.2]} />
            </mesh>
          ))}
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
>) {
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
}: TrailerViewerProps) {
  const dims = useMemo(
    () => deriveDimensions(frontDeckLengthFt, axleRating, deckWood),
    [frontDeckLengthFt, axleRating, deckWood],
  );

  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      <div className="relative w-full h-[700px] bg-gray-200 rounded-lg overflow-hidden border border-slate-300">
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
          />
        </Canvas>

        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-4 right-4 bg-white/90 hover:bg-white p-2 rounded-lg shadow-lg transition-colors"
          title="Fullscreen"
        >
          <Maximize2 className="w-5 h-5 text-slate-700" />
        </button>
      </div>

      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-gray-300">
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
            />
          </Canvas>

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
