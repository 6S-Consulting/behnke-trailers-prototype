import { useState, useMemo } from 'react';
import { X, Factory, Truck, Zap, Settings, ArrowLeft, Activity, ChevronRight, Gauge, Info } from 'lucide-react';
import { useRouter } from '@/lib/router';
import { products as allProducts } from '@/data/products';

interface DiscoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = 'core' | 'specs' | 'results';

export function DiscoveryModal({ isOpen, onClose }: DiscoveryModalProps) {
  const { navigate } = useRouter();
  const [step, setStep] = useState<Step>('core');
  const [selections, setSelections] = useState({
    application: '', // industrial or mobile
    pumpType: '', // piston or gear
    pressureRequirement: '', 
    flowRequirement: '', 
    speedRequirement: '',
    mountingRequirement: '',
  });

  const availableFilters = useMemo(() => {
    const categoryMatched = allProducts.filter(p => {
      if (!selections.application || !selections.pumpType) return true;
      const isIndustrial = selections.application === 'industrial';
      return isIndustrial 
        ? p.category.toLowerCase().includes('industrial') && p.category.toLowerCase().includes(selections.pumpType)
        : p.category.toLowerCase().includes('mobile') && p.category.toLowerCase().includes(selections.pumpType);
    });

    const pressures = new Set<string>();
    categoryMatched.forEach(p => pressures.add(p.specs.maxPressure));
    const sortedPressures = Array.from(pressures).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));

    const flows = new Set<string>();
    categoryMatched.forEach(p => {
       if (selections.pressureRequirement && p.specs.maxPressure !== selections.pressureRequirement) return;
       flows.add(p.specs.displacement);
    });
    const sortedFlows = Array.from(flows).sort((a, b) => (parseFloat(a) || 0) - (parseFloat(b) || 0));

    const speeds = new Set<string>();
    categoryMatched.forEach(p => {
      if (selections.pressureRequirement && p.specs.maxPressure !== selections.pressureRequirement) return;
      if (selections.flowRequirement && p.specs.displacement !== selections.flowRequirement) return;
      speeds.add(p.specs.maxSpeed);
    });
    const sortedSpeeds = Array.from(speeds).sort((a, b) => (parseInt(a) || 0) - (parseInt(b) || 0));

    const mountings = new Set<string>();
    categoryMatched.forEach(p => {
      if (selections.pressureRequirement && p.specs.maxPressure !== selections.pressureRequirement) return;
      if (selections.flowRequirement && p.specs.displacement !== selections.flowRequirement) return;
      if (selections.speedRequirement && p.specs.maxSpeed !== selections.speedRequirement) return;
      mountings.add(p.specs.mounting);
    });
    const sortedMountings = Array.from(mountings).sort();

    return {
       pressures: sortedPressures,
       flows: sortedFlows,
       speeds: sortedSpeeds,
       mountings: sortedMountings
    };
  }, [selections.application, selections.pumpType, selections.pressureRequirement, selections.flowRequirement, selections.speedRequirement]);

  const filteredProducts = useMemo(() => {
    if (step !== 'results') return [];

    return allProducts.filter(p => {
      // 1. Filter by category (derived from app + type)
      const categoryMatch = selections.application === 'industrial'
        ? p.category.toLowerCase().includes('industrial') && p.category.toLowerCase().includes(selections.pumpType)
        : p.category.toLowerCase().includes('mobile') && p.category.toLowerCase().includes(selections.pumpType);
      
      if (!categoryMatch) return false;

      if (selections.pressureRequirement && p.specs.maxPressure !== selections.pressureRequirement) return false;
      if (selections.flowRequirement && p.specs.displacement !== selections.flowRequirement) return false;
      if (selections.speedRequirement && p.specs.maxSpeed !== selections.speedRequirement) return false;
      if (selections.mountingRequirement && p.specs.mounting !== selections.mountingRequirement) return false;

      return true;
    }).slice(0, 10); // Show more matching products to accommodate 5 per row
  }, [step, selections]);

  if (!isOpen) return null;

  const handleSpecsSubmit = () => {
    setStep('results');
  };

  const goBack = () => {
    if (step === 'specs') setStep('core');
    if (step === 'results') setStep('specs');
  };

  const handleProductClick = (id: string) => {
    navigate(`/product/${id}`);
    onClose();
  };

  const handleViewCatalog = () => {
    const query = new URLSearchParams();
    if (selections.application && selections.pumpType) {
        const catStr = selections.application === 'industrial' ? 'Industrial' : 'Mobile';
        const pumpStr = selections.pumpType === 'piston' ? 'Piston' : 'Gear';
        query.append('category', `${catStr} ${pumpStr} Pumps`);
    }
    if (selections.pressureRequirement) query.append('pressure', selections.pressureRequirement);
    if (selections.flowRequirement) query.append('displacement', selections.flowRequirement);
    if (selections.speedRequirement) query.append('speed', selections.speedRequirement);
    if (selections.mountingRequirement) query.append('mounting', selections.mountingRequirement);
    
    navigate(`/catalog?${query.toString()}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] md:h-[75vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200 transition-all duration-500 ease-out">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-4">
            {step !== 'core' && (
              <button 
                onClick={goBack}
                className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-500 hover:text-slate-900 border border-transparent hover:border-slate-100"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <h3 className="font-black text-xl text-slate-900 leading-tight uppercase tracking-tight">Expert <span className="text-[#4567a4]">Matching</span></h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Hydraulic Selection Engine v2.0</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2.5 hover:bg-white hover:shadow-md rounded-xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-100"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
          {step === 'core' && (
            <div className="flex flex-col md:flex-row h-full animate-in slide-in-from-bottom-8 duration-500 max-w-4xl mx-auto items-center justify-center gap-8 py-4">
              {/* Step 1: Application */}
              <div className="flex-1 w-full text-center space-y-4">
                 <div className="mb-4">
                   <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Step 01</span>
                   <h4 className="text-xl font-black text-slate-900 mt-2">Where will this pump be used?</h4>
                 </div>
                 <div className="flex gap-4 justify-center">
                   <button
                     onClick={() => setSelections({...selections, application: 'industrial', pumpType: '', pressureRequirement: '', flowRequirement: '', speedRequirement: '', mountingRequirement: ''})}
                     className={`group w-32 flex flex-col items-center p-4 rounded-3xl border-2 transition-all duration-500 shadow-sm hover:shadow-xl ${selections.application === 'industrial' ? 'border-slate-900 bg-slate-50' : 'border-slate-50 hover:border-slate-200'}`}
                   >
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${selections.application === 'industrial' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                       <Factory size={24} />
                     </div>
                     <span className="font-black text-slate-900 uppercase tracking-tight text-xs">Industrial</span>
                   </button>
                   <button
                     onClick={() => setSelections({...selections, application: 'mobile', pumpType: '', pressureRequirement: '', flowRequirement: '', speedRequirement: '', mountingRequirement: ''})}
                     className={`group w-32 flex flex-col items-center p-4 rounded-3xl border-2 transition-all duration-500 shadow-sm hover:shadow-xl ${selections.application === 'mobile' ? 'border-slate-900 bg-slate-50' : 'border-slate-50 hover:border-slate-200'}`}
                   >
                     <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-3 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110 ${selections.application === 'mobile' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'}`}>
                       <Truck size={24} />
                     </div>
                     <span className="font-black text-slate-900 uppercase tracking-tight text-xs">Mobile</span>
                   </button>
                 </div>
              </div>

               {/* Divider */}
               <div className="hidden md:block w-px h-64 bg-slate-100 my-auto mx-4" />

               {/* Step 2: Technology */}
               <div className={`flex-1 w-full text-center space-y-4 transition-opacity duration-500 ${selections.application ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                 <div className="mb-4">
                   <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Step 02</span>
                   <h4 className="text-xl font-black text-slate-900 mt-2">Required Core Technology</h4>
                 </div>
                 <div className="flex gap-4 justify-center">
                   <button
                     onClick={() => {
                        setSelections({...selections, pumpType: 'piston', pressureRequirement: '', flowRequirement: '', speedRequirement: '', mountingRequirement: ''});
                        setTimeout(() => setStep('specs'), 300);
                     }}
                     className="group w-32 flex flex-col items-center p-4 rounded-3xl border-2 border-slate-50 hover:border-slate-900 hover:bg-slate-50 transition-all duration-500 shadow-sm hover:shadow-xl"
                   >
                     <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center mb-3 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                       <Zap size={24} />
                     </div>
                     <span className="font-black text-slate-900 uppercase tracking-tight text-xs">Piston</span>
                   </button>
                   <button
                     onClick={() => {
                        setSelections({...selections, pumpType: 'gear', pressureRequirement: '', flowRequirement: '', speedRequirement: '', mountingRequirement: ''});
                        setTimeout(() => setStep('specs'), 300);
                     }}
                     className="group w-32 flex flex-col items-center p-4 rounded-3xl border-2 border-slate-50 hover:border-slate-900 hover:bg-slate-50 transition-all duration-500 shadow-sm hover:shadow-xl"
                   >
                     <div className="w-12 h-12 rounded-2xl bg-slate-100 group-hover:bg-slate-900 group-hover:text-white flex items-center justify-center mb-3 transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
                       <Settings size={24} />
                     </div>
                     <span className="font-black text-slate-900 uppercase tracking-tight text-xs">Gear</span>
                   </button>
                 </div>
               </div>
            </div>
          )}

          {step === 'specs' && (
            <div className="space-y-8 animate-in slide-in-from-right-8 duration-500 w-full h-full flex flex-col">
              <div className="text-center mb-0 flex-shrink-0">
                <span className="px-3 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-full uppercase tracking-wider">Step 03</span>
                <h4 className="text-2xl font-black text-slate-900 mt-2">Technical Parameters</h4>
              </div>
              
              <div className="flex flex-col md:flex-row h-full w-full max-w-4xl mx-auto gap-8 pt-4 flex-1">
                {/* Left Side: Pressure and Displacement */}
                <div className="flex-1 space-y-8 pr-2">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                      <Gauge size={14} className="text-slate-900" /> Operating Pressure (Max)
                    </label>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.pressures.map(p => (
                      <button
                        key={p}
                        onClick={() => setSelections({...selections, pressureRequirement: selections.pressureRequirement === p ? '' : p, flowRequirement: '', speedRequirement: '', mountingRequirement: ''})}
                        className={`py-2 px-4 rounded-xl border text-xs font-black transition-all duration-300 uppercase tracking-tight ${
                          selections.pressureRequirement === p 
                            ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={`transition-opacity duration-300 ${!selections.pressureRequirement ? 'opacity-40 pointer-events-none' : ''}`}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                    <Activity size={14} className="text-slate-900" /> Displacement
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {availableFilters.flows.map(f => (
                      <button
                        key={f}
                        onClick={() => setSelections({...selections, flowRequirement: selections.flowRequirement === f ? '' : f, speedRequirement: '', mountingRequirement: ''})}
                        className={`py-2 px-4 rounded-xl border text-xs font-black transition-all duration-300 uppercase tracking-tight ${
                          selections.flowRequirement === f 
                            ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                     {availableFilters.flows.length === 0 && selections.pressureRequirement && (
                      <div className="text-xs font-bold text-slate-400">No options found.</div>
                    )}
                    </div>
                  </div>
                </div>

                {/* Vertical Divider */}
                <div className="hidden md:block w-px bg-slate-100 my-4" />

                {/* Right Side: Speed and Mounting */}
                <div className="flex-1 space-y-8 pl-2 w-full">
                  <div className={`transition-opacity duration-300 ${!selections.flowRequirement ? 'opacity-40 pointer-events-none' : ''}`}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                      <Zap size={14} className="text-slate-900" /> Max Speed
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.speeds.map(s => (
                        <button
                          key={s}
                          onClick={() => setSelections({...selections, speedRequirement: selections.speedRequirement === s ? '' : s, mountingRequirement: ''})}
                          className={`py-2 px-4 rounded-xl border text-xs font-black transition-all duration-300 uppercase tracking-tight ${
                            selections.speedRequirement === s 
                              ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                      {availableFilters.speeds.length === 0 && selections.flowRequirement && (
                        <div className="text-xs font-bold text-slate-400">No options found.</div>
                      )}
                    </div>
                  </div>

                  <div className={`transition-opacity duration-300 ${!selections.speedRequirement ? 'opacity-40 pointer-events-none' : ''}`}>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 block flex items-center gap-2">
                      <Settings size={14} className="text-slate-900" /> Mounting
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availableFilters.mountings.map(m => (
                        <button
                          key={m}
                          onClick={() => setSelections({...selections, mountingRequirement: selections.mountingRequirement === m ? '' : m})}
                          className={`py-2 px-4 rounded-xl border text-xs font-black transition-all duration-300 uppercase tracking-tight ${
                            selections.mountingRequirement === m 
                              ? 'border-slate-900 bg-slate-900 text-white shadow-md' 
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {m}
                        </button>
                      ))}
                      {availableFilters.mountings.length === 0 && selections.speedRequirement && (
                        <div className="text-xs font-bold text-slate-400">No options found.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between flex-shrink-0 max-w-4xl mx-auto w-full">
                <p className="text-xs font-bold text-slate-500 w-1/2">
                   {selections.pressureRequirement ? 'You can proceed and we will show all matching models, or refine further above.' : 'Please select an operating pressure to continue.'}
                </p>
                <button
                  disabled={!selections.pressureRequirement}
                  onClick={handleSpecsSubmit}
                  className="w-1/3 py-4 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.01] transition-all disabled:opacity-50 flex items-center justify-center gap-3 group"
                >
                  Analyze & Match <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          )}

          {step === 'results' && (
            <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 py-2 border-b border-slate-100">
                <div className="text-center md:text-left">
                  <h4 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">Recommended <span className="text-[#4567a4]">Solutions</span></h4>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Based on {selections.application} application & {selections.pumpType} configuration</p>
                </div>
                 <div className="flex flex-col sm:flex-row items-center gap-4">
                   <button 
                     onClick={() => {
                       setSelections({ application: '', pumpType: '', pressureRequirement: '', flowRequirement: '', speedRequirement: '', mountingRequirement: '' });
                       setStep('core');
                     }}
                     className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2 transition-colors sm:pr-4 sm:border-r border-slate-200"
                   >
                     <ArrowLeft size={14} /> Start Over
                   </button>
                   <div className="flex items-center gap-4">
                     <div className="flex -space-x-3">
                        {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center"><Info size={12} className="text-slate-400" /></div>)}
                     </div>
                     <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{filteredProducts.length} Match{filteredProducts.length !== 1 ? 'es' : ''} Identified</span>
                   </div>
                 </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {filteredProducts.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleProductClick(p.id)}
                      className="flex flex-col p-3 rounded-3xl border border-slate-100 hover:border-slate-900 hover:shadow-2xl transition-all duration-500 cursor-pointer bg-white group relative overflow-hidden"
                    >
                      <div className="absolute top-4 right-4 bg-slate-900 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10 scale-0 group-hover:scale-100 duration-500">
                        <ChevronRight size={16} />
                      </div>
                      <div className="aspect-square bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden flex-shrink-0 mb-4 group-hover:bg-white transition-colors">
                        <img src={p.image} alt={p.name} className="w-full h-full object-contain p-2 bg-white group-hover:scale-110 transition-transform duration-700" />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] font-black text-[#4567a4] uppercase tracking-widest mb-1">{p.category}</p>
                        <h5 className="font-black text-slate-900 uppercase text-xs truncate mb-2">{p.name}</h5>
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                           <div className="flex flex-col">
                              <span className="text-[9px] font-black text-slate-400 tracking-widest">Pressure</span>
                              <span className="text-xs font-black text-slate-900">{p.specs.maxPressure}</span>
                           </div>
                           <div className="flex flex-col text-right">
                              <span className="text-[9px] font-black text-slate-400 tracking-widest">Displacement</span>
                              <span className="text-xs font-black text-slate-900">{p.specs.displacement}</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-24 text-center">
                  <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                    <X size={40} className="text-slate-300" />
                  </div>
                  <h5 className="text-xl font-black text-slate-900 uppercase">Configuration Alert</h5>
                  <p className="text-sm text-slate-500 mt-2 max-w-sm mx-auto">No exact matches found for these parameters. Our experts suggest adjusting your displacement range or contact us for a custom build.</p>
                  <button 
                    onClick={() => setStep('specs')}
                    className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-full font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-colors shadow-xl"
                  >
                    Modify Technical Specs
                  </button>
                </div>
              )}

              {filteredProducts.length > 0 && (
                <div className="flex justify-center pt-4">
                  <button 
                    onClick={handleViewCatalog}
                    className="text-[10px] font-black text-slate-400 hover:text-slate-900 uppercase tracking-widest flex items-center gap-2 group transition-colors"
                  >
                    View Comprehensive Catalog <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 pt-4 flex justify-center flex-shrink-0 bg-white">
          <div className="flex gap-3">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-1.5 rounded-full transition-all duration-700 ${
                  (i === 1 && step === 'core') || 
                  (i === 2 && step === 'specs') ||
                  (i === 3 && step === 'results')
                    ? 'bg-slate-900 w-12' 
                    : 'bg-slate-100 w-6'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
