import { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid, Environment, ContactShadows, Float } from '@react-three/drei';
import { Ruler, RotateCcw } from 'lucide-react';
import { CylinderConfiguration, DimensionalSpecs, ValidationResult } from '../types/cylinder';
import CylinderModel3D from './CylinderModel3D';

interface Cylinder3DViewerProps {
  config: CylinderConfiguration;
  dimensions: DimensionalSpecs;
  partErrors?: ValidationResult['partErrors'];
  isMini?: boolean;
  onReset?: () => void;
}

export default function Cylinder3DViewer({ config, dimensions, partErrors = {}, isMini = false, onReset }: Cylinder3DViewerProps) {
  const [showDimensions, setShowDimensions] = useState(false);

  return (
    <div className={`w-full h-full relative ${isMini ? 'bg-gradient-to-b from-white to-slate-50' : 'bg-gradient-to-br from-slate-50 to-gray-100'} border border-gray-200 rounded-2xl overflow-hidden shadow-lg`}>
      <Canvas
        shadows
        gl={{ antialias: true, preserveDrawingBuffer: true, alpha: true }}
        camera={{ position: isMini ? [35, 10, 25] : [15, 10, 15], fov: isMini ? 28 : 35 }}
      >
        {!isMini && <color attach="background" args={['#f8fafc']} />}

        <Environment preset="city" />
        <ambientLight intensity={isMini ? 1.4 : 0.8} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={isMini ? 5 : 2} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={isMini ? 2 : 1} color="#da789b" />
        <directionalLight position={[10, 20, 10]} intensity={isMini ? 1.2 : 0.5} />

        <Float speed={isMini ? 0.8 : 1.5} rotationIntensity={isMini ? 0.05 : 0.2} floatIntensity={isMini ? 0.1 : 0.5}>
          <CylinderModel3D config={config} dimensions={dimensions} partErrors={partErrors} showDimensions={showDimensions} />
        </Float>

        <ContactShadows
          position={[0, -2.5, 0]}
          opacity={isMini ? 0.3 : 0.4}
          scale={20}
          blur={2.5}
          far={4.5}
        />

        {!isMini && (
          <Grid
            args={[50, 50]}
            cellSize={1}
            cellThickness={0.5}
            cellColor="#e2e8f0"
            sectionSize={5}
            sectionThickness={1}
            sectionColor="#cbd5e1"
            fadeDistance={30}
            fadeStrength={1}
            followCamera={false}
            position={[0, -2.51, 0]}
          />
        )}

        {!isMini && (
          <OrbitControls
            enablePan={true}
            enableZoom={true}
            enableRotate={true}
            minDistance={5}
            maxDistance={100}
            target={[0, 0, 0]}
            makeDefault
          />
        )}
      </Canvas>

      {!isMini && (
        <div className="absolute top-4 right-4 flex gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="p-3 rounded-xl transition-all shadow-lg border-2 bg-white/80 backdrop-blur-sm text-black border-gray-300 hover:border-red-400 hover:bg-red-50 hover:scale-110"
              title="Reset to Default"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          )}
          <button
            onClick={() => setShowDimensions(!showDimensions)}
            className={`p-3 rounded-xl transition-all shadow-lg border-2 hover:scale-110 ${showDimensions
                ? 'bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white border-[#da789b]'
                : 'bg-white/80 backdrop-blur-sm text-black border-gray-300 hover:border-[#da789b]/50'
            }`}
            title={showDimensions ? 'Hide Geometry' : 'Show Geometry'}
          >
            <Ruler className="w-5 h-5" />
          </button>
        </div>
      )}

      {!isMini && (
        <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end pointer-events-none">
          <div className="bg-white/90 backdrop-blur-sm px-4 py-3 rounded-2xl text-[10px] font-bold text-gray-400 border border-gray-100 shadow-2xl pointer-events-auto tracking-widest inline-block">
            <div className="flex flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-[#da789b] rounded-full animate-pulse shadow-[0_0_10px_#da789b]"></div>
                <span className="text-black font-black">{showDimensions ? 'CAD ANALYTICS' : '3D PREVIEW'}</span>
              </div>
              <div className="flex flex-row gap-4">
                <span className="text-gray-500 text-[10px]">Rotate: <span className="text-black font-semibold">LMB</span></span>
                <span className="text-gray-500 text-[10px]">Pan: <span className="text-black font-semibold">RMB</span></span>
                <span className="text-gray-500 text-[10px]">Zoom: <span className="text-black font-semibold">Scroll</span></span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
