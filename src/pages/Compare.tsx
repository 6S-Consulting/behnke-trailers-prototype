import { useCompare } from "@/context/CompareContext";
import { useCart } from "@/context/CartContext";
import { useRouter } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ShoppingCart, Trash2, X } from "lucide-react";

export function Compare() {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const { navigate } = useRouter();

  if (compareList.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">Product Comparison</h1>
        <p className="text-slate-500 mb-8">
          You haven't added any products to compare yet.
        </p>
        <Button onClick={() => navigate("/catalog")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Go to Catalog
        </Button>
      </div>
    );
  }

  const allSpecs = Array.from(
    new Set(
      compareList.flatMap((product) => Object.keys(product.specs || {}))
    )
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Compare Products</h1>
        <Button variant="outline" onClick={clearCompare} className="text-[#4567a4] border-[#4567a4]/30 hover:text-[#4567a4]">
          <Trash2 className="mr-2 h-4 w-4" /> Clear All
        </Button>
      </div>

      <div className="overflow-x-auto pb-4">
        <div className="min-w-[800px]">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-4 text-left w-48 bg-slate-50 border-b border-slate-200 sticky left-0 z-10">
                  <span className="font-bold text-slate-700">Product</span>
                </th>
                {compareList.map((product) => (
                  <th key={product.id} className="p-4 border-b border-l border-slate-200 w-64 align-top">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-2 -right-2 p-1 bg-white rounded-full shadow-sm border border-slate-200 hover:text-red-600 transition-colors"
                      >
                        <X size={16} />
                      </button>
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-40 object-contain mb-4 rounded-lg bg-white border border-slate-100 p-2"
                      />
                      <h3 className="font-bold text-lg mb-2 line-clamp-2 h-14">
                        {product.name}
                      </h3>
                      <div className="text-xl font-bold text-slate-900 mb-4">
                        ${product.price.toFixed(2)}
                      </div>
                      <Button 
                        onClick={() => addToCart(product)}
                        className="w-full bg-gradient-to-r from-[#da789b] from-0% via-[#cb44a8] via-30% via-[#4567a4] via-50% to-[#00a1d0] to-100% text-white font-bold hover:opacity-90"
                        disabled={product.stockStatus === "Out of Stock"}
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Add to Cart
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              <tr>
                <td className="p-4 font-semibold text-slate-700 bg-slate-50 sticky left-0">Category</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 border-l border-slate-200 text-slate-600">
                    {product.category}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 bg-slate-50 sticky left-0">SKU</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 border-l border-slate-200 font-mono text-xs text-slate-500">
                    {product.id}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-semibold text-slate-700 bg-slate-50 sticky left-0">Availability</td>
                {compareList.map((product) => (
                  <td key={product.id} className="p-4 border-l border-slate-200">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        product.stockStatus === "In Stock"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {product.stockStatus}
                    </span>
                  </td>
                ))}
              </tr>
              {allSpecs.map((specKey) => (
                <tr key={specKey}>
                  <td className="p-4 font-semibold text-slate-700 bg-slate-50 sticky left-0 capitalize">
                    {specKey.replace(/([A-Z])/g, " $1").trim()}
                  </td>
                  {compareList.map((product) => (
                    <td key={product.id} className="p-4 border-l border-slate-200 text-slate-600">
                      {/* @ts-expect-error - Dynamic key access */}
                      {product.specs[specKey] || "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
