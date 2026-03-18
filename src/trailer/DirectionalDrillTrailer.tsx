import { useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { ContactShadows, Environment, OrbitControls } from "@react-three/drei";
import * as THREE from "three";

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

const steelMaterial = new THREE.MeshStandardMaterial({
  color: "#1f2328",
  roughness: 0.72,
  metalness: 0.82,
});

const steelWearMaterial = new THREE.MeshStandardMaterial({
  color: "#2b3138",
  roughness: 0.86,
  metalness: 0.68,
});

const treatedPineMaterial = new THREE.MeshStandardMaterial({
  color: "#a8814f",
  roughness: 0.92,
  metalness: 0.04,
});

const whiteOakMaterial = new THREE.MeshStandardMaterial({
  color: "#9a7340",
  roughness: 0.9,
  metalness: 0.04,
});

const rubberMaterial = new THREE.MeshStandardMaterial({
  color: "#111214",
  roughness: 0.9,
  metalness: 0.08,
});

const rimMaterial = new THREE.MeshStandardMaterial({
  color: "#b6bcc6",
  roughness: 0.36,
  metalness: 0.88,
});

const ledMaterial = new THREE.MeshStandardMaterial({
  color: "#d91e2d",
  emissive: "#aa0f1b",
  emissiveIntensity: 0.8,
  roughness: 0.2,
  metalness: 0.1,
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
    axleCenterZ: deckLength * 0.22,
    tireRadius: tireData.tireRadius,
    tireWidth: tireData.tireWidth,
    wheelTrackHalf: 49,
    tongueLength: 62,
    jackHeight: 24,
  };
}

function CameraRig({
  cameraView,
  deckLength,
}: {
  cameraView: CameraView;
  deckLength: number;
}) {
  const { camera } = useThree();

  const targetDistance = Math.max(260, deckLength + 80);

  if (cameraView === "top") {
    camera.position.set(0, targetDistance * 0.82, 0.01);
    camera.up.set(0, 0, -1);
  } else if (cameraView === "side") {
    camera.position.set(targetDistance * 0.7, targetDistance * 0.22, 0);
    camera.up.set(0, 1, 0);
  } else {
    camera.position.set(
      targetDistance * 0.55,
      targetDistance * 0.32,
      targetDistance * 0.68,
    );
    camera.up.set(0, 1, 0);
  }

  camera.lookAt(0, 20, 0);
  camera.updateProjectionMatrix();

  return null;
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
  const tiltPivotZ = dims.axleCenterZ - 6;
  const tiltAngle = (Math.PI / 180) * tiltAngleDeg * (tiltSign < 0 ? 1 : -1);

  const plankMat =
    deckWood === "white-oak" ? whiteOakMaterial : treatedPineMaterial;

  const tongueBaseZ = -deckHalfLen;
  const chainDropY = lowerRailCenterY - 2;

  const crossCount = Math.floor(dims.deckLength / 12);

  return (
    <group>
      {/* Lower 2x8 tube rails */}
      <mesh
        position={[leftEdge, lowerRailCenterY, 0]}
        material={steelMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[dims.lowerRailWidth, dims.lowerRailHeight, dims.deckLength]}
        />
      </mesh>
      <mesh
        position={[rightEdge, lowerRailCenterY, 0]}
        material={steelMaterial}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[dims.lowerRailWidth, dims.lowerRailHeight, dims.deckLength]}
        />
      </mesh>

      {/* Upper 5x5 side rails */}
      <mesh
        position={[leftEdge + 1.5, upperRailCenterY, 0]}
        material={steelWearMaterial}
        castShadow
      >
        <boxGeometry args={[3, dims.upperRailSize, dims.deckLength]} />
      </mesh>
      <mesh
        position={[rightEdge - 1.5, upperRailCenterY, 0]}
        material={steelWearMaterial}
        castShadow
      >
        <boxGeometry args={[3, dims.upperRailSize, dims.deckLength]} />
      </mesh>

      {/* Crossmembers: 3 inch channel on 12 inch centers */}
      {Array.from({ length: crossCount }).map((_, i) => {
        const z = -deckHalfLen + 6 + i * 12;
        return (
          <mesh
            key={i}
            position={[0, frameTopY - dims.crossmemberDepth / 2, z]}
            material={steelMaterial}
            castShadow
          >
            <boxGeometry
              args={[dims.betweenFenders, dims.crossmemberDepth, 1.8]}
            />
          </mesh>
        );
      })}

      {/* Stationary deck plank block */}
      <mesh
        position={[
          stationaryCenter,
          dims.deckHeight - dims.plankThickness / 2,
          0,
        ]}
        material={plankMat}
        castShadow
        receiveShadow
      >
        <boxGeometry
          args={[
            dims.stationaryDeckWidth,
            dims.plankThickness,
            dims.deckLength,
          ]}
        />
      </mesh>

      {/* Tilt deck with hinge near axle */}
      <group
        position={[tiltPivotX, dims.deckHeight, tiltPivotZ]}
        rotation={[tiltAngle, 0, 0]}
      >
        <mesh
          position={[0, -(dims.plankThickness / 2), -tiltPivotZ]}
          material={plankMat}
          castShadow
          receiveShadow
        >
          <boxGeometry
            args={[dims.tiltDeckWidth, dims.plankThickness, dims.deckLength]}
          />
        </mesh>

        {/* Hinge brackets */}
        <mesh position={[0, -2.4, -6]} material={steelMaterial} castShadow>
          <boxGeometry args={[dims.tiltDeckWidth * 0.45, 2.2, 2.2]} />
        </mesh>

        {/* 4 bolt-on D-rings */}
        {[-78, -32, 28, 84].map((z, idx) => (
          <mesh
            key={idx}
            position={[tiltSign * 22, 0.75, z]}
            material={steelMaterial}
            castShadow
          >
            <torusGeometry args={[1.9, 0.45, 10, 18]} />
          </mesh>
        ))}
      </group>

      {/* Stake pockets along side rails */}
      {Array.from({ length: Math.floor((dims.deckLength - 24) / 24) }).map(
        (_, i) => {
          const z = -deckHalfLen + 20 + i * 24;
          return (
            <group key={`stake-${i}`}>
              <mesh
                position={[leftEdge + 1.4, frameTopY - 0.2, z]}
                material={steelMaterial}
                castShadow
              >
                <boxGeometry args={[1.1, 3, 2.4]} />
              </mesh>
              <mesh
                position={[rightEdge - 1.4, frameTopY - 0.2, z]}
                material={steelMaterial}
                castShadow
              >
                <boxGeometry args={[1.1, 3, 2.4]} />
              </mesh>
            </group>
          );
        },
      )}

      {/* Tandem Torflex axle pack */}
      {[
        dims.axleCenterZ - dims.axleSpacing / 2,
        dims.axleCenterZ + dims.axleSpacing / 2,
      ].map((z, idx) => (
        <group key={`axle-${idx}`} position={[0, axleCenterY, z]}>
          <mesh
            rotation={[0, 0, Math.PI / 2]}
            material={steelMaterial}
            castShadow
          >
            <cylinderGeometry args={[1.35, 1.35, 84, 18]} />
          </mesh>

          {[-dims.wheelTrackHalf, dims.wheelTrackHalf].map((x, wheelIdx) => (
            <group key={wheelIdx} position={[x, 0, 0]}>
              <mesh
                rotation={[0, 0, Math.PI / 2]}
                material={rubberMaterial}
                castShadow
                receiveShadow
              >
                <cylinderGeometry
                  args={[dims.tireRadius, dims.tireRadius, dims.tireWidth, 34]}
                />
              </mesh>
              <mesh
                rotation={[0, 0, Math.PI / 2]}
                material={rimMaterial}
                castShadow
              >
                <cylinderGeometry
                  args={[
                    dims.tireRadius * 0.56,
                    dims.tireRadius * 0.56,
                    dims.tireWidth + 0.25,
                    28,
                  ]}
                />
              </mesh>
              <mesh
                position={[0, 0, dims.tireWidth / 2 + 0.25]}
                material={rimMaterial}
                castShadow
              >
                <cylinderGeometry args={[1.1, 1.1, 0.25, 12]} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      {/* 11 gauge fenders */}
      {[-dims.wheelTrackHalf, dims.wheelTrackHalf].map((x, idx) => (
        <mesh
          key={`fender-${idx}`}
          position={[x, dims.tireRadius + 8.4, dims.axleCenterZ]}
          material={steelMaterial}
          castShadow
        >
          <boxGeometry args={[13.2, 1.1, dims.axleSpacing + 36]} />
        </mesh>
      ))}

      {/* Rear LED flush lights */}
      {[leftEdge + 3.8, rightEdge - 3.8].map((x, idx) => (
        <group
          key={`light-${idx}`}
          position={[x, dims.deckHeight - 18, deckHalfLen + 0.8]}
        >
          <mesh position={[0, 2.2, 0]} material={ledMaterial}>
            <boxGeometry args={[4.8, 1.7, 0.8]} />
          </mesh>
          <mesh position={[0, -0.2, 0]} material={ledMaterial}>
            <boxGeometry args={[4.8, 1.7, 0.8]} />
          </mesh>
        </group>
      ))}

      {/* Tongue A-frame + hitch */}
      <mesh
        position={[
          -10,
          frameTopY - 2.2,
          tongueBaseZ - dims.tongueLength * 0.52,
        ]}
        rotation={[0, Math.PI / 7, 0]}
        material={steelMaterial}
        castShadow
      >
        <boxGeometry args={[2.1, 6.2, dims.tongueLength]} />
      </mesh>
      <mesh
        position={[10, frameTopY - 2.2, tongueBaseZ - dims.tongueLength * 0.52]}
        rotation={[0, -Math.PI / 7, 0]}
        material={steelMaterial}
        castShadow
      >
        <boxGeometry args={[2.1, 6.2, dims.tongueLength]} />
      </mesh>

      {/* Chain tray in tongue */}
      <mesh
        position={[0, frameTopY + 1.2, tongueBaseZ - 14]}
        material={steelWearMaterial}
        castShadow
      >
        <boxGeometry args={[15, 3.2, 8]} />
      </mesh>

      {/* Safety chains 3/8 Grade 70 */}
      <mesh
        position={[-4.8, chainDropY, tongueBaseZ - 33]}
        rotation={[Math.PI / 2, 0.2, 0]}
        material={steelWearMaterial}
      >
        <torusGeometry args={[5.8, 0.2, 6, 24]} />
      </mesh>
      <mesh
        position={[4.8, chainDropY, tongueBaseZ - 33]}
        rotation={[Math.PI / 2, -0.2, 0]}
        material={steelWearMaterial}
      >
        <torusGeometry args={[5.8, 0.2, 6, 24]} />
      </mesh>

      {/* 12K drop-leg jack */}
      <mesh
        position={[0, dims.jackHeight + 2, tongueBaseZ - 25]}
        material={steelMaterial}
        castShadow
      >
        <cylinderGeometry args={[1.8, 1.8, dims.jackHeight, 18]} />
      </mesh>
      <mesh
        position={[0, 8.5, tongueBaseZ - 25]}
        material={steelWearMaterial}
        castShadow
      >
        <cylinderGeometry args={[1.2, 1.2, 11, 16]} />
      </mesh>

      {/* Hitch style */}
      {hitchType === "coupler" ? (
        <mesh
          position={[0, frameTopY - 1.2, tongueBaseZ - dims.tongueLength - 2.4]}
          material={steelMaterial}
          castShadow
        >
          <coneGeometry args={[3.2, 8, 20]} />
        </mesh>
      ) : (
        <mesh
          position={[0, frameTopY - 1.2, tongueBaseZ - dims.tongueLength - 2.8]}
          rotation={[Math.PI / 2, 0, 0]}
          material={steelMaterial}
          castShadow
        >
          <torusGeometry args={[2.1, 0.55, 14, 24]} />
        </mesh>
      )}

      {/* Optional mounted equipment from details.md */}
      {showOptionalEquipment && (
        <group>
          {/* Tank/tool box mount */}
          <mesh
            position={[
              stationaryCenter + 3,
              dims.deckHeight + 7,
              deckHalfLen - 46,
            ]}
            material={steelWearMaterial}
            castShadow
          >
            <boxGeometry args={[24, 12, 18]} />
          </mesh>
          {/* Boring bar holders */}
          {[-14, -5, 4, 13].map((x, idx) => (
            <mesh
              key={idx}
              position={[
                x,
                dims.deckHeight + 3,
                -deckHalfLen + dims.frontDeckLength - 10,
              ]}
              material={steelMaterial}
              castShadow
            >
              <boxGeometry args={[2.2, 6.5, 2.2]} />
            </mesh>
          ))}
          {/* Machine stop blocks */}
          <mesh
            position={[
              tiltCenter - tiltSign * 12,
              dims.deckHeight + 2,
              -deckHalfLen + dims.frontDeckLength + 8,
            ]}
            material={steelMaterial}
            castShadow
          >
            <boxGeometry args={[16, 4.8, 3.2]} />
          </mesh>
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
      groupRef.current.rotation.y += delta * 0.12;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
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
  tiltAngleDeg = 12,
  cameraView = "perspective",
  showOptionalEquipment = true,
  autoRotate = true,
}: TrailerViewerProps) {
  const dims = useMemo(
    () => deriveDimensions(frontDeckLengthFt, axleRating, deckWood),
    [frontDeckLengthFt, axleRating, deckWood],
  );

  return (
    <div className="w-full h-[680px] bg-slate-100 rounded-lg overflow-hidden border border-slate-300">
      <Canvas
        camera={{ position: [260, 160, 330], fov: 42, near: 1, far: 3000 }}
        shadows
      >
        <CameraRig cameraView={cameraView} deckLength={dims.deckLength} />
        <color attach="background" args={["#d7dde2"]} />

        <ambientLight intensity={0.54} />
        <directionalLight
          position={[160, 240, 140]}
          intensity={1.08}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />

        <Environment preset="city" />

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

        <ContactShadows
          position={[0, 0, 0]}
          opacity={0.5}
          scale={Math.max(420, dims.deckLength + 180)}
          blur={2.4}
          far={220}
        />

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={cameraView === "perspective"}
          minPolarAngle={0.01}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />
      </Canvas>
    </div>
  );
}
