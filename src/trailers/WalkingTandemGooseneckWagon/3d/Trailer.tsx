import { Chassis } from './Chassis';
import { Axle } from './Axle';
import { Tongue } from './Tongue';

export function Trailer({ position = [0, 0, 0] }: { position?: [number, number, number] }) {
  const chassisLength = 7.5;
  // Axles far apart
  const frontAxleZ = -chassisLength / 2 + 0.5;
  const rearAxleZ = chassisLength / 2 - 1.5;

  return (
    <group position={position}>
      {/* Main Structural Frame */}
      <Chassis position={[0, 0, 0]} />

      {/* Front Axle */}
      <Axle position={[0, -0.1, frontAxleZ + 1.15]} type="front" />

      {/* Rear Axle */}
      <Axle position={[0, -0.1, rearAxleZ]} type="rear" />

      {/* Tongue (drawbar) attached to front axle */}
      <Tongue position={[0, -0.1, frontAxleZ - 1.4]} />
    </group>
  );
}
