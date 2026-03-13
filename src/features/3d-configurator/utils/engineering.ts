import {
  CylinderConfiguration,
  DimensionalSpecs,
  ValidationResult,
  CylinderType,
  PressureRating,
} from '../types/cylinder';

export function calculateRodDiameter(bore: number, cylinderType: CylinderType): number {
  if (cylinderType === 'welded-tang') {
    if (bore <= 2.0) return bore * 0.5;
    if (bore <= 3.0) return bore * 0.55;
    if (bore <= 4.0) return bore * 0.6;
    return bore * 0.625;
  } else {
    if (bore <= 2.0) return bore * 0.45;
    if (bore <= 3.0) return bore * 0.5;
    if (bore <= 4.0) return bore * 0.55;
    return bore * 0.6;
  }
}

export function calculateWallThickness(
  bore: number,
  pressure: PressureRating,
  cylinderType: CylinderType
): number {
  const baseFactor = cylinderType === 'welded-tang' ? 0.08 : 0.06;
  const pressureFactor = pressure / 2500;
  return bore * baseFactor * pressureFactor;
}

export function calculateRetractedLength(
  stroke: number,
  bore: number,
  cylinderType: CylinderType
): number {
  if (cylinderType === 'log-splitter') return stroke + 10.5;
  if (cylinderType === 'telescopic') return stroke * 0.4 + 18.0; 
  if (cylinderType === 'welded-cross-tube') return stroke + 9.5;
  if (cylinderType === 'welded-clevis') return stroke + 14.0;
  if (cylinderType === 'swivel-eye' || cylinderType === 'pin-eye') return stroke + 12.0;
  if (cylinderType === 'welded-tang') return stroke + (bore <= 2.5 ? 9.0 : 10.0);
  if (cylinderType === 'tie-rod') return stroke + (bore <= 2.5 ? 10.25 : 12.25);
  return stroke + bore * 4;
}

export function calculateDimensions(config: CylinderConfiguration): DimensionalSpecs {
  const wallThickness = calculateWallThickness(config.bore, config.operatingPressure, config.cylinderType);
  const barrelDiameter = config.bore + wallThickness * 2;
  const retractedLength = calculateRetractedLength(config.stroke, config.bore, config.cylinderType);
  return {
    bore: config.bore,
    stroke: config.stroke,
    rodDiameter: config.rodDiameter,
    retractedLength,
    extendedLength: retractedLength + config.stroke,
    barrelDiameter,
    wallThickness,
    mountingLength: config.bore * 1.5,
  };
}

export function validateConfiguration(config: CylinderConfiguration): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const complianceNotes: string[] = [];
  const partErrors: ValidationResult['partErrors'] = {};
  let isValid = true;
  let isoCompliant = true;

  const rodDiameterRatio = config.rodDiameter / config.bore;
  const strokeToRodRatio = config.stroke / config.rodDiameter;

  // 1. Geometric Fitting & Ratio Validation
  if (config.rodDiameter >= config.bore - 0.5) {
    errors.push(`Geometric Conflict: Rod Diameter (${config.rodDiameter.toFixed(3)}") is too large for Bore (${config.bore.toFixed(2)}"). There is insufficient space for internal seals and piston assembly.`);
    partErrors.rod = true;
    partErrors.bore = true;
    isValid = false;
  }

  if (rodDiameterRatio < 0.35) {
    errors.push(`Stability Risk: Rod Diameter is too small relative to Bore (Ratio: ${rodDiameterRatio.toFixed(2)}). Minimum recommended ratio is 0.35.`);
    partErrors.rod = true;
    isValid = false;
  }

  // 2. Stroke & Bore Constraints
  if (config.bore < 1.0) {
    errors.push('Bore diameter below manufacturing minimum (1.0").');
    partErrors.bore = true;
    isValid = false;
  }

  if (config.cylinderType !== 'telescopic' && config.bore <= 2.0 && config.stroke > 24) {
    errors.push('Hydraulic Deflection Risk: Stroke > 24" is not manufacturable for a 2.0" bore.');
    partErrors.stroke = true;
    partErrors.bore = true;
    isValid = false;
  }

  // 2. Rod Validation (Buckling & Material)
  const bucklingLimit = config.rodMaterial === '4140-alloy-steel' ? 45 : 35;
  if (strokeToRodRatio > bucklingLimit) {
    errors.push(`Critical Buckling Risk: Length-to-Rod ratio (${strokeToRodRatio.toFixed(1)}) exceeds safety limits for ${config.rodMaterial || 'standard steel'}.`);
    partErrors.rod = true;
    isValid = false;
  }

  if (config.rodMaterial?.includes('stainless') && config.operatingPressure > 2500) {
    errors.push('Material Strength Violation: Stainless steel rods cannot exceed 2500 PSI due to yield limits.');
    partErrors.rod = true;
    isValid = false;
  }

  // 3. Barrel & Pressure
  if (config.operatingPressure > 3000 && config.cylinderType === 'tie-rod') {
    warnings.push('Industrial Alert: Tie-rod standard (ISO 6020) recommends max 3000 PSI.');
    isoCompliant = false;
  }

  if (config.operatingPressure >= 3500 && config.barrelMaterial === '1045-carbon-steel' && config.bore > 4.0) {
    errors.push('Safety Factor Failure: Large bore at 3500 PSI requires 4140 Alloy steel barrel to prevent bursting.');
    partErrors.barrel = true;
    isValid = false;
  }

  // 4. Interface Validation (Ports & Mounting)
  if (config.portType === 'SAE-6' && config.bore > 3.0) {
    warnings.push('Flow Limitation: SAE-6 ports may cause overheating in bores above 3.0". SAE-8 recommended.');
    partErrors.ports = true;
  }

  if (config.mountingType === 'trunnion' && config.stroke > 60) {
    errors.push('Mounting Constraint: Trunnion mounts are limited to 60" stroke to ensure axial alignment.');
    partErrors.mounting = true;
    isValid = false;
  }

  // 5. ISO Compliance
  if (config.cylinderType === 'welded-tang') {
    complianceNotes.push('ISO 6022: Welded single rod cylinder standard compliance active.');
    if (rodDiameterRatio < 0.4 || rodDiameterRatio > 0.7) isoCompliant = false;
  }

  return {
    isValid,
    warnings,
    errors,
    partErrors,
    isoCompliant,
    complianceNotes,
  };
}

export function inchesToMM(inches: number): number { return inches * 25.4; }
export function mmToInches(mm: number): number { return mm / 25.4; }
