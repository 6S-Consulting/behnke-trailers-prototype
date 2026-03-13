import React from 'react';
// 1. Import your specialized components
import WeldedCrossTubeModel3D from './WeldedCrossTubeModel3D';
// import ClevisModel3D from './ClevisModel3D'; // Future file
// import TrunnionModel3D from './TrunnionModel3D'; // Future file

import { CylinderConfiguration, DimensionalSpecs, ValidationResult } from '../types/cylinder';
import TieRodCylinderModel3D from './TieRodCylinderModel3D';
import WeldedTangCylinderModel3D from './WeldedTangCylinderModel3D';
import WeldedClevisCylinderModel3D from './WeldedClevisCylinderModel3D';
import LogSplitterCylinderModel3D from './LogSplitterCylinderModel3D';
import SwivelEyeCylinderModel3D from './SwivelEyeCylinderModel3D';
import PinEyeCylinderModel3D from './PinEyeCylinderModel3D';
import TelescopicMultiStageModel3D from './TelescopicMultiStageModel3D';

interface Props {
  config: CylinderConfiguration;
  dimensions: DimensionalSpecs;
  partErrors: ValidationResult['partErrors'];
  showDimensions?: boolean;
}

export default function CylinderModel3D(props: Props) {
  const { config } = props;

  // 2. Logic to determine which specialized component to render
  // This matches the "Product Type" selection from your UI/Catalog
  switch (config.cylinderType) {
    case 'welded-cross-tube':
      return <WeldedCrossTubeModel3D {...props} />;
    case 'tie-rod':
        return <TieRodCylinderModel3D {...props} />;
    /* case 'Clevis Mount':
      return <ClevisModel3D {...props} />; 
    */
   case 'welded-clevis':
      return <WeldedClevisCylinderModel3D {...props} />;
    case 'welded-tang':
      return <WeldedTangCylinderModel3D {...props} />;
      case 'log-splitter':
      return <LogSplitterCylinderModel3D {...props} />;
      case 'swivel-eye':
        return <SwivelEyeCylinderModel3D {...props} />;
        case 'pin-eye':
          return <PinEyeCylinderModel3D {...props} />;
          case 'telescopic':
            return <TelescopicMultiStageModel3D {...props} />;
    // 3. Fallback to Welded Cross-Tube if no match is found
    default:
      return <WeldedCrossTubeModel3D {...props} />;
  }
}