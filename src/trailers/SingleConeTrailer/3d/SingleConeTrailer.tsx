import { ConeHopper } from './ConeHopper';
import { SupportFrame } from './SupportFrame';
import { ConeTongue } from './ConeTongue';
import { ConeAxle } from './ConeAxle';

/**
 * Complete Single Cone Trailer assembly.
 * A B&B-style cone spreader trailer with:
 * - Large inverted cone hopper on top
 * - Rectangular steel support frame
 * - Single axle with two wheels (reused from flatbed)
 * - A-frame tongue with jack stand and hitch
 * - Hydraulic cylinder for discharge gate
 */
export function SingleConeTrailer({
  position = [0, 0, 0]
}: {
  position?: [number, number, number]
}) {
  // Layout reference points
  const frameBaseY = 0.8;       // Frame sits above axle
  const frameHeight = 1.2;     // Must match SupportFrame frameHeight
  // Cone bottom aligns with top of frame (where diagonals converge)
  const hopperY = frameBaseY + frameHeight;
  const axleY = 0;              // Axle at ground-level (wheels touch ground)
  const tongueY = frameBaseY;   // Tongue attaches at frame base level
  const tongueZ = -1.9;        // Front of frame

  return (
    <group position={position} name="Single Cone Trailer">

      {/* ── Cone Hopper (centered inside the cube frame) ── */}
      <group name="Hopper">
        <ConeHopper position={[0, hopperY - 0.35, 0]} />
      </group>

      {/* ── Support Frame (rectangular steel frame under hopper) ── */}
      <group name="Support Frame">
        <SupportFrame position={[0, frameBaseY, 0]} />
      </group>

      {/* ── Single Axle + Wheels ──
           Axle Y is set so wheel centres sit ~0.71 above ground.
           The bracket tops reach up to frameBaseY.              ── */}
      <group name="Axle Assembly">
        <ConeAxle position={[0, axleY, 0.35]} />
      </group>

      {/* ── Tongue / Hitch Assembly (front, rotated 180° on Y) ── */}
      <group name="Tongue / Hitch">
        <ConeTongue position={[0, tongueY, tongueZ - 3.23]} rotation={[0, Math.PI, 0]} />
      </group>

    </group>
  );
}
