import * as THREE from 'three';
import { useMemo } from 'react';

const STEEL = { color: '#0a0a0a', metalness: 0.85, roughness: 0.25 } as const;
const STEEL_DARK = { color: '#060606', metalness: 0.8, roughness: 0.3 } as const;

const M = {
  steel: { color: '#080808', metalness: 0.88, roughness: 0.22 } as const,
  chrome: { color: '#0d0d0d', metalness: 0.95, roughness: 0.15 } as const,
  bolt: { color: '#cccccc', metalness: 0.90, roughness: 0.15 } as const,
  tape: { color: '#cc2200', metalness: 0.0, roughness: 0.95 } as const,
};

function TubeBetween({
  from, to, r = 0.07, segments = 32, mat = M.steel,
}: {
  from: THREE.Vector3; to: THREE.Vector3;
  r?: number; segments?: number; mat?: typeof M.steel;
}) {
  const dir = new THREE.Vector3().subVectors(to, from);
  const len = dir.length();
  const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);
  const up = new THREE.Vector3(0, 1, 0);
  const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, segments]} />
      <meshStandardMaterial {...mat} />
    </mesh>
  );
}

function FootBracket({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh>
        <boxGeometry args={[0.35, 0.08, 0.28]} />
        <meshStandardMaterial {...M.steel} />
      </mesh>
      {([[-0.12, 0.09], [0.12, 0.09], [-0.12, -0.09], [0.12, -0.09]] as [number, number][]).map(([bx, bz], i) => (
        <mesh key={i} position={[bx, 0.075, bz]}>
          <cylinderGeometry args={[0.025, 0.025, 0.08, 6]} />
          <meshStandardMaterial {...M.bolt} />
        </mesh>
      ))}
    </group>
  );
}
function RearStep({
  position,
  rotation = [0, 0, 0]
}: {
  position: [number, number, number];
  rotation?: [number, number, number]
}) {
  // Creating the trapezoidal "hollow" cutout for the side face
  const sidePlateShape = useMemo(() => {
    const s = new THREE.Shape();
    // Large outer plate (Matches "big" requirement)
    s.moveTo(-0.4, 0); s.lineTo(0.4, 0);
    s.lineTo(0.3, -0.7); s.lineTo(-0.3, -0.7);
    s.lineTo(-0.4, 0);

    // Large Trapezoid Hole (The hollow part)
    const hole = new THREE.Path();
    hole.moveTo(-0.25, -0.15); hole.lineTo(0.25, -0.15);
    hole.lineTo(0.18, -0.55); hole.lineTo(-0.18, -0.55);
    hole.lineTo(-0.25, -0.15);
    s.holes.push(hole);
    return s;
  }, []);

  return (
    <group position={position} rotation={rotation}>

      {/* 2. THE SIDEWAYS HOLLOW PLATE */}
      {/* Positioned at the front edge and rotated to face outward */}
      <mesh position={[0, 0, 0.4]} rotation={[0, 0, 0]}>
        <shapeGeometry args={[sidePlateShape]} />
        <meshStandardMaterial {...M.steel} side={THREE.DoubleSide} />
      </mesh>

      {/* 3. TOP GRIP SURFACE */}
      <mesh position={[0, 0.03, 0.2]}>
        <boxGeometry args={[0.8, 0.02, 0.45]} />
        <meshStandardMaterial color="#111" roughness={1} />
      </mesh>

      {/* 4. TALL HANDRAIL (Bolted to the outer corner) */}
      <mesh position={[0, 0.75, 0.3]}>
        <cylinderGeometry args={[0.03, 0.03, 1.4, 20]} />
        <meshStandardMaterial
          color="#c0c0c0"
          metalness={1.0}
          roughness={0.1}
        />
      </mesh>
    </group>
  );
}
export function GooseneckArch({ position }: { position: [number, number, number] }) {
  const apexY = 1.75;
  const footSpreadZ = 0.90;
  // ── THICK legs — wide flat rectangular cross-section like real stamped steel
  const legW = 0.28;   // wide face  (was thin pipe ~0.13)
  const legT = 0.10;   // wall thickness

  // ── THICK receiver pipe
  const recR = 0.38;   // big radius  (was 0.26)
  const recL = 1.90;

  const angle = Math.PI / 4; // 45° contact point

  const apexLeft = new THREE.Vector3(
    0,
    apexY + recR * Math.sin(angle),
    recR * Math.cos(angle)
  );

  const apexRight = new THREE.Vector3(
    0,
    apexY + recR * Math.sin(angle),
    -recR * Math.cos(angle)
  );
  const footF = new THREE.Vector3(0, 0, footSpreadZ + 0.2);
  const footR = new THREE.Vector3(0, 0, -footSpreadZ - 0.2);

  // Build a wide flat leg between two points using a BoxGeometry oriented along the direction
  function FlatLeg({ from, to }: { from: THREE.Vector3; to: THREE.Vector3 }) {
    const dir = new THREE.Vector3().subVectors(to, from);
    const len = dir.length();
    const mid = new THREE.Vector3().addVectors(from, to).multiplyScalar(0.5);

    const up = new THREE.Vector3(0, 1, 0);
    const quat = new THREE.Quaternion().setFromUnitVectors(
      up,
      dir.clone().normalize()
    );

    return (
      <mesh position={mid} quaternion={quat}>
        {/* radiusTop, radiusBottom, height, radialSegments */}
        <cylinderGeometry args={[legW / 2 + 0.15, legW / 2 + 0.15, len - 0.1, 16]} />        <meshStandardMaterial {...M.steel} />
      </mesh>
    );
  }

  const plateSize = 0.60;
  const boltPos: [number, number][] = [
    [-0.20, 0.20], [0.20, 0.20],
    [-0.20, -0.20], [0.20, -0.20],
    [0.0, 0.0],
  ];


  return (
    <group position={position}>

      {/* ── Legs ── */}
      <FlatLeg from={apexLeft} to={footF} />
      <FlatLeg from={apexRight} to={footR} />
      {/* ══ Reflective DOT Tape (Legs - MIRRORED) ══ */}
      {/* ══ Reflective DOT Tape (Legs - MIRRORED STRIP) ══ */}
      {/* ══ Reflective DOT Tape (Fixed to FlatLeg Edges) ══ */}
      {/* ══ Reflective DOT Tape (Corrected Rotation for FlatLeg Edges) ══ */}
      {/* ══ Reflective DOT Tape (Increased Parallel Gap) ══ */}
      {[
        { from: apexLeft, to: footF },
        { from: apexRight, to: footR }
      ].map((leg, idx) => {
        const dir = new THREE.Vector3().subVectors(leg.to, leg.from).normalize();
        const len = new THREE.Vector3().subVectors(leg.to, leg.from).length();
        const mid = new THREE.Vector3().addVectors(leg.from, leg.to).multiplyScalar(0.5);

        const up = new THREE.Vector3(0, 1, 0);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, dir);

        const stripLen = 0.35;
        const count = Math.ceil(len / stripLen) - 4;
        const tapeThickness = 0.005;
        const tapeWidth = 0.08;

        // 💡 ADJUST THIS: Increase 0.15 to move strips further apart
        const gapOffset = 0.15;

        return (
          <group key={idx} position={mid} quaternion={quat}>
            {[-1, 1].map((sideDirection) => (
              <group key={sideDirection}>
                {Array.from({ length: count }).map((_, i) => {
                  const yPos = -len / 2 + (i * stripLen) + stripLen / 2;

                  return (
                    <mesh
                      key={i}
                      position={[
                        // Moves strips further to the left/right of the center
                        (legW / 2 + gapOffset) * sideDirection,
                        yPos + 0.8,
                        0
                      ]}
                      rotation={[0, Math.PI / 2, 0]}
                    >
                      <boxGeometry args={[tapeWidth, stripLen - 0.01, tapeThickness]} />
                      <meshStandardMaterial
                        color={i % 2 === 0 ? "#cc2200" : "#eeeeee"}
                        metalness={0.8}
                        roughness={0.2}
                      />
                    </mesh>
                  );
                })}
              </group>
            ))}
          </group>
        );
      })}
      {/* ── Receiver pipe — very thick ── */}
      <mesh position={[0, apexY, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[recR, recR, recL, 48]} />
        <meshStandardMaterial {...M.chrome} />
      </mesh>

      {/* Open mouth ring */}
      <mesh position={[0, apexY, recL / 2]}>
        <ringGeometry args={[recR * 0.78, recR, 48]} />
        <meshStandardMaterial color="#000" side={THREE.DoubleSide} metalness={0.9} roughness={0.05} />
      </mesh>

      {/* ── Face plate ── */}
      <mesh position={[0, apexY, -recL / 2 - 0.03]}>
        <boxGeometry args={[plateSize, plateSize, 0.055]} />
        <meshStandardMaterial {...M.steel} />
      </mesh>
      {boltPos.map(([bx, by], i) => (
        <mesh key={i} position={[bx, apexY + by, -recL / 2 - 0.08]}>
          <cylinderGeometry args={[0.033, 0.033, 0.11, 6]} />
          <meshStandardMaterial {...M.bolt} />
        </mesh>
      ))}

      {/* ── Thick collar at apex joining legs to pipe ── */}
      {/* <mesh position={[0, apexY - 0.06, 0]}>
        <cylinderGeometry args={[recR + 0.07, recR + 0.07, 0.22, 48]} />
        <meshStandardMaterial {...M.steel} />
      </mesh> */}

      {/* ── Foot brackets ── */}
      <FootBracket position={[footF.x, footF.y, footF.z]} />
      <FootBracket position={[footR.x, footR.y, footR.z]} />

    </group>
  );
}

