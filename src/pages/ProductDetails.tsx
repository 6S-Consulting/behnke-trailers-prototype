import { useState, useEffect } from "react";
import { useRouter } from "@/lib/router";
import { products } from "@/data/products";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Button } from "@/components/ui/button";

import {
  Check,
  Download,
  FileText,
  Minus,
  Plus,
  ShieldCheck,
  Truck,
  ChevronRight,
  ShoppingCart,
  FileCheck,
  Wrench,
  Award,
  Settings,
  Mail,
  Clock,
  Flag,
  Users,
  Star,
  CheckCircle,
  Heart,
  Share2,
  Scale,
} from "lucide-react";
import { useCompare } from "@/context/CompareContext";
import { toast } from "sonner";

// Per-category applications
const CATEGORY_APPS: Record<string, string[]> = {
  "Industrial Piston Pumps": [
    "Hydraulic Presses & Injection Molding",
    "Industrial Automation Systems",
    "Steel Mill & Metal Forming Equipment",
    "Machine Tool Hydraulics",
    "Test Benches & Simulation Rigs",
    "Process Industry Machinery",
  ],
  "Industrial Gear Pumps": [
    "Industrial Lubrication Circuits",
    "Fluid Transfer & Filtration Systems",
    "Hydraulic Power Units",
    "Coolant & Cutting Fluid Systems",
    "Chemical Processing Equipment",
    "Industrial Wash & Cleaning Systems",
  ],
  "Mobile Piston Pumps": [
    "Excavators & Backhoe Loaders",
    "Agricultural Tractors & Combines",
    "Cranes & Aerial Work Platforms",
    "Forestry Harvesters & Skidders",
    "Mining Shovels & Drill Rigs",
    "Hydrostatic Drive Transmissions",
  ],
  "Mobile Gear Pumps": [
    "Agricultural Implements & Spreaders",
    "Refuse Collection Trucks",
    "Utility & Service Vehicles",
    "Construction Equipment Aux. Circuits",
    "Material Handling Equipment",
    "Log Splitters & Wood Processing",
  ],
};

const DEFAULT_APPS = [
  "Industrial Machinery",
  "Construction Equipment",
  "Agricultural Applications",
  "Material Handling Systems",
  "Manufacturing & Automation",
  "Specialty Mobile Equipment",
];

