export type CylinderType = 'welded-tang' | 'tie-rod' | 'log-splitter' | 'welded-cross-tube' | 'welded-clevis' | 'swivel-eye' | 'pin-eye' | 'telescopic';
export type MountingType = 'tang' | 'clevis' | 'eye' | 'trunnion';
export type PortType = 'SAE-6' | 'SAE-8' | 'SAE-10';
export type SealType = 'polyurethane' | 'nitrile' | 'viton';
export type PressureRating = 2000 | 2500 | 3000 | 3500;

export type RodFinishType = 'chrome' | 'hard-chrome' | 'nickel-chrome' | 'induction-hardened';
export type BarrelFinishType = 'polished' | 'honed' | 'skived-burnished';
export type PartMaterialType = '1045-carbon-steel' | '4140-alloy-steel' | 'stainless-304' | 'stainless-316';
export type EndCapType = 'standard' | 'cushioned' | 'heavy-duty';

export interface CylinderConfiguration {
  id: string;
  productFamilyId: string;
  bore: number;
  stroke: number;
  rodDiameter: number;
  cylinderType: CylinderType;
  operatingPressure: PressureRating;
  portType: PortType;
  mountingType: MountingType;
  sealType: SealType;
  
  // Granular assembly components
  rodMaterial: PartMaterialType;
  rodFinish: RodFinishType;
  barrelMaterial: PartMaterialType;
  barrelFinish: BarrelFinishType;
  pistonMaterial: 'ductile-iron' | 'aluminum' | 'steel';
  headCapType: EndCapType;
  baseCapType: EndCapType;
}

export interface ProductFamily {
  id: string;
  name: string;
  type: CylinderType;
  isoStandard: 'ISO-6020' | 'ISO-6022';
  basePrice: number;
  defaultBore: number;
  defaultStroke: number;
  defaultPressure: PressureRating;
  defaultPortType: PortType;
  availableBores: number[];
  availableStrokes: number[];
  availablePressures: PressureRating[];
  description: string;
  applications: string[];
}

export interface DimensionalSpecs {
  bore: number;
  stroke: number;
  rodDiameter: number;
  retractedLength: number;
  extendedLength: number;
  barrelDiameter: number;
  wallThickness: number;
  mountingLength: number;
}

export interface ValidationResult {
  isValid: boolean;
  warnings: string[];
  errors: string[];
  partErrors: {
    bore?: boolean;
    stroke?: boolean;
    rod?: boolean;
    barrel?: boolean;
    mounting?: boolean;
    ports?: boolean;
    seals?: boolean;
  };
  isoCompliant: boolean;
  complianceNotes: string[];
}

export interface PricingBreakdown {
  basePrice: number;
  boreMultiplier: number;
  strokeCost: number;
  pressurePremium: number;
  portCost: number;
  totalPrice: number;
}

export interface SavedConfiguration {
  id: string;
  name: string;
  timestamp: string;
  config: CylinderConfiguration;
  dimensions: DimensionalSpecs;
  pricing: PricingBreakdown;
}