export function Chassis({ position }: { position: [number, number, number] }) {
  const frameLength = 5.8;
  const frameWidth = 2.0;
  const railW = 0.13;
  const railH = 0.36;
  const flangeW = 0.30;
  const flangeT = 0.05;
  const railOffset = frameWidth / 2 - flangeW / 2;

  const frontZ = -frameLength / 2;
  const rearZ = frameLength / 2;

  const crossZs = [
    frontZ + 0.5, frontZ + 1.6, frontZ + 2.8,
    rearZ - 2.0, rearZ - 1.1, rearZ - 0.35,
  ];

  const archZ = frontZ + 0.85;
  const tongueEndZ = frontZ - 1.9;
  const tongueMidZ = (frontZ + tongueEndZ) / 2;
  const tongueLen = Math.abs(tongueEndZ - frontZ);

  return (
    <group position={position} name="Main Chassis Frame">

      {/* ══ Frame Rails ══ */}
      {([-railOffset, railOffset] as number[]).map((x, i) => (
        <group key={i} name={i === 0 ? "Left Frame Rail" : "Right Frame Rail"}>
          <mesh position={[x, 0, 0]}>
            <boxGeometry args={[railW, railH, frameLength]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          <mesh position={[x, railH / 2 + flangeT / 2, 0]}>
            <boxGeometry args={[flangeW, flangeT, frameLength]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
          <mesh position={[x, -railH / 2 - flangeT / 2, 0]}>
            <boxGeometry args={[flangeW, flangeT, frameLength]} />
            <meshStandardMaterial {...STEEL} />
          </mesh>
        </group>
      ))}

      {/* ══ Cross Members ══ */}
      <group name="Cross Members">
        {crossZs.map((z, i) => (
          <mesh key={i} position={[0, railH * 0.05, z]} name={`Cross Member ${i + 1}`}>
            <boxGeometry args={[frameWidth - flangeW, railH * 0.70, railW]} />
            <meshStandardMaterial {...STEEL_DARK} />
          </mesh>
        ))}
      </group>

      {/* ══ GooseneckArch — front of chassis ══ */}
      <group name="Gooseneck Arch">
        <GooseneckArch position={[0, railH / 2 + flangeT - 0.3, archZ - 1.4]} />
      </group>
      
      {/* ══ Rear Step Attachment ══ */}
      {/* Right Side - Default Orientation */}
      <group name="Right Rear Step">
        <RearStep position={[railOffset + 0.15, railH / 2, -rearZ + 1.7]}
          rotation={[0, Math.PI / 2, 0]} />
      </group>

      {/* Left Side - Rotated 180 degrees on X-axis */}
      <group name="Left Rear Step">
        <RearStep
          position={[-railOffset - 0.15, railH / 2, -rearZ + 1.7]}
          rotation={[0, -Math.PI / 2, 0]}
        />
      </group>
      {/* ══ Reflective DOT Tape ══ */}
      {/* ══ Reflective DOT Tape (Main Outer Side - Continuous Long Strip) ══ */}
      {/* ══ Reflective DOT Tape (Fixed Flickering/Z-Fighting) ══ */}
      {([-railOffset, railOffset] as number[]).map((railX, railIndex) => {
        const isRightRail = railX > 0;
        const sideDirection = isRightRail ? 1 : -1;

        return (
          <group key={railIndex}>
            {Array.from({ length: 21 }).map((_, i) => {
              const stripLen = 0.25;
              // 1. Precise Z-Positioning to prevent overlap
              const zPos = -frameLength / 2 + 0.4 + (i * stripLen);

              const tapeThickness = 0.006; // 2. Slightly thicker than the rail face
              const tapeWidth = 0.08;
              const gapOffset = 0.005; // 3. Increased gap to stop Z-fighting with rail

              return (
                <mesh
                  key={i}
                  position={[
                    railX + (railW / 2 + gapOffset) * sideDirection,
                    0,
                    zPos
                  ]}
                  // 4. Simplified rotation to keep it vertical and flat
                  rotation={[0, Math.PI, Math.PI / 2]}
                >
                  {/* 5. Second argument MUST match stripLen exactly */}
                  <boxGeometry args={[tapeWidth, 0.05, stripLen]} />
                  <meshStandardMaterial
                    color={i % 2 === 0 ? "#cc2200" : "#eeeeee"}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </mesh>
              );
            })}
          </group>
        );
      })}

    </group>
  );
}