export function ProductDetails() {
  const { route, navigate } = useRouter();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCompare, removeFromCompare, isInCompare, compareList } = useCompare();
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<"overview" | "specs" | "applications" | "downloads">("overview");

  const productId = route.split("/product/")[1];
  const product = products.find((p) => p.id === productId);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [productId]);

  // Variants within same groupId
  const allVariants = product?.groupId
    ? products.filter((p) => p.groupId === product.groupId)
    : product
    ? [product]
    : [];

  const availableDisplacements = Array.from(new Set(allVariants.map((p) => p.specs.displacement)));
  const availablePressures = Array.from(new Set(allVariants.map((p) => p.specs.maxPressure)));

  const handleVariantChange = (type: "displacement" | "pressure", value: string) => {
    let target;
    if (type === "displacement") {
      target =
        allVariants.find((p) => p.specs.displacement === value && p.specs.maxPressure === product?.specs.maxPressure) ||
        allVariants.find((p) => p.specs.displacement === value);
    } else {
      target =
        allVariants.find((p) => p.specs.maxPressure === value && p.specs.displacement === product?.specs.displacement) ||
        allVariants.find((p) => p.specs.maxPressure === value);
    }
    if (target) navigate(`/product/${target.id}`);
  };

  // Derive active image: prefer the manually selected thumbnail, reset when product changes
  const [selectedImage, setSelectedImage] = useState<string | undefined>(undefined);
  const productImage = product?.image;
  const activeImage = selectedImage ?? productImage;
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!product) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center bg-slate-50">
        <h2 className="mb-2 text-2xl font-bold text-slate-900">Product Not Found</h2>
        <p className="mb-6 text-slate-500">
          The hydraulic pump you are looking for does not exist or has been discontinued.
        </p>
        <Button onClick={() => navigate("/catalog")}>Return to Catalog</Button>
      </div>
    );
  }

  const isOutOfStock = product.stockStatus === "Out of Stock";
  const applications = CATEGORY_APPS[product.category] || DEFAULT_APPS;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    for (let i = 0; i < quantity; i++) addToCart(product);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-sm text-slate-500">
          <span className="cursor-pointer hover:text-[#4567a4]" onClick={() => navigate("/")}>Home</span>
          <span>/</span>
          <span className="cursor-pointer hover:text-[#4567a4]" onClick={() => navigate("/catalog")}>Catalog</span>
          <span>/</span>
          <span
            className="cursor-pointer hover:text-[#4567a4]"
            onClick={() => navigate(`/catalog?category=${encodeURIComponent(product.category)}`)}
          >
            {product.category}
          </span>
          <span>/</span>
          <span className="font-medium text-slate-900 truncate max-w-[200px]">{product.name}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 mb-12">
          {/* ── LEFT COLUMN — Gallery ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative overflow-hidden rounded-2xl bg-white border border-slate-200 shadow-sm cursor-zoom-in group"
              onClick={() => setIsModalOpen(true)}
            >

              <div className="p-6 aspect-square flex items-center justify-center">
                <img
                  src={activeImage}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain rounded-lg group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              {/* Stock badge */}
              <div
                className={`absolute top-4 left-4 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold border ${
                  isOutOfStock
                    ? "bg-red-50 text-red-700 border-red-200"
                    : "bg-green-50 text-green-700 border-green-200"
                }`}
              >
                <Check size={12} strokeWidth={3} />
                {isOutOfStock ? "Out of Stock" : "In Stock"}
              </div>

              {/* Wishlist */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleWishlist(product);
                }}
                className="absolute bottom-4 right-4 bg-white/90 hover:bg-white border border-slate-200 rounded-full p-2.5 shadow transition-all hover:shadow-md"
              >
                <Heart
                  size={20}
                  className={isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-slate-400"}
                  strokeWidth={1.5}
                />
              </button>
            </div>

            {/* Thumbnails */}
            {(product.gallery || []).length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {(product.gallery || [product.image]).map((img, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square cursor-pointer rounded-xl border-2 bg-white p-1.5 transition-all ${
                      activeImage === img ? "border-[#4567a4] shadow-md" : "border-slate-200 hover:border-[#4567a4]/50"
                    }`}
                    onClick={() => setSelectedImage(img)}
                  >
                    <img src={img} className="h-full w-full object-contain rounded" alt={`View ${idx + 1}`} />
                  </div>
                ))}
              </div>
            )}

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <ShieldCheck size={20} className="text-green-600" />, bg: "bg-green-100", title: "2-Year Warranty", sub: "Full Coverage" },
                { icon: <FileCheck size={20} className="text-blue-600" />, bg: "bg-blue-100", title: "Pressure Tested", sub: "Quality Assured" },
                { icon: <Award size={20} className="text-purple-600" />, bg: "bg-purple-100", title: "Industrial Grade", sub: "Heavy Duty" },
                { icon: <Truck size={20} className="text-[#4567a4]" />, bg: "bg-[#4567a4]/10", title: "Fast Shipping", sub: "Free on $2k+" },
              ].map((b, i) => (
                <div key={i} className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl p-3">
                  <div className={`${b.bg} p-2 rounded-lg`}>{b.icon}</div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">{b.title}</div>
                    <div className="text-xs text-slate-500">{b.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Certifications */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Quality Certifications</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { icon: <Award className="text-blue-600" size={24} />, label: "ISO 9001:2015", sub: "Certified" },
                  { icon: <Flag className="text-blue-600" size={24} />, label: "Made in USA", sub: "Domestic" },
                  { icon: <Users className="text-blue-600" size={24} />, label: "50+ Years", sub: "Experience" },
                ].map((c, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="bg-white rounded-lg p-2 mb-2">{c.icon}</div>
                    <div className="text-xs font-bold text-slate-900">{c.label}</div>
                    <div className="text-xs text-slate-600">{c.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Choose */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-4">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 uppercase">
                <Star className="text-blue-600" size={18} />
                Why Choose HYDRAULIC pumps?
              </h3>
              <ul className="space-y-2.5">
                {[
                  { title: "Precision Engineering:", body: "All pumps built to tight dimensional tolerances" },
                  { title: "100% Pressure Tested:", body: "Every pump tested to 1.5× rated pressure before shipping" },
                  { title: "Industrial-Grade Materials:", body: "Cast iron, steel, and premium alloys throughout" },
                  { title: "Fast Delivery:", body: "Ships within 5–10 business days from stock" },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={16} />
                    <div className="text-xs">
                      <strong className="text-slate-900">{item.title}</strong>{" "}
                      <span className="text-slate-600">{item.body}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* ── Modal ── */}
          {isModalOpen && (
            <div
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            >
              <button
                className="absolute top-4 right-4 text-white bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                <Minus className="rotate-45" size={28} />
              </button>
              <img
                src={activeImage}
                className="max-h-[90vh] max-w-full rounded-xl shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* ── RIGHT COLUMN — Product Info ── */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="mb-2 text-sm font-bold uppercase tracking-wider text-[#4567a4]">
                {product.category}
              </div>
              <h1 className="mb-3 text-2xl font-extrabold text-slate-900 lg:text-3xl leading-tight">
                {product.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold">SKU:</span>
                  <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{product.id.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <Clock size={15} />
                  <span className="font-semibold text-xs">Ships in 5–10 days</span>
                </div>
                <div className="ml-auto flex items-center gap-3">
                  <button
                    className={`flex items-center gap-1.5 text-sm transition-colors ${
                      isInCompare(product.id) ? "text-blue-600 font-bold" : "text-slate-500 hover:text-blue-600"
                    }`}
                    onClick={() => {
                      if (isInCompare(product.id)) {
                        removeFromCompare(product.id);
                        toast("Removed from comparison");
                      } else {
                        const count = compareList.length;
                        if (addToCompare(product)) {
                          if (count === 0) {
                            toast("Added. Add another product to compare.", {
                              action: { label: "Browse Catalog", onClick: () => navigate("/catalog") },
                            });
                          } else {
                            toast("Comparison ready!", {
                              action: { label: "Compare Now", onClick: () => navigate("/compare") },
                            });
                          }
                        }
                      }
                    }}
                  >
                    <Scale size={15} />
                    <span className="font-semibold">{isInCompare(product.id) ? "Comparing" : "Compare"}</span>
                  </button>
                  <button
                    className="flex items-center gap-1.5 text-sm hover:text-[#4567a4] transition-colors text-slate-500"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href);
                      toast("Link copied!");
                    }}
                  >
                    <Share2 size={15} />
                    <span className="font-semibold">Share</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="mb-6 p-5 bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-2xl">
              <div className="flex items-baseline gap-3 mb-3">
                <div className="text-4xl font-bold text-slate-900">${product.price.toFixed(2)}</div>
                <div className="text-sm text-slate-500 font-medium">per unit</div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full font-semibold">Indicative Price</span>
                <span className="bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold">Bulk Discounts Available</span>
                <span className="bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full font-semibold">Custom Specs Supported</span>
              </div>
            </div>

            {/* Variant / Configuration Selection */}
            {allVariants.length > 1 && (
              <div className="mb-6 p-5 bg-white rounded-2xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide mb-4 flex items-center gap-2">
                  <Settings size={16} className="text-[#4567a4]" />
                  Select Configuration
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {availableDisplacements.length > 1 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Displacement</label>
                      <select
                        className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium focus:outline-none focus:border-[#4567a4] bg-white px-3"
                        value={product.specs.displacement}
                        onChange={(e) => handleVariantChange("displacement", e.target.value)}
                      >
                        {availableDisplacements.map((d) => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>
                  )}
                  {availablePressures.length > 1 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-2 uppercase">Max Pressure</label>
                      <select
                        className="w-full rounded-lg border border-slate-300 py-2.5 text-sm font-medium focus:outline-none focus:border-[#4567a4] bg-white px-3"
                        value={product.specs.maxPressure}
                        onChange={(e) => handleVariantChange("pressure", e.target.value)}
                      >
                        {availablePressures.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6 flex items-center gap-3">
              <label className="text-sm font-bold text-slate-700 min-w-[70px]">Quantity:</label>
              <div className={`flex w-36 items-center justify-between rounded-lg border-2 bg-white px-3 py-2.5 ${isOutOfStock ? "border-slate-200 opacity-50" : "border-slate-300"}`}>
                <button className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={isOutOfStock}>
                  <Minus size={18} />
                </button>
                <span className="font-bold text-lg text-slate-900 min-w-[2rem] text-center">{quantity}</span>
                <button className="p-1 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                  onClick={() => setQuantity(quantity + 1)} disabled={isOutOfStock}>
                  <Plus size={18} />
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="mb-6 space-y-3">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className={`flex-1 font-black h-12 shadow-lg transition-all flex items-center justify-center gap-2 ${
                    isOutOfStock
                      ? "bg-slate-300 text-slate-500 cursor-not-allowed"
                      : "bg-[#4567a4] text-white hover:shadow-xl"
                  }`}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                >
                  <ShoppingCart size={18} strokeWidth={2.5} />
                  {isOutOfStock ? "Sold Out" : "Add to Cart"}
                </Button>

                <Button
                  size="lg"
                  className="flex-1 bg-[#4567a4] text-white hover:bg-[#3456a0] font-bold h-12 shadow-lg transition-all flex items-center justify-center gap-2"
                  onClick={() => navigate(`/request-quote?productId=${product.id}`)}
                >
                  <Mail size={18} strokeWidth={2.5} />
                  Request Quote
                </Button>
              </div>

              <div className="text-xs text-center text-slate-500 pt-1">
                Need a custom spec?{" "}
                <span
                  className="text-blue-600 cursor-pointer hover:underline"
                  onClick={() => navigate("/contact")}
                >
                  Contact our technical team
                </span>
              </div>
            </div>

            {/* Quick Spec Highlights */}
            <div className="mb-6 grid grid-cols-2 gap-3">
              {[
                { label: "Displacement", value: product.specs.displacement },
                { label: "Max Pressure", value: product.specs.maxPressure },
                { label: "Max Speed", value: product.specs.maxSpeed },
                { label: "Mounting", value: product.specs.mounting },
                ...(product.specs.shaftType ? [{ label: "Shaft Type", value: product.specs.shaftType }] : []),
                ...(product.specs.porting ? [{ label: "Porting", value: product.specs.porting }] : []),
              ].map((spec, i) => (
                <div key={i} className="bg-white border border-slate-200 rounded-xl px-4 py-3">
                  <div className="text-xs text-slate-500 mb-0.5">{spec.label}</div>
                  <div className="text-sm font-bold text-slate-900">{spec.value}</div>
                </div>
              ))}
            </div>

            {/* Tabbed Information */}
            <div className="border-t border-slate-200 pt-6">
              <div className="flex gap-1 border-b border-slate-200 mb-6 overflow-x-auto">
                {(["overview", "specs", "applications", "downloads"] as const).map((tab) => (
                  <button
                    key={tab}
                    className={`pb-3 px-4 border-b-2 font-semibold text-sm transition-colors whitespace-nowrap capitalize ${
                      activeTab === tab
                        ? "border-[#4567a4] text-[#4567a4]"
                        : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                    onClick={() => setActiveTab(tab)}
                  >
                    {tab === "overview" ? "Overview" : tab === "specs" ? "Specifications" : tab === "applications" ? "Applications" : "Downloads"}
                  </button>
                ))}
              </div>

              <div className="min-h-[200px] text-sm text-slate-600">
                {/* OVERVIEW */}
                {activeTab === "overview" && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 mb-4">Product Description</h3>
                      <div className="space-y-3">
                        {product.description.split("\n").filter((l) => l.trim()).map((line, i) => (
                          <div key={i} className="flex items-start gap-3">
                            <CheckCircle size={18} className="text-[#4567a4] mt-0.5 flex-shrink-0" />
                            <span className="text-slate-700 leading-relaxed">{line.trim()}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {product.features && product.features.length > 0 && (
                      <div>
                        <h3 className="text-base font-bold text-slate-900 mb-3">Key Features</h3>
                        <div className="grid grid-cols-2 gap-2">
                          {product.features.map((f, i) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2">
                              <Check size={14} className="text-green-600 flex-shrink-0" strokeWidth={3} />
                              <span className="text-xs font-medium text-slate-800">{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-5">
                      <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                        <Truck className="text-green-600" size={20} />
                        Shipping & Returns
                      </h3>
                      <ul className="space-y-3">
                        {[
                          { title: "Free Shipping & Returns:", body: "Available on all orders — no minimum purchase required." },
                          { title: "Fast Processing:", body: "All US domestic orders ship within 5–10 business days." },
                          { title: "Hassle-Free Returns:", body: "Not satisfied? Return within 30 days for a full refund." },
                        ].map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="text-green-600 mt-0.5 flex-shrink-0" size={18} />
                            <div className="text-sm">
                              <strong className="text-slate-900">{item.title}</strong>{" "}
                              <span className="text-slate-600">{item.body}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {/* SPECS */}
                {activeTab === "specs" && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-4">Technical Specifications</h3>
                    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                      <table className="w-full">
                        <tbody className="divide-y divide-slate-100">
                          {[
                            ["Displacement", product.specs.displacement],
                            ["Maximum Pressure", product.specs.maxPressure],
                            ["Maximum Speed", product.specs.maxSpeed],
                            ["Mounting Type", product.specs.mounting],
                            ...(product.specs.shaftType ? [["Shaft Type", product.specs.shaftType]] : []),
                            ...(product.specs.porting ? [["Porting", product.specs.porting]] : []),
                            ["Housing Material", "High-Strength Cast Iron / Aluminum Alloy"],
                            ["Fluid Compatibility", "Mineral Hydraulic Oil, Biodegradable Fluids"],
                            ["Operating Temperature", "−20°F to 200°F (−29°C to 93°C)"],
                            ["Certifications", "ISO 9001:2015"],
                            ["Lead Time", "Ships in 5–10 business days"],
                            ["Warranty", "2 Years Full Coverage"],
                          ].map(([label, value], i) => (
                            <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}>
                              <td className="py-3 px-4 font-semibold text-slate-900 w-2/5 text-sm">{label}</td>
                              <td className="py-3 px-4 text-slate-700 text-sm">{value}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* APPLICATIONS */}
                {activeTab === "applications" && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">Recommended Applications</h3>
                    <p className="text-slate-500 mb-5 text-sm">
                      The {product.name} is engineered for demanding hydraulic applications across the following industries and equipment types:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                      {applications.map((app, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3 hover:border-[#4567a4]/40 transition-colors"
                        >
                          <div className="bg-[#4567a4]/10 p-2 rounded-lg flex-shrink-0">
                            <Wrench size={16} className="text-[#4567a4]" />
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{app}</span>
                        </div>
                      ))}
                    </div>

                    <div className="bg-[#4567a4]/5 border border-[#4567a4]/20 rounded-2xl p-4">
                      <div className="flex items-start gap-3">
                        <Settings size={20} className="text-[#4567a4] mt-0.5 flex-shrink-0" />
                        <div>
                          <h4 className="font-bold text-slate-900 mb-1">Not Sure If This Fits Your Application?</h4>
                          <p className="text-sm text-slate-600 mb-3">
                            Our technical team will help you select the right pump for your exact requirements. Free consultation available.
                          </p>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-[#4567a4] text-[#4567a4] hover:bg-[#4567a4] hover:text-white"
                            onClick={() => navigate("/contact")}
                          >
                            Contact Technical Support
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* DOWNLOADS */}
                {activeTab === "downloads" && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-4">Technical Documentation</h3>
                    <div className="space-y-3">
                      {[
                        { color: "red", icon: <FileText size={24} />, title: "Technical Datasheet (PDF)", sub: "Complete specifications and dimensions", size: "2.4 MB" },
                        { color: "blue", icon: <FileText size={24} />, title: "Installation Manual (PDF)", sub: "Step-by-step installation guide", size: "1.8 MB" },
                        { color: "green", icon: <FileText size={24} />, title: "CAD Drawing (DWG)", sub: "2D technical drawing for engineering", size: "856 KB" },
                        { color: "purple", icon: <FileCheck size={24} />, title: "Warranty Certificate (PDF)", sub: "2-year warranty terms and conditions", size: "420 KB" },
                      ].map((doc, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-4 hover:border-[#4567a4]/30 hover:shadow-md cursor-pointer transition-all group"
                        >
                          <div className={`rounded-lg bg-${doc.color}-100 p-3 text-${doc.color}-600 group-hover:bg-${doc.color}-600 group-hover:text-white transition-colors`}>
                            {doc.icon}
                          </div>
                          <div className="flex-1">
                            <div className="font-bold text-slate-900 mb-0.5 text-sm">{doc.title}</div>
                            <div className="text-xs text-slate-500">{doc.sub}</div>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-500">
                            <span>{doc.size}</span>
                            <Download size={16} className="text-slate-400 group-hover:text-[#4567a4] transition-colors" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Related Configurations (same series) */}
        {allVariants.length > 1 && (
          <div className="border-t border-slate-200 pt-10">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Other Configurations in This Series</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {allVariants
                .filter((p) => p !== null && p !== undefined && p.id !== product.id)
                .map((related) => (
                  <div
                    key={related!.id}
                    className="group rounded-xl border border-slate-200 bg-white p-3 hover:border-[#4567a4]/30 hover:shadow-lg cursor-pointer transition-all flex flex-col relative overflow-hidden"
                    onClick={() => navigate(`/product/${related!.id}`)}
                  >
                    <div className="aspect-square mb-3 overflow-hidden rounded-xl bg-slate-50">
                      <img
                        src={related!.image}
                        alt={related!.name}
                        className="h-full w-full object-contain transition-transform group-hover:scale-105"
                      />
                    </div>
                    <h3 className="mb-1 text-xs font-semibold text-slate-900 line-clamp-2">{related!.name}</h3>
                    <div className="text-xs text-slate-500 mb-2">{related!.specs.displacement}</div>
                    <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-100">
                      <div className="font-bold text-sm text-slate-900">${related!.price.toFixed(2)}</div>
                      <button className="rounded-full bg-slate-100 p-1.5 text-slate-600 hover:bg-[#4567a4] hover:text-white transition-colors">
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
