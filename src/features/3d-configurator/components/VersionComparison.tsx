import { useState } from 'react';
import { History, GitCompare, Trash2, X, Check, CheckCircle2, ArrowRight, RotateCcw, Sparkles, Zap } from 'lucide-react';
import { SavedConfiguration } from '../types/cylinder';

interface VersionComparisonProps {
    savedVersions: SavedConfiguration[];
    onSaveVersion: () => void;
    onDeleteVersion: (id: string) => void;
    onLoadVersion: (config: SavedConfiguration) => void;
    isOpen: boolean;
    onClose: () => void;
}

export default function VersionComparison({
    savedVersions,
    onSaveVersion,
    onDeleteVersion,
    onLoadVersion,
    isOpen,
    onClose,
}: VersionComparisonProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [showComparison, setShowComparison] = useState(false);

    const toggleSelection = (id: string) => {
        setSelectedIds((prev) =>
            prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
        );
    };

    const selectedVersions = savedVersions.filter((v) => selectedIds.includes(v.id));

    const comparisonFields = [
        { label: 'Bore', getValue: (v: SavedConfiguration) => `${v.config.bore}"` },
        { label: 'Stroke', getValue: (v: SavedConfiguration) => `${v.config.stroke}"` },
        { label: 'Rod Diameter', getValue: (v: SavedConfiguration) => `${v.config.rodDiameter}"` },
        { label: 'Pressure', getValue: (v: SavedConfiguration) => `${v.config.operatingPressure} PSI` },
        { label: 'Rod Material', getValue: (v: SavedConfiguration) => (v.config.rodMaterial || 'N/A').replace(/-/g, ' ') },
        { label: 'Rod Finish', getValue: (v: SavedConfiguration) => (v.config.rodFinish || 'N/A').replace(/-/g, ' ') },
        { label: 'Barrel Finish', getValue: (v: SavedConfiguration) => (v.config.barrelFinish || 'N/A').replace(/-/g, ' ') },
        { label: 'Seal Type', getValue: (v: SavedConfiguration) => v.config.sealType || 'N/A' },
        { label: 'Retracted Length', getValue: (v: SavedConfiguration) => `${(v.dimensions?.retractedLength || 0).toFixed(2)}"` },
        { label: 'Total Price', getValue: (v: SavedConfiguration) => `$${(v.pricing?.totalPrice || 0).toFixed(2)}` },
    ];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-[#da789b]/10 rounded-2xl">
                            <History className="w-6 h-6 text-[#da789b]" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-black">Version Comparison</h2>
                            <p className="text-xs font-normal text-gray-400">Manage and compare saved configurations</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-gray-50 rounded-full transition-all text-gray-400 hover:text-black border border-transparent hover:border-gray-200"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-auto p-8 bg-gray-50/50">
                    {!showComparison ? (
                        <div className="space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-sm font-bold text-black">Saved Configurations</h3>
                                <button
                                    onClick={onSaveVersion}
                                    className="px-6 py-2.5 bg-[#F5F5F5] text-black rounded-full transition-all shadow-lg hover:bg-black hover:text-white text-xs font-bold"
                                >
                                    Save Current
                                </button>
                            </div>

                            {savedVersions.length === 0 ? (
                                <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                    <RotateCcw className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                                    <p className="text-gray-400 font-normal text-[10px]">No versions found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {savedVersions.map((version) => (
                                        <div
                                            key={version.id}
                                            className={`relative group border-2 rounded-2xl p-6 transition-all duration-300 cursor-pointer ${selectedIds.includes(version.id)
                                                ? 'border-[#da789b] bg-white shadow-xl ring-4 ring-[#da789b]/5'
                                                : 'border-white bg-white hover:border-gray-200 shadow-sm'
                                                }`}
                                            onClick={() => toggleSelection(version.id)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <p className="text-lg font-bold text-black">{version.name}</p>
                                                    <p className="text-[10px] font-normal text-gray-400 mt-1">
                                                        {new Date(version.timestamp).toLocaleString()}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedIds.includes(version.id) && (
                                                        <div className="p-1.5 bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% rounded-full shadow-lg">
                                                            <Check className="w-3 h-3 text-white" />
                                                        </div>
                                                    )}
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            onDeleteVersion(version.id);
                                                        }}
                                                        className="p-2 opacity-0 group-hover:opacity-100 hover:bg-gray-50 hover:text-black text-gray-400 rounded-full transition-all border border-transparent hover:border-gray-100"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 text-[10px] font-normal mt-4 pt-4 border-t border-gray-50">
                                                <div className="flex flex-col gap-1">
                                                    <span className="text-gray-400">Bore × Stroke</span>
                                                    <span className="text-black text-sm font-bold">{version.config?.bore || 0}" × {version.config?.stroke || 0}"</span>
                                                </div>
                                                <div className="flex flex-col gap-1 text-right">
                                                    <span className="text-gray-400">Total Price</span>
                                                    <span className="text-black text-sm font-bold">${(version.pricing?.totalPrice || 0).toFixed(2)}</span>
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        onLoadVersion(version);
                                                        onClose();
                                                    }}
                                                    className="w-full py-2.5 bg-gray-50 hover:bg-black hover:text-white text-black rounded-xl text-[10px] font-bold transition-all border border-gray-100"
                                                >
                                                    Load Configuration
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setShowComparison(false)}
                                    className="text-[10px] font-normal text-black hover:text-[#4567a4] flex items-center gap-2"
                                >
                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                    Back to Versions
                                </button>
                                <div className="flex items-center gap-3">
                                    <GitCompare className="w-5 h-5 text-black" />
                                    <h3 className="text-sm font-bold text-black">Comparison Matrix</h3>
                                </div>
                            </div>

                            <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm">
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr>
                                                <th className="p-6 bg-gray-50/50 text-gray-400 text-[10px] font-normal border-b border-gray-100 sticky left-0 z-10 backdrop-blur-sm">Parameter</th>
                                                {selectedVersions.map((v) => (
                                                    <th key={v.id} className="p-6 bg-gray-50/50 text-center border-b border-gray-100 min-w-[180px]">
                                                        <div className="font-bold text-black text-xs">{v.name}</div>
                                                        <div className="text-[10px] text-gray-400 font-normal mt-1">{new Date(v.timestamp).toLocaleTimeString()}</div>
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {comparisonFields.map((field, idx) => (
                                                <tr key={field.label} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/20'}>
                                                    <td className="p-6 text-gray-400 text-[10px] font-normal sticky left-0 bg-white border-b border-gray-50">{field.label}</td>
                                                    {selectedVersions.map((v) => {
                                                        const val = field.getValue(v);
                                                        const isDifferent = selectedVersions.length > 1 && val !== field.getValue(selectedVersions[0]);
                                                        return (
                                                            <td key={v.id} className={`p-6 text-center border-b border-gray-50 font-bold text-xs ${isDifferent ? 'text-[#da789b]' : 'text-black'}`}>
                                                                {val}
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            <div className="p-8 bg-[#4567a4]/10 rounded-3xl shadow-lg overflow-hidden relative border border-[#4567a4]/30">
                                <div className="relative z-10">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-2.5 bg-[#4567a4]/20 rounded-xl">
                                            <Sparkles className="w-5 h-5 text-[#4567a4]" />
                                        </div>
                                        <h3 className="text-lg font-bold text-[#4567a4]">AI Insights</h3>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="bg-white border border-[#4567a4]/20 p-6 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Zap className="w-4 h-4 text-[#4567a4]" />
                                                <span className="font-bold text-[#4567a4] text-[10px]">Best Value</span>
                                            </div>
                                            <p className="text-xs text-gray-600 font-normal leading-relaxed">
                                                CURRENT OPTIMIZATION: <span className="text-[#4567a4] font-bold">
                                                    {selectedVersions.reduce((prev, curr) =>
                                                        (prev.pricing?.totalPrice || 0) < (curr.pricing?.totalPrice || 0) ? prev : curr).name}
                                                </span> OFFERS THE MOST COMPETITIVE PRICING FOR THESE SPECIFICATIONS.
                                            </p>
                                        </div>

                                        <div className="bg-white border border-[#4567a4]/20 p-6 rounded-2xl">
                                            <div className="flex items-center gap-2 mb-3">
                                                <CheckCircle2 className="w-4 h-4 text-[#4567a4]" />
                                                <span className="font-bold text-[#4567a4] text-[10px]">Technical Fit</span>
                                            </div>
                                            <p className="text-xs text-gray-600 font-normal leading-relaxed">
                                                PERFORMANCE CHOICE: THE <span className="text-[#4567a4]">
                                                    {selectedVersions.reduce((prev, curr) =>
                                                        (prev.config?.operatingPressure || 0) > (curr.config?.operatingPressure || 0) ? prev : curr).name}
                                                </span> PROVIDES MAXIMUM PRESSURE TOLERANCE FOR INDUSTRIAL APPLICATIONS.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-gray-100 flex justify-between items-center bg-white">
                    <p className="text-[10px] font-normal text-gray-400">
                        {selectedIds.length} version{selectedIds.length !== 1 ? 's' : ''} selected for comparison
                    </p>
                    {!showComparison ? (
                        <button
                            disabled={selectedIds.length < 2}
                            onClick={() => setShowComparison(true)}
                            className="px-8 py-3 bg-[#F5F5F5] text-black hover:bg-black hover:text-white disabled:bg-gray-100 disabled:text-gray-300 disabled:cursor-not-allowed rounded-full transition-all font-bold text-xs shadow-xl shadow-black/10"
                        >
                            Compare Selected
                        </button>
                    ) : (
                        <button
                            onClick={() => setShowComparison(false)}
                            className="px-8 py-3 bg-gray-100 hover:bg-black hover:text-white text-black rounded-full transition-all font-bold text-xs"
                        >
                            Close Comparison
                        </button>
                    )}
                </div>
            </div>
        </div>
    );


}
