import { Settings2, Package, Ruler } from 'lucide-react';
import {
    CylinderConfiguration,
    ProductFamily,
    PortType,
    PartMaterialType,
    RodFinishType,
    BarrelFinishType,
    EndCapType,
    DimensionalSpecs,
} from '../types/cylinder';

interface ConfigurationControlsProps {
    config: CylinderConfiguration;
    productFamily: ProductFamily;
    dimensions: DimensionalSpecs;
    onChange: (config: CylinderConfiguration) => void;
}

export default function ConfigurationControls({
    config,
    productFamily,
    dimensions,
    onChange,
}: ConfigurationControlsProps) {
    const updateConfig = (updates: Partial<CylinderConfiguration>) => {
        onChange({ ...config, ...updates });
    };

    const handleBoreChange = (bore: number) => {
        // Smart Adjustment: Ensure rod diameter fits within the new bore size
        // Standard industrial rule: Rod should be between 40% and 80% of bore
        let newRodDiameter = config.rodDiameter;
        const minSafeRod = bore * 0.4;
        const maxSafeRod = bore * 0.8;

        if (newRodDiameter < minSafeRod) newRodDiameter = minSafeRod;
        if (newRodDiameter > maxSafeRod) newRodDiameter = maxSafeRod;

        updateConfig({ bore, rodDiameter: newRodDiameter });
    };

    return (
        <div>

            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg max-h-[calc(100vh-250px)] overflow-hidden flex flex-col">
                <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200">
                    <div className="p-2 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100%  rounded-xl">
                        <Settings2 className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-sm font-bold text-black">Advanced Configurator</h2>
                </div>

                <div className="space-y-8 overflow-y-auto custom-scrollbar pr-2">
                    {/* 1. PRIMARY DIMENSIONS */}
                    <section className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <h3 className="text-[13px] font-bold text-black mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% rounded-full"></div>
                            Main Specifications
                        </h3>
                        <div className="space-y-6 ">
                            <div>
                                <label className="flex justify-between text-[11px] font-normal text-gray-400 mb-2">
                                    Bore Diameter (Inches) <span>{config.bore.toFixed(2)}"</span>
                                </label>
                                <input
                                    type="range"
                                    min={Math.min(...productFamily.availableBores)}
                                    max={Math.max(...productFamily.availableBores)}
                                    step={0.25}
                                    value={config.bore}
                                    onChange={(e) => handleBoreChange(parseFloat(e.target.value))}
                                    className="text-[11px] w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#da789b]"
                                />
                                <div className="flex justify-between text-[11px] font-normal text-gray-300 mt-1">
                                    <span>{Math.min(...productFamily.availableBores)}"</span>
                                    <span>{Math.max(...productFamily.availableBores)}"</span>
                                </div>
                            </div>

                            <div>
                                <label className="flex justify-between text-[11px] font-normal text-gray-400 mb-2">
                                    Stroke Length (Inches) <span>{config.stroke.toFixed(1)}"</span>
                                </label>
                                <input
                                    type="range"
                                    min={Math.min(...productFamily.availableStrokes)}
                                    max={Math.max(...productFamily.availableStrokes)}
                                    step={1}
                                    value={config.stroke}
                                    onChange={(e) => updateConfig({ stroke: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#da789b]"
                                />
                                <div className="flex justify-between text-[11px] font-normal text-gray-300 mt-1">
                                    <span>{Math.min(...productFamily.availableStrokes)}"</span>
                                    <span>{Math.max(...productFamily.availableStrokes)}"</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-normal text-gray-400 tracking-normal mb-2">Pressure Class</label>
                                <div className="flex gap-2">
                                    {productFamily.availablePressures.map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => updateConfig({ operatingPressure: p })}
                                            className={`flex-1 py-2 rounded-xl font-semibold text-[10px] transition-all shadow-sm hover:shadow-md ${
                              config.operatingPressure === p
                                ? 'bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white border border-[#da789b]'
                                : 'bg-white text-gray-400 border border-gray-200 hover:border-[#da789b]/50'
                            }`}
                                        >
                                            {p} PSI
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 2. ROD ASSEMBLY */}
                    <section className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <h3 className="text-[13px] font-bold text-black mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% rounded-full"></div>
                            Rod Assembly
                        </h3>
                        <div className="space-y-5">
                            <div>
                                <label className="flex justify-between text-[11px] font-normal text-gray-400 mb-2">
                                    Rod Diameter <span>{config.rodDiameter.toFixed(3)}"</span>
                                </label>
                                <input
                                    type="range"
                                    min={config.bore * 0.3}
                                    max={config.bore * 0.8}
                                    step={0.125}
                                    value={config.rodDiameter}
                                    onChange={(e) => updateConfig({ rodDiameter: parseFloat(e.target.value) })}
                                    className="w-full h-1 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#da789b]"
                                />
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[11px] font-normal text-gray-400 mb-2">Rod Material</label>
                                    <select
                                        value={config.rodMaterial}
                                        onChange={(e) => updateConfig({ rodMaterial: e.target.value as PartMaterialType })}
                                        className="w-full min-w-[180px] bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-black shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <option value="1045-carbon-steel">1045 Carbon Steel</option>
                                        <option value="4140-alloy-steel">4140 Alloy Steel</option>
                                        <option value="stainless-304">Stainless Steel 304</option>
                                        <option value="stainless-316">Stainless Steel 316</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[9px] font-normal text-gray-400 mb-2">Rod Finish</label>
                                    <select
                                        value={config.rodFinish}
                                        onChange={(e) => updateConfig({ rodFinish: e.target.value as RodFinishType })}
                                        className="w-full min-w-[180px] bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-black shadow-sm hover:shadow-md transition-shadow"
                                    >
                                        <option value="chrome">Chrome Plated</option>
                                        <option value="hard-chrome">Hard Chrome Plated</option>
                                        <option value="induction-hardened">Induction Hardened</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* 3. BARREL & PISTON */}
                    <section className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-bold text-black mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% rounded-full"></div>
                            Barrel & Piston
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-normal text-gray-400 mb-2">Barrel Finish</label>
                                <select
                                    value={config.barrelFinish}
                                    onChange={(e) => updateConfig({ barrelFinish: e.target.value as BarrelFinishType })}
                                    className="w-full min-w-[180px] bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-black shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <option value="polished">Polished Finish</option>
                                    <option value="honed">Honed Tube</option>
                                    <option value="skived-burnished">Skived & Burnished</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-normal text-gray-400 mb-2">Piston Material</label>
                                <select
                                    value={config.pistonMaterial}
                                    onChange={(e) => updateConfig({ pistonMaterial: e.target.value as 'ductile-iron' | 'aluminum' | 'steel' })}
                                    className="w-full min-w-[180px] bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-black shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <option value="ductile-iron">Ductile Iron</option>
                                    <option value="aluminum">Aluminum Alloy</option>
                                    <option value="steel">Carbon Steel</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* 4. END CAPS & PORTS */}
                    <section className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                        <h3 className="text-[10px] font-bold text-black mb-4 flex items-center gap-2">
                            <div className="w-2 h-2 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% rounded-full"></div>
                            Mounting & Ports
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[9px] font-normal text-gray-400 mb-2">Head Cap Type</label>
                                <select
                                    value={config.headCapType}
                                    onChange={(e) => updateConfig({ headCapType: e.target.value as EndCapType })}
                                    className="w-full min-w-[180px] bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-black shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <option value="standard">Standard</option>
                                    <option value="cushioned">Cushioned</option>
                                    <option value="heavy-duty">Heavy Duty</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-[9px] font-normal text-gray-400 mb-2">Base Cap Type</label>
                                <select
                                    value={config.baseCapType}
                                    onChange={(e) => updateConfig({ baseCapType: e.target.value as EndCapType })}
                                    className="w-full min-w-[180px] bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-normal text-black shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <option value="standard">Standard</option>
                                    <option value="cushioned">Cushioned</option>
                                    <option value="heavy-duty">Heavy Duty</option>
                                </select>
                            </div>

                           
                            <div>
                                <label className="flex items-center gap-2 text-[10px] font-normal text-gray-400 mb-2">
                                    <Package className="w-3 h-3 text-[#da789b]" />
                                    Port Configuration (SAE)
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {(['SAE-6', 'SAE-8', 'SAE-10'] as PortType[]).map((port) => (
                                        <button
                                            key={port}
                                            onClick={() => updateConfig({ portType: port })}
                                            className={`py-3 rounded-xl font-bold text-[10px] transition-all shadow-sm hover:shadow-md ${
                              config.portType === port
                                ? 'bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white border border-[#da789b]'
                                : 'bg-white text-gray-400 border border-gray-200 hover:border-[#da789b]/50'
                            }`}
                                        >
                                            {port}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>


                </div>

            </div>
            {/* 5. CALCULATED DIMENSIONS - Requested by USER */}
            <div className="mt-5 bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <section className="pt-4 border-t border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% rounded-xl">
                          <Ruler className="w-4 h-4 text-white" />
                        </div>
                        <h3 className="text-sm font-bold text-black">Geometric Dimensions</h3>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-[9px] font-normal text-gray-400 mb-1">Bore</div>
                            <div className="text-black font-bold text-sm">{dimensions.bore.toFixed(2)}"</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-[9px] font-normal text-gray-400 mb-1">Stroke</div>
                            <div className="text-black font-bold text-sm">{dimensions.stroke.toFixed(2)}"</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-[9px] font-black text-gray-400 tracking-widest mb-1">Rod</div>
                            <div className="text-black font-black text-sm">{dimensions.rodDiameter.toFixed(2)}"</div>
                        </div>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm">
                            <div className="text-[9px] font-black text-gray-400 tracking-widest mb-1">Barrel</div>
                            <div className="text-black font-black text-sm">{dimensions.barrelDiameter.toFixed(2)}"</div>
                        </div>
                    </div>

                    <div className="mt-4 bg-[#4567a4]/10  rounded-xl p-4 border border-[#4567a4]/20">
                        <div className="text-[9px] font-black text-gray-500 tracking-widest mb-1">Retracted Length (OAL)</div>
                        <div className="text-black font-black text-xl leading-none">{dimensions.retractedLength.toFixed(2)}"</div>
                        <div className="text-gray-600 text-[8px] font-bold mt-2 tracking-widest">Total Physical Footprint</div>
                    </div>
                </section>
            </div>

        </div>

    );
}
