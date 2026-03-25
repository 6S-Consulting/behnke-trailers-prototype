import { Suspense, useEffect, useState } from "react";
import { Canvas, useThree, ThreeEvent } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  ContactShadows,
} from "@react-three/drei";
import { SingleConeTrailer } from "./SingleConeTrailer";
import * as THREE from "three";

export type CameraView = "perspective" | "side" | "top";

interface SingleConeSceneProps {
  autoRotate?: boolean;
  cameraView?: CameraView;
  showHoverLabels?: boolean;
}

function CameraRig({ cameraView }: { cameraView: CameraView }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!camera) return;

    if (cameraView === "side") {
      camera.position.set(25, 3, 0);
    } else if (cameraView === "top") {
      camera.position.set(0, 30, 0);
    } else {
      camera.position.set(18, 12, 20);
    }

    if (controls) {
      // @ts-expect-error - OrbitControls type is not fully compatible with Drei's version
      controls.update();
    }
  }, [cameraView, camera, controls]);

  return null;
}

export default function SingleConeScene({
  autoRotate = false,
  cameraView = "perspective",
  showHoverLabels = true,
}: SingleConeSceneProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handlePointerOver = (e: ThreeEvent<PointerEvent>) => {
    if (!showHoverLabels) return;
    e.stopPropagation();

    let current: THREE.Object3D | null = e.object;
    let name = current.name;

    // Traverse up the hierarchy to find a meaningful name
    let depth = 0;
    while (current && depth < 10) {
      if (current.name && current.name !== "Scene" && !current.name.includes("Object") && current.name !== "") {
        name = current.name;
        break;
      }
      current = current.parent;
      depth++;
    }

    if (!name || name === "Scene" || name === "" || name.includes("Object")) {
      name = "Trailer Component";
    }

    setHoveredPart(name);
  };

  const handlePointerOut = () => {
    setHoveredPart(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="w-full h-full bg-[#9ca3af] relative" onMouseMove={handleMouseMove}>
      <Canvas shadows dpr={[1, 2]} camera={{ position: [18, 12, 20], fov: 40 }}>
        <CameraRig cameraView={cameraView} />
        <color attach="background" args={["#9ca3af"]} />

        <Suspense
          fallback={
            <Html center>
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                <div className="text-white font-display text-sm font-bold uppercase tracking-widest">
                  Loading 3D Model...
                </div>
              </div>
            </Html>
          }
        >
          <group onPointerOver={handlePointerOver} onPointerOut={handlePointerOut}>
            <SingleConeTrailer position={[0, -0.5, 0]} />
          </group>

          <Environment preset="city" />
          <ambientLight intensity={0.6} />
          <spotLight
            position={[10, 20, 10]}
            angle={0.15}
            penumbra={1}
            intensity={1.5}
            castShadow
            shadow-mapSize={[2048, 2048]}
          />
          <directionalLight
            position={[-10, 15, -10]}
            intensity={0.8}
            castShadow
          />
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.4}
            scale={20}
            blur={2}
            far={4.5}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enableDamping
          dampingFactor={0.05}
          minDistance={8}
          maxDistance={50}
        />
      </Canvas>

      {hoveredPart && showHoverLabels && (
        <div
          className="fixed pointer-events-none z-50 bg-black/80 backdrop-blur-md border border-white/20 text-white px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y - 15,
          }}
        >
          {hoveredPart}
        </div>
      )}
    </div>
  );
}
