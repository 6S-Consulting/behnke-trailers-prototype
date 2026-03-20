import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  ContactShadows,
  PerspectiveCamera,
} from "@react-three/drei";
import { useState, useCallback, Suspense } from "react";
import * as THREE from "three";
import { TrailerFrame } from "./TrailerFrame";
import { TrailerDeck } from "./TrailerDeck";
import { TrailerWheels } from "./TrailerWheels";
import { TrailerAccessories } from "./TrailerAccessories";

type CameraPreset = "perspective" | "top" | "rear";

const cameraPresets: Record<
  CameraPreset,
  { position: [number, number, number]; target: [number, number, number] }
> = {
  perspective: { position: [6, 3.5, 7], target: [0, 0, 0] },
  top: { position: [0, 10, 0.01], target: [0, 0, 0] },
  rear: { position: [7, 2, 0], target: [0, 0, 0] },
};

function TrailerModel({ tiltAngle }: { tiltAngle: number }) {
  return (
    <group>
      <TrailerFrame />
      <TrailerDeck tiltAngle={tiltAngle} />
      <TrailerWheels />
      <TrailerAccessories />
    </group>
  );
}

function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.55, 0]}
      receiveShadow
    >
      <planeGeometry args={[30, 30]} />
      <meshStandardMaterial color="#2a2a28" roughness={0.95} metalness={0.05} />
    </mesh>
  );
}

export default function TrailerScene() {
  const [tiltAngle, setTiltAngle] = useState(0);
  const [isTilting, setIsTilting] = useState(false);
  const [camera, setCamera] = useState<CameraPreset>("perspective");

  const toggleTilt = useCallback(() => {
    setIsTilting(true);
    // Realistic max tilt (user requested): 13 degrees.
    const maxTilt = (13 * Math.PI) / 180;
    const target = tiltAngle > 0 ? 0 : maxTilt;
    const start = tiltAngle;
    const duration = 1200;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setTiltAngle(start + (target - start) * eased);
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsTilting(false);
      }
    };

    requestAnimationFrame(animate);
  }, [tiltAngle]);

  const preset = cameraPresets[camera];

  return (
    <div className="relative w-full h-full bg-background">
      <Canvas
        shadows
        gl={{
          antialias: true,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 1.2,
        }}
      >
        <PerspectiveCamera makeDefault position={preset.position} fov={45} />
        <OrbitControls
          target={preset.target}
          enableDamping
          dampingFactor={0.08}
          minDistance={3}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.1}
        />

        <ambientLight intensity={0.3} />
        <directionalLight
          position={[8, 10, 5]}
          intensity={1.8}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-near={0.5}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <directionalLight
          position={[-5, 5, -3]}
          intensity={0.4}
          color="#8899cc"
        />

        <Suspense fallback={null}>
          <Environment preset="warehouse" background={false} />
        </Suspense>

        <TrailerModel tiltAngle={tiltAngle} />
        <Ground />
        <ContactShadows
          position={[0, -0.54, 0]}
          opacity={0.4}
          scale={25}
          blur={2}
          far={6}
        />
      </Canvas>

      <div className="absolute top-4 left-4 flex flex-col gap-2">
        <h1 className="text-lg font-bold text-foreground font-mono tracking-wider">
          DIRECTIONAL DRILL TILT TRAILER
        </h1>
        <p className="text-xs text-muted-foreground">
          Tandem Axle • 20-24 ft • Interactive 3D Model
        </p>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {(["perspective", "top", "rear"] as CameraPreset[]).map((p) => (
          <button
            key={p}
            onClick={() => setCamera(p)}
            className={`px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider transition-all ${
              camera === p
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-muted"
            }`}
          >
            {p}
          </button>
        ))}
        <button
          onClick={toggleTilt}
          disabled={isTilting}
          className="px-4 py-2 rounded text-xs font-semibold uppercase tracking-wider bg-accent text-accent-foreground hover:opacity-90 transition-all disabled:opacity-50"
        >
          {tiltAngle > 0 ? "Lower Deck" : "Tilt Deck"}
        </button>
      </div>

      <div className="absolute bottom-6 right-4 text-[10px] text-muted-foreground font-mono">
        Drag to orbit • Scroll to zoom
      </div>
    </div>
  );
}
