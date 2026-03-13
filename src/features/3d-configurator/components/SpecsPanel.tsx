import {
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Award,
  GitCompare,
} from 'lucide-react';
import {
  CylinderConfiguration,
  ValidationResult,
  PricingBreakdown,
  ProductFamily,
} from '../types/cylinder';

interface SpecsPanelProps {
  config: CylinderConfiguration;
  validation: ValidationResult;
  pricing: PricingBreakdown;
  productFamily: ProductFamily;
  onRequestQuote: () => void;
  onSaveVersion: () => void;
}

export default function SpecsPanel({
  config,
  validation,
  pricing,
  productFamily,
  onRequestQuote,
  onSaveVersion,
}: SpecsPanelProps) {
  return (
    <div className="space-y-4">
      {/* 1. Validation & Engineering Section */}
      {(validation.warnings.length > 0 || validation.errors.length > 0) && (
        <div className={`border-2 rounded-2xl p-6 shadow-xl transition-all ${validation.errors.length > 0 ? 'bg-red-50 border-red-500' : 'bg-white border-[#da789b]/50 shadow-[#da789b]/5'}`}>
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2 rounded-xl ${validation.errors.length > 0 ? 'bg-red-500 text-white' : 'bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% text-white'}`}>
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-black">Engineering Validation</h3>
              <p className="text-[10px] font-normal text-gray-400">{validation.errors.length} Critical Issues Found</p>
            </div>
          </div>

          <div className="space-y-3">
            {validation.errors.map((error, idx) => (
              <div key={idx} className="flex items-start gap-4 px-4 py-4 bg-white border-l-4 border-red-500 rounded-xl shadow-sm">
                <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                <span className="text-xs font-normal text-red-600">{error}</span>
              </div>
            ))}
            {validation.warnings.map((warning, idx) => (
              <div key={idx} className="flex items-start gap-4 px-4 py-3 bg-white border-l-4 border-[#da789b] rounded-xl shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#da789b] mt-1.5 flex-shrink-0" />
                <span className="text-xs font-normal text-gray-600">{warning}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. ISO Compliance Section */}
      <div className="bg-gradient-to-br from-white to-slate-50 border border-slate-200/50 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% rounded-lg">
            <Award className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-black">ISO Compliance</h3>
        </div>

        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
            <span className="text-[10px] font-normal text-gray-600">{productFamily.isoStandard}</span>
            <CheckCircle2 className="w-3 h-3 text-[#4567a4]" />
          </div>
          <div className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
            <span className="text-[10px] font-normal text-gray-600">SAE Ports</span>
            <CheckCircle2 className="w-3 h-3 text-[#4567a4]" />
          </div>
          <div className="col-span-2 flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-gray-100 shadow-sm">
            <span className="text-[10px] font-normal text-gray-600">Configuration Valid</span>
            {validation.isValid ? (
              <CheckCircle2 className="w-3 h-3 text-[#da789b]" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-red-500" />
            )}
          </div>
        </div>


      </div>

      {/* 3. Pricing Section */}
      <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% rounded-xl">
              <DollarSign className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-sm font-bold text-black">Pricing</h3>
          </div>

        </div>

        <div className="space-y-2 mb-6">
          <div className="flex justify-between text-xs font-normal">
            <span className="text-gray-400">Base Price</span>
            <span className="text-black font-bold">${pricing.basePrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-normal">
            <span className="text-gray-400">Bore Adjustment</span>
            <span className="text-black font-bold">${pricing.boreMultiplier.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-normal">
            <span className="text-gray-400">Stroke Cost</span>
            <span className="text-black font-bold">${pricing.strokeCost.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-xs font-normal">
            <span className="text-gray-400">Add-ons</span>
            <span className="text-black font-bold">${(pricing.pressurePremium + pricing.portCost).toFixed(2)}</span>
          </div>
          <div className="border-t-2 border-[#da789b] pt-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-black">Estimated Price</span>
              <span className="text-2xl font-bold text-black">
                ${pricing.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-8">

          <button
            onClick={onRequestQuote}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-black border border-gray-200 rounded-full font-bold text-xs transition-all shadow-sm hover:shadow-md"
          >
            <FileText className="w-4 h-4" />
            Get Quote
          </button>
          <button
            onClick={onSaveVersion}
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white rounded-full font-bold text-xs transition-all hover:opacity-90 shadow-sm"
          >
            <GitCompare className="w-4 h-4" />
            Save Version
          </button>
        </div>

        {/* 4. Manufacturing Scope - Moved to bottom of Pricing Section */}

      </div>
      <div className="pt-6 border-t border-gray-100">
        <div className=" bg-[#4567a4]/10 border border-[#4567a4]/30 rounded-xl p-4">
          <h4 className="text-[13px] font-bold text-black mb-2 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full"></div>
            Manufacturing Scope
          </h4>
          <div className="text-[11px] font-normal text-gray-600 leading-relaxed">
            {config?.cylinderType === 'welded-tang' ? (
              <p>Welded construction with 3500 PSI peak rating. ISO 6022 compliant design for heavy industrial mobile use.</p>
            ) : (
              <p>Modular tie-rod design per ISO 6020. Serviceable components for indoor plant hydraulic systems.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
