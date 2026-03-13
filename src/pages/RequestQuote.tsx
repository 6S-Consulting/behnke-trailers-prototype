import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { products } from "@/data/products";
import { useQuotes } from "@/context/QuoteContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { FileText, Search, Upload, Calendar, MapPin, Lock } from "lucide-react";
import { toast } from "sonner";

export function RequestQuote() {
  const { navigate, searchParams } = useRouter();
  const { addQuote } = useQuotes();
  const { isLoggedIn } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  // Pre-select product or construct custom config if passed in URL
  const selectedProductId = searchParams.get("productId");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProduct, setSelectedProduct] = useState<any>(() => {
    // 1. Standard Product ID lookup
    if (selectedProductId) {
      return products.find((p) => p.id === selectedProductId) || null;
    }

    return null;
  });

  const [quantity, setQuantity] = useState(50); // Default bulk quantity
  const [targetPrice, setTargetPrice] = useState("");
  const [timeline, setTimeline] = useState("");
  const [zipCode, setZipCode] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    // If user is not logged in, we can either redirect immediately
    // or show a blocked state. Given "ask sign in before the request quote",
    // a redirect or a dedicated "Sign In" view is best.
    // We'll handle the UI based on isLoggedIn state.
  }, [isLoggedIn]);

  // Filter products for the list
  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const handleSubmitQuote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    // In a real app, we would upload the file and send these details to the backend.
    // For now, we'll append important details to the notes or handle them as needed.
    // Since addQuote only takes items and total, we will simulate passing extra data
    // or assume the backend handles it from the proper API endpoint.
    // For this prototype, we'll just proceed with basic quote addition.

    addQuote({
      items: [
        {
          ...selectedProduct,
          quantity: quantity,
        },
      ],
      total: selectedProduct.price * quantity,
    });

    toast.success("Quote Requested Successfully", {
      description: "Check your account for status updates.",
    });

    // Navigate to quote history
    navigate("/account?tab=quotes");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-slate-200">
          <div className="mx-auto w-16 h-16 bg-[#4567a4]/10 rounded-full flex items-center justify-center mb-6">
            <Lock className="text-[#4567a4]" size={32} />
          </div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">
            Sign In Required
          </h1>
          <p className="text-slate-500 mb-8">
            To request bulk quotes and track their status, you must be logged in
            to your account.
          </p>
          <div className="space-y-3">
            <Button
              size="lg"
              className="w-full bg-slate-900 text-white hover:bg-slate-800"
              onClick={() => navigate("/login?redirect=/request-quote")}
            >
              Sign In to Continue
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/catalog")}
            >
              Return to Catalog
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 mb-2">
              Request Bulk Quote
            </h1>
            <p className="text-slate-500 max-w-2xl">
              Get competitive pricing for high-volume orders. Browse our catalog
              below or select specific items to receive a custom quote.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/catalog")}>
              Browse Catalog
            </Button>
            <Button onClick={() => navigate("/account?tab=quotes")}>
              View Quote History
            </Button>
          </div>
        </div>

        {/* Modal-like section for specific product request (if selected) */}
        {selectedProduct && (
          <div className="bg-white rounded-xl shadow-lg border border-[#4567a4]/30 p-8 mb-12 animate-in slide-in-from-top-4 duration-300 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#4567a4]"></div>

            <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="text-[#4567a4]" />
              Quote Request Details
            </h2>

            <div className="grid md:grid-cols-3 gap-8">
              <div
                className="md:col-span-1 border border-slate-100 rounded-lg p-4 bg-slate-50/50 h-fit"
              >
                <div className="w-full h-48 mb-4 bg-white rounded-md border border-slate-200 relative overflow-hidden flex items-center justify-center">
                  {selectedProduct.image ? (
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full bg-slate-100 text-slate-400">
                      <FileText className="w-12 h-12 opacity-20" />
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-slate-900 mb-1">
                  {selectedProduct.name}
                </h3>
                <p className="text-sm text-slate-500 mb-2">
                  {selectedProduct.category}
                </p>
                <div className="text-sm border-t border-slate-200 pt-3 mt-3 space-y-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">
                      Unit Price:
                    </span>
                    <span>${selectedProduct.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-slate-700">
                      Min. Order:
                    </span>
                    <span>50 Units</span>
                  </div>

                  {/* Display Specs if available */}
                  {selectedProduct.specs && (
                    <div className="pt-2 mt-2 border-t border-slate-100 space-y-1">
                      {selectedProduct.specs.displacement && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Displacement:</span>
                          <span className="font-medium text-slate-700">
                            {selectedProduct.specs.displacement}
                          </span>
                        </div>
                      )}
                      {selectedProduct.specs.maxPressure && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Pressure:</span>
                          <span className="font-medium text-slate-700">
                            {selectedProduct.specs.maxPressure}
                          </span>
                        </div>
                      )}
                      {selectedProduct.specs.mounting && (
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-500">Mounting:</span>
                          <span className="font-medium text-slate-700">
                            {selectedProduct.specs.mounting}
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <form onSubmit={handleSubmitQuote} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Target Quantity *
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) =>
                          setQuantity(parseInt(e.target.value) || 0)
                        }
                        className="w-full rounded-lg border-slate-300 p-3 text-sm focus:ring-[#4567a4]/10 focus:border-[#4567a4]/30"
                        required
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        <span className="font-semibold text-[#4567a4]">
                          Bulk Tier 1:
                        </span>{" "}
                        50+ units (5% off)
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2">
                        Target Price / Unit ($)
                      </label>
                      <input
                        type="number"
                        placeholder="Optional"
                        value={targetPrice}
                        onChange={(e) => setTargetPrice(e.target.value)}
                        className="w-full rounded-lg border-slate-300 p-3 text-sm focus:ring-[#4567a4]/10 focus:border-[#4567a4]/30"
                      />
                      <p className="text-xs text-slate-500 mt-2">
                        Est. Total:{" "}
                        <span className="font-bold text-slate-900">
                          ${(quantity * selectedProduct.price).toFixed(2)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <Calendar size={16} className="text-slate-400" />
                        Project Timeline *
                      </label>
                      <select
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        className="w-full rounded-lg border-slate-300 p-3 text-sm focus:ring-[#4567a4]/10 focus:border-[#4567a4]/30"
                        required
                      >
                        <option value="">Select timeline...</option>
                        <option value="immediate">Immediate (ASAP)</option>
                        <option value="1_month">Within 1 month</option>
                        <option value="3_months">1-3 months</option>
                        <option value="planning">Budgeting / Planning</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <MapPin size={16} className="text-slate-400" />
                        Delivery Zip Code *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 90210"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        className="w-full rounded-lg border-slate-300 p-3 text-sm focus:ring-[#4567a4]/10 focus:border-[#4567a4]/30"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      className="w-full rounded-lg border-slate-300 p-3 text-sm h-32 focus:ring-[#4567a4]/10 focus:border-[#4567a4]/30"
                      placeholder="Any specific requirements, custom dimensions, or delivery instructions..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700 mb-2">
                      Attachments (Optional)
                    </label>
                    <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-[#4567a4] bg-slate-50 cursor-pointer relative">
                      <input
                        type="file"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) =>
                          setFile(e.target.files ? e.target.files[0] : null)
                        }
                        aria-label="Upload attachments - PDF, JPG, PNG up to 10MB"
                      />
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="text-slate-400" size={24} />
                        <span className="text-sm font-medium text-slate-600">
                          {file
                            ? file.name
                            : "Click to upload PO or technical drawings"}
                        </span>
                        <span className="text-xs text-slate-400">
                          PDF, JPG, PNG up to 10MB
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-4 border-t border-slate-100">
                    <Button
                      type="submit"
                      size="lg"
                      className="bg-slate-900 text-white hover:bg-slate-800 min-w-[200px]"
                    >
                      Submit Request
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedProduct(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Product List Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-center gap-4">
            <h2 className="text-lg font-bold text-slate-900">
              Eligible Products
            </h2>
            <div className="relative w-full md:w-96">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#4567a4]/10"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-bold text-slate-500">
                <tr>
                  <th className="px-6 py-4">Product</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Min. Bulk Qty</th>
                  <th className="px-6 py-4">Est. Value</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-white rounded border border-slate-200 p-1 flex-shrink-0">
                          <img
                            src={product.image}
                            className="h-full w-full object-contain"
                            alt=""
                          />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 line-clamp-1">
                            {product.name}
                          </div>
                          <div className="text-xs text-slate-500">
                            {product.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {product.category}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        50+ Units
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      ${product.price ? product.price.toFixed(2) : "0.00"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        className="hover:bg-slate-900 hover:text-white transition-colors"
                        onClick={() => {
                          setSelectedProduct(product);
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                      >
                        Request Quote
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-12 text-center text-slate-500">
              No products found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
