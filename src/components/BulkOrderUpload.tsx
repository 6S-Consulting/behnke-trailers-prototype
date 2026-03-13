import { useState, useRef } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  X,
  CheckCircle2,
  AlertCircle,
  ShoppingCart,
  Phone,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";
import { useRouter } from "@/lib/router";

interface BulkOrderUploadProps {
  variant?: "compact" | "full";
  className?: string;
}

interface ProcessedResult {
  availableProducts: Array<{ id: string; name: string; quantity: number; image: string }>;
  unavailableProducts: Array<{ name: string; reason: string; image?: string }>;
}

export function BulkOrderUpload({
  variant = "full",
  className = "",
}: BulkOrderUploadProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedResult, setProcessedResult] =
    useState<ProcessedResult | null>(null);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [expandAvailable, setExpandAvailable] = useState(true);
  const [expandUnavailable, setExpandUnavailable] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addToCart, openCart } = useCart();
  const { navigate } = useRouter();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setProcessedResult(null);
      setShowResultDialog(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const simulateAIProcessing = (): ProcessedResult => {
    // Simulate AI processing - randomly select products from database
    const availableProducts = products.filter(
      (p) => p.stockStatus === "In Stock",
    );
    const soldOutProducts = products.filter(
      (p) => p.stockStatus !== "In Stock",
    );

    // Randomly pick 3-7 available products
    const numAvailable = Math.floor(Math.random() * 5) + 3;
    const selectedAvailable = [];
    for (let i = 0; i < Math.min(numAvailable, availableProducts.length); i++) {
      const randomIndex = Math.floor(Math.random() * availableProducts.length);
      const product = availableProducts[randomIndex];
      selectedAvailable.push({
        id: product.id,
        name: product.name,
        quantity: Math.floor(Math.random() * 10) + 1,
        image: product.image,
      });
      availableProducts.splice(randomIndex, 1);
    }

    // Randomly pick 0-3 unavailable products
    const numUnavailable = Math.floor(Math.random() * 4);
    const selectedUnavailable = [];
    for (let i = 0; i < Math.min(numUnavailable, soldOutProducts.length); i++) {
      const randomIndex = Math.floor(Math.random() * soldOutProducts.length);
      const product = soldOutProducts[randomIndex];
      selectedUnavailable.push({
        name: product.name,
        reason: product.stockStatus || "Out of Stock",
        image: product.image,
      });
      soldOutProducts.splice(randomIndex, 1);
    }

    // Add some mock products that don't exist in database
    if (Math.random() > 0.5) {
      selectedUnavailable.push({
        name: "Custom Hydraulic Pump XL-2500",
        reason: "Product not found in catalog",
      });
    }

    return {
      availableProducts: selectedAvailable,
      unavailableProducts: selectedUnavailable,
    };
  };

  const handleProcessFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);

    // Simulate AI processing delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const result = simulateAIProcessing();
    setProcessedResult(result);
    setShowResultDialog(true);
    setIsProcessing(false);
  };

  const handleAddToCart = () => {
    if (!processedResult) return;

    processedResult.availableProducts.forEach((item) => {
      const product = products.find((p) => p.id === item.id);
      if (product) {
        for (let i = 0; i < item.quantity; i++) {
          addToCart(product);
        }
      }
    });

    setShowResultDialog(false);
    setSelectedFile(null);
    setProcessedResult(null);
    openCart();
  };

  const handleContactSales = () => {
    navigate("/contact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removeFile = () => {
    setSelectedFile(null);
    setProcessedResult(null);
    setShowResultDialog(false);
  };

  if (variant === "compact") {
    return (
      <div className={className}>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          className="bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% text-white font-bold whitespace-nowrap hover:opacity-95"
          size="lg"
        >
          <Upload className="mr-2" size={18} />
          Bulk Order List? Click to Upload
        </Button>

        {/* Processing Dialog */}
        {(selectedFile || showResultDialog) && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b ">
                <div className="flex items-center justify-between ">
                  <h3 className="text-xl font-bold text-slate-900">
                    Bulk Order Upload
                  </h3>
                  <button
                    onClick={removeFile}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                {!processedResult ? (
                  <div className="space-y-6">
                    {/* File Preview */}
                    <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#4567a4]/10 text-[#4567a4] shrink-0">
                        {selectedFile?.type.startsWith("image/") ? (
                          <ImageIcon size={24} />
                        ) : (
                          <FileText size={24} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {selectedFile?.name}
                        </p>
                        <p className="text-xs text-slate-500">
                          {selectedFile &&
                            `${(selectedFile.size / 1024).toFixed(1)} KB`}
                        </p>
                      </div>
                    </div>

                    <div className="text-sm text-slate-600 space-y-2">
                      <p className="font-semibold">
                        AI will process this file to:
                      </p>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          Extract product information from your order list
                        </li>
                        <li>Match products with our database</li>
                        <li>Check stock availability</li>
                        <li>Add available products to your cart</li>
                      </ul>
                    </div>

                    <Button
                      onClick={handleProcessFile}
                      disabled={isProcessing}
                      className="w-full bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% text-white hover:opacity-95"
                      size="lg"
                    >
                      {isProcessing ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Processing with AI...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 text-white" size={18} />
                          Process File
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Summary Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-green-600 font-semibold">
                              MATCHED
                            </p>
                            <p className="text-2xl font-black text-green-700 mt-1">
                              {processedResult.availableProducts.length}
                            </p>
                          </div>
                          <CheckCircle2 className="text-green-600" size={32} />
                        </div>
                      </div>
                      <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-amber-600 font-semibold">
                              UNAVAILABLE
                            </p>
                            <p className="text-2xl font-black text-amber-700 mt-1">
                              {processedResult.unavailableProducts.length}
                            </p>
                          </div>
                          <AlertCircle className="text-amber-600" size={32} />
                        </div>
                      </div>
                    </div>

                    {/* Available Products */}
                    {processedResult.availableProducts.length > 0 && (
                      <div className="space-y-3">
                        <button
                          onClick={() => setExpandAvailable(!expandAvailable)}
                          className="w-full flex items-center justify-between gap-2 text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <CheckCircle2 size={20} />
                            <h4 className="font-bold text-lg">
                              Available Products
                            </h4>
                          </div>
                          <ChevronDown
                            size={20}
                            className={`transition-transform ${
                              expandAvailable ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                        </button>
                        {expandAvailable && (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {processedResult.availableProducts.map(
                              (item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-white border border-slate-200">
                                    <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm text-slate-900">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-0.5">
                                      ID: {item.id}
                                    </p>
                                  </div>
                                  <div className="flex flex-col items-end">
                                    <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                                      {item.quantity}x
                                    </span>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Unavailable Products */}
                    {processedResult.unavailableProducts.length > 0 && (
                      <div className="space-y-3">
                        <button
                          onClick={() =>
                            setExpandUnavailable(!expandUnavailable)
                          }
                          className="w-full flex items-center justify-between gap-2 text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <AlertCircle size={20} />
                            <h4 className="font-bold text-lg">
                              Unavailable Products
                            </h4>
                          </div>
                          <ChevronDown
                            size={20}
                            className={`transition-transform ${
                              expandUnavailable ? "rotate-0" : "-rotate-90"
                            }`}
                          />
                        </button>
                        {expandUnavailable && (
                          <div className="space-y-2 max-h-64 overflow-y-auto">
                            {processedResult.unavailableProducts.map(
                              (item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg hover:shadow-md transition-shadow"
                                >
                                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-white border border-slate-200">
                                    {item.image ? (
                                      <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1 opacity-60 grayscale" />
                                    ) : (
                                       <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                                         <ImageIcon size={16} />
                                       </div>
                                    )}
                                  </div>
                                  <div className="flex-1">
                                    <p className="font-semibold text-sm text-slate-900 text-slate-500">
                                      {item.name}
                                    </p>
                                    <p className="text-xs text-amber-600 font-medium mt-0.5">
                                      {item.reason}
                                    </p>
                                  </div>
                                </div>
                              ),
                            )}
                          </div>
                        )}
                        <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <Phone
                            className="text-blue-600 mt-0.5 shrink-0"
                            size={18}
                          />
                          <div>
                            <p className="text-sm font-semibold text-blue-900">
                              Need these products?
                            </p>
                            <p className="text-xs text-blue-700 mt-1">
                              Contact our team for custom orders, lead times, or
                              alternative solutions.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                              onClick={handleContactSales}
                            >
                              Contact Sales
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4 border-t border-slate-200">
                      {processedResult.availableProducts.length > 0 && (
                        <Button
                          onClick={handleAddToCart}
                          className="flex-1 bg-[#4567a4] hover:bg-[#3d5b92] text-white"
                          size="lg"
                        >
                          <ShoppingCart className="mr-2" size={18} />
                          Add {processedResult.availableProducts.length}{" "}
                          Products to Cart
                        </Button>
                      )}
                      <Button onClick={removeFile} variant="outline" size="lg">
                        Close
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full variant
  return (
    <div
      className={`bg-white rounded-xl shadow-sm border border-slate-200 p-6 ${className}`}
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100%">
          <Upload size={20} className="text-white" />
        </div>
        <div>
          <h3 className="font-bold text-lg text-slate-900">
            Bulk Order Upload
          </h3>
          <p className="text-sm text-slate-600">
            Upload your order file for AI processing
          </p>
        </div>
      </div>

      <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#4567a4] transition-colors bg-slate-50 cursor-pointer relative">
        <input
          type="file"
          ref={fileInputRef}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".csv,.xlsx,.xls,.pdf,.jpg,.jpeg,.png"
          onChange={handleFileSelect}
          aria-label="Upload order file - CSV, XLSX, XLS, PDF, JPG, PNG formats accepted"
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-20% via-[#4567a4] via-50% to-[#00a1d0] to-100% shadow-lg">
            <Upload size={32} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">
              {selectedFile
                ? selectedFile.name
                : "Click to upload or drag and drop"}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              CSV, Excel, PDF, or Image files (Max 10MB)
            </p>
          </div>
        </div>
      </div>

      {selectedFile && (
        <div className="mt-4">
          <Button
            onClick={handleProcessFile}
            disabled={isProcessing}
            className="w-full bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-50% via-[#4567a4] via-80% to-[#00a1d0] to-100% text-white hover:opacity-95"
            size="lg"
          >
            {isProcessing ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Processing with AI...
              </>
            ) : (
              <>
                <Upload className="mr-2 text-white" size={18} />
                Process File with AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* Result Dialog - Same as compact version */}
      {showResultDialog && processedResult && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-slate-200 bg-gradient-to-r from-[#da789b]/10 from-0% via-[#cb44a8]/10 via-50% via-[#4567a4]/10 via-80% to-[#00a1d0]/10 to-100%">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">
                  Processing Results
                </h3>
                <button
                  onClick={() => setShowResultDialog(false)}
                  className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)] space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-green-600 font-semibold">
                        MATCHED
                      </p>
                      <p className="text-2xl font-black text-green-700 mt-1">
                        {processedResult.availableProducts.length}
                      </p>
                    </div>
                    <CheckCircle2 className="text-green-600" size={32} />
                  </div>
                </div>
                <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-amber-600 font-semibold">
                        UNAVAILABLE
                      </p>
                      <p className="text-2xl font-black text-amber-700 mt-1">
                        {processedResult.unavailableProducts.length}
                      </p>
                    </div>
                    <AlertCircle className="text-amber-600" size={32} />
                  </div>
                </div>
              </div>

              {/* Available Products */}
              {processedResult.availableProducts.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setExpandAvailable(!expandAvailable)}
                    className="w-full flex items-center justify-between gap-2 text-green-600 hover:bg-green-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={20} />
                      <h4 className="font-bold text-lg">Available Products</h4>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        expandAvailable ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                  {expandAvailable && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {processedResult.availableProducts.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-white border border-slate-200">
                            <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1" />
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              ID: {item.id}
                            </p>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="px-3 py-1 bg-green-600 text-white text-xs font-bold rounded-full">
                              {item.quantity}x
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Unavailable Products */}
              {processedResult.unavailableProducts.length > 0 && (
                <div className="space-y-3">
                  <button
                    onClick={() => setExpandUnavailable(!expandUnavailable)}
                    className="w-full flex items-center justify-between gap-2 text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <AlertCircle size={20} />
                      <h4 className="font-bold text-lg">
                        Unavailable Products
                      </h4>
                    </div>
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        expandUnavailable ? "rotate-0" : "-rotate-90"
                      }`}
                    />
                  </button>
                  {expandUnavailable && (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {processedResult.unavailableProducts.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg hover:shadow-md transition-shadow"
                        >
                          <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-white border border-slate-200">
                            {item.image ? (
                              <img src={item.image} alt={item.name} className="h-full w-full object-contain p-1 opacity-60 grayscale" />
                            ) : (
                               <div className="h-full w-full bg-slate-100 flex items-center justify-center text-slate-400">
                                 <ImageIcon size={16} />
                               </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-sm text-slate-900 text-slate-500">
                              {item.name}
                            </p>
                            <p className="text-xs text-amber-600 font-medium mt-0.5">
                              {item.reason}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Phone
                      className="text-blue-600 mt-0.5 shrink-0"
                      size={18}
                    />
                    <div>
                      <p className="text-sm font-semibold text-blue-900">
                        Need these products?
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        Contact our team for custom orders, lead times, or
                        alternative solutions.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                        onClick={handleContactSales}
                      >
                        Contact Sales
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4 border-t border-slate-200">
                {processedResult.availableProducts.length > 0 && (
                  <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-[#4567a4] hover:bg-[#3d5b92] text-white"
                    size="lg"
                  >
                    <ShoppingCart className="mr-2" size={18} />
                    Add {processedResult.availableProducts.length} Products to
                    Cart
                  </Button>
                )}
                <Button
                  onClick={() => setShowResultDialog(false)}
                  variant="outline"
                  size="lg"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
