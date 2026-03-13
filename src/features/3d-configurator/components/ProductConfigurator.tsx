import { useState, useMemo } from 'react';
import { useRouter } from '@/lib/router';
import { ArrowLeft, Download, GitCompare } from 'lucide-react';
import {
  CylinderConfiguration,
  ProductFamily,
  MountingType,
  SealType,
  SavedConfiguration,
} from '../types/cylinder';
import { calculateDimensions, validateConfiguration } from '../utils/engineering';
import { calculatePrice } from '../utils/pricing';
import Cylinder3DViewer from './Cylinder3DViewer';
import ConfigurationControls from './ConfigurationControls';
import SpecsPanel from './SpecsPanel';
import VersionComparison from './VersionComparison';

interface ProductConfiguratorProps {
  productFamily: ProductFamily;
  onBack: () => void;
}

export default function ProductConfigurator({
  productFamily,
  onBack,
}: ProductConfiguratorProps) {
  const getDefaultConfig = (): CylinderConfiguration => ({
    id: `cfg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    productFamilyId: productFamily.id,
    bore: productFamily.defaultBore,
    stroke: productFamily.defaultStroke,
    rodDiameter: productFamily.defaultBore * 0.5,
    cylinderType: productFamily.type,
    operatingPressure: productFamily.defaultPressure,
    portType: productFamily.defaultPortType,
    mountingType: (productFamily.type.includes('eye') || productFamily.type === 'pin-eye' || productFamily.type === 'swivel-eye')
      ? 'eye'
      : (productFamily.type.includes('clevis') || productFamily.type.includes('cross-tube'))
        ? 'clevis'
        : productFamily.type === 'tie-rod'
          ? 'trunnion'
          : 'tang' as MountingType,
    sealType: 'polyurethane' as SealType,
    // Modular part defaults
    rodMaterial: '1045-carbon-steel',
    rodFinish: 'chrome',
    barrelMaterial: '1045-carbon-steel',
    barrelFinish: 'honed',
    pistonMaterial: 'ductile-iron',
    headCapType: 'standard',
    baseCapType: 'standard',
  });

  const [config, setConfig] = useState<CylinderConfiguration>(getDefaultConfig);

  const [isVersionModalOpen, setIsVersionModalOpen] = useState(false);
  const storageKey = `cylinder_versions_${productFamily.id}`;

  const [savedVersions, setSavedVersions] = useState<SavedConfiguration[]>(() => {
    const saved = localStorage.getItem(storageKey);
    return saved ? JSON.parse(saved) : [];
  });

  const dimensions = useMemo(() => calculateDimensions(config), [config]);
  const validation = useMemo(() => validateConfiguration(config), [config]);
  const pricing = useMemo(() => calculatePrice(config, productFamily), [config, productFamily]);

  const handleReset = () => {
    setConfig(getDefaultConfig());
  };

  const currentSavedConfig: SavedConfiguration = useMemo(() => ({
    id: config.id,
    name: 'Current Configuration',
    timestamp: new Date().toISOString(),
    config,
    dimensions,
    pricing,
  }), [config, dimensions, pricing]);

  const handleSaveVersion = () => {
    const newVersion: SavedConfiguration = {
      ...currentSavedConfig,
      id: `v-${Date.now()}`,
      name: `Version ${savedVersions.length + 1}`,
      timestamp: new Date().toISOString(),
    };
    const updated = [newVersion, ...savedVersions];
    setSavedVersions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    alert('Configuration saved to versions!');
  };

  const handleDeleteVersion = (id: string) => {
    const updated = savedVersions.filter((v) => v.id !== id);
    setSavedVersions(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const { navigate } = useRouter();

  const handleRequestQuote = () => {
    const params = new URLSearchParams({
      source: 'configurator',
      familyId: productFamily.id,
      familyName: productFamily.name,
      bore: config.bore.toString(),
      stroke: config.stroke.toString(),
      rod: config.rodDiameter.toString(),
      type: config.cylinderType,
      pressure: config.operatingPressure.toString(),
      mounting: config.mountingType,
      price: pricing.totalPrice.toFixed(2),
      rodMaterial: config.rodMaterial,
      rodFinish: config.rodFinish,
      barrelFinish: config.barrelFinish,
    });

    navigate(`/request-quote?${params.toString()}`);
  };

  const handleDownloadSpecs = () => {
    const specs = {
      configurationId: config.id,
      product: productFamily.name,
      specifications: {
        bore: `${config.bore}" (${(config.bore * 25.4).toFixed(1)} mm)`,
        stroke: `${config.stroke}" (${(config.stroke * 25.4).toFixed(0)} mm)`,
        rodDiameter: `${config.rodDiameter}" (${(config.rodDiameter * 25.4).toFixed(1)} mm)`,
        pressure: `${config.operatingPressure} PSI`,
        portType: config.portType,
        mounting: config.mountingType,
        seal: config.sealType,
      },
      dimensions: {
        retracted: `${dimensions.retractedLength.toFixed(2)}" (${(dimensions.retractedLength * 25.4).toFixed(0)} mm)`,
        extended: `${dimensions.extendedLength.toFixed(2)}" (${(dimensions.extendedLength * 25.4).toFixed(0)} mm)`,
        barrelDiameter: `${dimensions.barrelDiameter.toFixed(2)}" (${(dimensions.barrelDiameter * 25.4).toFixed(1)} mm)`,
      },
      pricing: {
        total: `$${pricing.totalPrice.toFixed(2)}`,
      },
      isoCompliance: productFamily.isoStandard,
      validation: {
        isValid: validation.isValid,
        warnings: validation.warnings,
        errors: validation.errors,
      },
    };

    const dataStr = JSON.stringify(specs, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cylinder-config-${config.id.slice(0, 8)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 lg:px-8 py-8">
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-gray-50 text-black rounded-full transition-all border border-gray-200 shadow-sm font-bold text-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <h1 className="text-2xl font-bold text-black tracking-tight">{productFamily.name}</h1>
              <p className="text-xs font-normal text-gray-400">{productFamily.isoStandard} Compliant</p>
            </div>
            <button
              onClick={() => setIsVersionModalOpen(true)}
              className="flex items-center gap-2 px-6 py-2.5 bg-white hover:bg-gray-50 text-black rounded-full transition-all border border-gray-200 shadow-sm font-bold text-xs"
            >
              <GitCompare className="w-4 h-4" />
              Compare Versions
            </button>
            <button
              onClick={handleDownloadSpecs}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white rounded-full transition-all shadow-lg hover:opacity-90 font-bold text-xs"
            >
              <Download className="w-4 h-4" />
              Export Specs
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-4">
            <ConfigurationControls
              config={config}
              productFamily={productFamily}
              dimensions={dimensions}
              onChange={setConfig}
            />
          </div>

          <div className="lg:col-span-6">
            <div className="h-[600px] relative rounded-2xl overflow-hidden border border-gray-200 bg-white shadow-sm">
              <Cylinder3DViewer config={config} dimensions={dimensions} onReset={handleReset} />
            </div>
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
              <h3 className="text-xs font-bold text-black mb-3">Typical Applications</h3>
              <div className="flex flex-wrap gap-3">
                {productFamily.applications.map((app, idx) => (
                  <span
                    key={idx}
                    className="px-6 py-1 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-normal text-gray-600"
                  >
                    {app}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-3">
            <SpecsPanel
              config={config}
              validation={validation}
              pricing={pricing}
              productFamily={productFamily}
              onRequestQuote={handleRequestQuote}
              onSaveVersion={handleSaveVersion}
            />
          </div>
        </div>

        {/* Full-width Typical Applications section at bottom */}

      </div>

      <VersionComparison
        isOpen={isVersionModalOpen}
        onClose={() => setIsVersionModalOpen(false)}
        savedVersions={savedVersions}
        onSaveVersion={handleSaveVersion}
        onDeleteVersion={handleDeleteVersion}
        onLoadVersion={(v) => {
          console.log('Attempting to load version:', v);
          try {
            if (!v || !v.config) {
              console.error('Invalid version data:', v);
              return;
            }

            // Explicitly merge with fallbacks to handle "undefined" in saved data
            const mergedConfig: CylinderConfiguration = {
              id: v.config.id || `loaded-${Date.now()}`,
              productFamilyId: v.config.productFamilyId || productFamily.id,
              bore: v.config.bore || productFamily.defaultBore,
              stroke: v.config.stroke || productFamily.defaultStroke,
              rodDiameter: v.config.rodDiameter || (productFamily.defaultBore * 0.5),
              cylinderType: v.config.cylinderType || productFamily.type,
              operatingPressure: v.config.operatingPressure || productFamily.defaultPressure,
              portType: v.config.portType || productFamily.defaultPortType,
              mountingType: v.config.mountingType || 'tang',
              sealType: v.config.sealType || 'polyurethane',

              // Granular props (often missing in old versions)
              rodMaterial: v.config.rodMaterial || '1045-carbon-steel',
              rodFinish: v.config.rodFinish || 'chrome',
              barrelMaterial: v.config.barrelMaterial || '1045-carbon-steel',
              barrelFinish: v.config.barrelFinish || 'honed',
              pistonMaterial: v.config.pistonMaterial || 'ductile-iron',
              headCapType: v.config.headCapType || 'standard',
              baseCapType: v.config.baseCapType || 'standard',
            };

            console.log('Merged config:', mergedConfig);
            setConfig(mergedConfig);
            setIsVersionModalOpen(false);
            // alert('Configuration loaded successfully!');
          } catch (error) {
            console.error('Error loading version:', error);
            alert('Failed to load version. Please try again.');
          }
        }}
      />
    </div>
  );
}

