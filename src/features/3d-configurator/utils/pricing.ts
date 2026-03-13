import {
  CylinderConfiguration,
  PricingBreakdown,
  ProductFamily,
  CylinderType,
} from '../types/cylinder';

export function calculatePrice(
  config: CylinderConfiguration,
  productFamily: ProductFamily
): PricingBreakdown {
  const basePrice = productFamily.basePrice;

  // 1. DIMENSION BASED PRICING
  const boreMultiplier = Math.pow(config.bore / productFamily.defaultBore, 1.8) * basePrice * 0.4;
  const premiumTypes: CylinderType[] = ['telescopic', 'swivel-eye', 'welded-clevis'];
  const strokeCost = config.stroke * (premiumTypes.includes(config.cylinderType) ? 14 : 9);

  // 2. PRESSURE & PERFORMANCE PREMIUMS
  let pressurePremium = 0;
  if (config.operatingPressure === 3000) pressurePremium = 150;
  if (config.operatingPressure === 3500) pressurePremium = 320;

  // 3. GRANULAR MATERIAL & FINISH SURCHARGES
  const rodMatCost = config.rodMaterial === '4140-alloy-steel' ? 85 : config.rodMaterial?.includes('stainless') ? 240 : 0;
  const rodFinishCost = config.rodFinish === 'hard-chrome' ? 45 : config.rodFinish === 'induction-hardened' ? 95 : 0;
  const barrelFinishCost = config.barrelFinish === 'skived-burnished' ? 75 : config.barrelFinish === 'honed' ? 35 : 0;
  
  // 4. INTERFACE COSTS
  const portCost = config.portType === 'SAE-10' ? 85 : 45;
  const mountingCost = getMountingCost(config.mountingType);
  const sealCost = config.sealType === 'viton' ? 120 : config.sealType === 'nitrile' ? 25 : 0;

  const subtotal = 
    basePrice + 
    boreMultiplier + 
    strokeCost + 
    pressurePremium + 
    rodMatCost + 
    rodFinishCost + 
    barrelFinishCost + 
    portCost + 
    mountingCost + 
    sealCost;

  return {
    basePrice,
    boreMultiplier,
    strokeCost,
    pressurePremium: pressurePremium + rodMatCost + bucketCapCost(config),
    portCost: portCost + sealCost,
    totalPrice: Math.round(subtotal * 100) / 100,
  };
}

function getMountingCost(mountingType: string): number {
  switch (mountingType) {
    case 'tang': return 45;
    case 'clevis': return 75;
    case 'eye': return 65;
    case 'trunnion': return 110;
    default: return 45;
  }
}

function bucketCapCost(config: CylinderConfiguration): number {
    let cost = 0;
    if (config.headCapType === 'heavy-duty') cost += 65;
    if (config.baseCapType === 'heavy-duty') cost += 65;
    if (config.headCapType === 'cushioned') cost += 95;
    return cost;
}
