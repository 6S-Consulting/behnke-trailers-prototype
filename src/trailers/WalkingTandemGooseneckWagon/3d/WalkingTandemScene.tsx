import { Suspense, useEffect, useRef, useState } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  Environment,
  Html,
  Loader,
  ContactShadows,
} from "@react-three/drei";
import { Trailer } from "../3d/Trailer";
import * as THREE from "three";

export type CameraView = "perspective" | "side" | "top";

interface WalkingTandemSceneProps {
  autoRotate?: boolean;
  cameraView?: CameraView;
  showHoverLabels?: boolean;
}

function CameraRig({ cameraView }: { cameraView: CameraView }) {
  const { camera, controls } = useThree();

  useEffect(() => {
    if (!camera) return;

    if (cameraView === "side") {
      camera.position.set(32, 2, 0);
    } else if (cameraView === "top") {
      camera.position.set(0, 40, 0);
    } else {
      camera.position.set(18, 14, 22);
    }
    
    if (controls) {
      // @ts-expect-error - OrbitControls type is not fully compatible with Drei's version
      controls.update();
    }
  }, [cameraView, camera, controls]);

  return null;
}

export default function WalkingTandemScene({
  autoRotate = false,
  cameraView = "perspective",
  showHoverLabels = true,
}: WalkingTandemSceneProps) {
  const [hoveredPart, setHoveredPart] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const handlePointerOver = (e: any) => {
    if (!showHoverLabels) return;
    e.stopPropagation();
    
    // Improved logic to find a meaningful name by traversing up the parent tree
    let current = e.object;
    let name = current.name;
    
    // Traverse up to find a named group if the leaf mesh isn't named specifically
    while (current && (!name || name === "Scene" || name.includes("Object") || name === "")) {
      current = current.parent;
      if (!current) break;
      name = current.name;
    }

    if (!name || name === "Scene" || name.includes("Object")) {
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
      <Canvas shadows dpr={[1, 2]} camera={{ position: [18, 14, 22], fov: 35 }}>
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
          <group 
            position={[0, 0.6, 0]}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <Trailer />
          </group>

          <mesh
            position={[0, -0.65, 0]}
            rotation={[-Math.PI / 2, 0, 0]}
            receiveShadow
          >
            <planeGeometry args={[100, 100]} />
            <meshStandardMaterial
              color="#6b7280"
              roughness={0.96}
              metalness={0.02}
            />
          </mesh>

          <ContactShadows
            position={[0, -0.6, 0]}
            opacity={0.42}
            scale={20}
            blur={2.7}
            far={10}
          />
        </Suspense>

        <OrbitControls
          makeDefault
          autoRotate={autoRotate}
          autoRotateSpeed={0.5}
          enablePan={true}
          enableRotate={cameraView === "perspective"}
          minPolarAngle={0.01}
          maxPolarAngle={Math.PI / 2 - 0.02}
        />

        <Environment preset="city" />
        <ambientLight intensity={0.55} />
        <hemisphereLight
          intensity={0.33}
          groundColor="#4b8a43"
          color="#f8fcff"
        />
        <directionalLight
          position={[10, 15, 10]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[2048, 2048]}
        />
      </Canvas>

      {/* Floating UI Tooltip */}
      {hoveredPart && (
        <div
          className="fixed pointer-events-none z-50 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded border border-white/20 shadow-xl"
          style={{
            left: mousePos.x + 15,
            top: mousePos.y - 15,
            transform: "translateY(-100%)",
          }}
        >
          <p className="text-white text-[10px] font-display font-bold uppercase tracking-widest whitespace-nowrap">
            {hoveredPart}
          </p>
        </div>
      )}

      <Loader />
    </div>
  );
}

