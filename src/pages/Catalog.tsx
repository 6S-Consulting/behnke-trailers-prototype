import { useState, useMemo, useEffect } from "react";

import bestSellerImg from "@/assets/images/pumps/best-seller-removebg-preview.png";
import { products, type Product } from "@/data/products";
import { useRouter } from "@/lib/router";
import {
  ChevronDown,
  ChevronUp,
  LayoutGrid,
  Menu,
  Check,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useSearch } from "@/context/SearchContext";
import { BulkOrderUpload } from "@/components/BulkOrderUpload";

function uniqueNonEmpty(values: Array<string | undefined | null>) {
  return Array.from(
    new Set(values.filter((v): v is string => !!v && v.trim().length > 0)),
  );
}

const PRODUCTS_PER_PAGE = 12;

// Pure shuffle – defined outside component to avoid useMemo purity lint
function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Series label map – static, defined at module level so useMemo deps stay stable
const seriesLabelMap: Record<string, string> = {
  "pvp-series": "PVP Series",
  "pd-series": "PD Series",
  "oildyne": "Oildyne Miniature",
  "pgp505": "PGP505 Series",
  "pgp511": "PGP511 Series",
  "f1-series": "F1 Series",
  "f2-series": "F2 Series",
  "f3-series": "F3 Series",
  "gold-cup": "Gold Cup Series",
  "pgp315": "PGP315 Series",
  "pgp330": "PGP330 Series",
  "pgp350": "PGP350 Series",
  "pgp365": "PGP365 Series",
};

// ─── FilterAccordion ─────────────────────────────────────────────────────────

interface FilterAccordionProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  onReset: () => void;
  count: number;
  children: React.ReactNode;
}

function FilterAccordion({
  title,
  isOpen,
  onToggle,
  onReset,
  count,
  children,
}: FilterAccordionProps) {
  return (
    <div className="border-b border-gray-100 last:border-b-0">
      <button
        className="flex w-full items-center justify-between py-3 text-sm font-semibold text-gray-800 hover:text-black transition-colors"
        onClick={onToggle}
      >
        <span className="flex items-center gap-2">
          {title}
          {count > 0 && (
            <span className="rounded-full bg-black text-white text-xs w-5 h-5 flex items-center justify-center">
              {count}
            </span>
          )}
        </span>
        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {isOpen && (
        <div className="pb-4 space-y-1">
          {count > 0 && (
            <button
              onClick={onReset}
              className="text-xs text-blue-600 hover:underline mb-2 block"
            >
              Clear
            </button>
          )}
          {children}
        </div>
      )}
    </div>
  );
}

// ─── ProductCard ─────────────────────────────────────────────────────────────

function ProductCard({
  product,
}: {
  product: Product;
}) {
  const { addToCart } = useCart();
  const { navigate } = useRouter();

  return (
    <div
      className="group bg-white border border-gray-200 rounded-xl overflow-visible hover:shadow-lg hover:border-[#4567a4]/30 transition-all cursor-pointer flex flex-col relative"
      onClick={() => navigate(`/product/${product.id}`)}
    >
      {/* Best Seller ribbon — peeks from behind top-left of card */}
      {product.isBestSeller && (
        <div className="absolute top-5 -left-6 z-20 pointer-events-none" style={{ width: 100, height: 52 }}>
        <img
          src={bestSellerImg}
          alt="Best Seller"
            style={{ width: 100, position: "absolute", bottom: 0, right: 0 }}
        />
        </div>
      )}
      <div className="relative overflow-hidden bg-white rounded-t-xl p-4">
        <img
          src={product.image}
          alt={product.name}
          className="w-full object-contain aspect-square group-hover:scale-105 transition-transform duration-300"
        />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-[#4567a4] font-semibold uppercase tracking-wide mb-1">
          {product.category}
        </div>
        <div className="h-10 mb-2">
          <h3 className="font-bold text-slate-900 text-sm leading-tight line-clamp-2">
            {product.name}
          </h3>
        </div>
        <div className="text-xs text-slate-500 space-y-0.5 mb-3">
          <div>{product.specs.displacement} • {product.specs.maxPressure}</div>
          <div>{product.specs.mounting}</div>
        </div>
        <div className="flex items-center justify-between mt-auto">
          <div className="font-bold text-lg text-slate-900">
            ${product.price.toFixed(2)}
          </div>
          {product.stockStatus === "Out of Stock" ? (
            <button
              onClick={(e) => e.stopPropagation()}
              disabled
              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg font-bold cursor-not-allowed opacity-90"
            >
              Sold Out
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                addToCart(product);
              }}
              className="text-xs bg-[#4567a4] text-white px-3 py-1.5 rounded-lg font-semibold hover:bg-[#3456a0] transition-colors"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main Catalog ─────────────────────────────────────────────────────────────

export function Catalog() {
  const { navigate, searchParams } = useRouter();
  const { searchResults, searchQuery } = useSearch();

  // ── Filter State ───────────────────────────────────────────────────────────
  const [selectedCategory, setSelectedCategory] = useState<string[]>([]);
  const [selectedSeries, setSelectedSeries] = useState<string[]>([]);
  const [selectedDisplacement, setSelectedDisplacement] = useState<string[]>([]);
  const [selectedMaxPressure, setSelectedMaxPressure] = useState<string[]>([]);
  const [selectedMaxSpeed, setSelectedMaxSpeed] = useState<string[]>([]);
  const [selectedMounting, setSelectedMounting] = useState<string[]>([]);
  const [selectedShaftType, setSelectedShaftType] = useState<string[]>([]);
  const [selectedPorting, setSelectedPorting] = useState<string[]>([]);
  const [selectedStock, setSelectedStock] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortOrder, setSortOrder] = useState("Featured");
  const [gridView, setGridView] = useState(4);
  const [currentPage, setCurrentPage] = useState(1);
  const [openFilters, setOpenFilters] = useState<string[]>(["availability"]);

  const toggleAccordion = (id: string) => {
    setOpenFilters((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  };

  const toggleFilter = (
    setFn: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
    value: string,
  ) => {
    setFn(current.includes(value) ? current.filter((i) => i !== value) : [...current, value]);
  };

  // ── URL param sync ─────────────────────────────────────────────────────────
  useEffect(() => {
    const categoryParam = searchParams.get("category");
    const stockParam = searchParams.get("stock");
    const seriesParam = searchParams.get("series");
    const pressureParam = searchParams.get("pressure");
    const displacementParam = searchParams.get("displacement");
    const speedParam = searchParams.get("speed");
    const mountingParam = searchParams.get("mounting");

    setTimeout(() => {
      if (categoryParam) {
        setSelectedCategory((prev) =>
          prev.includes(categoryParam) ? prev : [...prev, categoryParam],
        );
        setOpenFilters((prev) =>
          prev.includes("categories") ? prev : [...prev, "categories"],
        );
      }
      if (seriesParam) {
        setSelectedSeries((prev) =>
          prev.includes(seriesParam) ? prev : [...prev, seriesParam],
        );
        setOpenFilters((prev) =>
          prev.includes("series") ? prev : [...prev, "series"],
        );
      }
      if (stockParam) setSelectedStock([stockParam]);
      if (pressureParam) {
        setSelectedMaxPressure((prev) => prev.includes(pressureParam) ? prev : [...prev, pressureParam]);
        setOpenFilters((prev) => prev.includes("maxPressure") ? prev : [...prev, "maxPressure"]);
      }
      if (displacementParam) {
        setSelectedDisplacement((prev) => prev.includes(displacementParam) ? prev : [...prev, displacementParam]);
        setOpenFilters((prev) => prev.includes("displacement") ? prev : [...prev, "displacement"]);
      }
      if (speedParam) {
        setSelectedMaxSpeed((prev) => prev.includes(speedParam) ? prev : [...prev, speedParam]);
        setOpenFilters((prev) => prev.includes("maxSpeed") ? prev : [...prev, "maxSpeed"]);
      }
      if (mountingParam) {
        setSelectedMounting((prev) => prev.includes(mountingParam) ? prev : [...prev, mountingParam]);
        setOpenFilters((prev) => prev.includes("mounting") ? prev : [...prev, "mounting"]);
      }
    }, 0);

    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [searchParams]);

  // ── Facet Options ──────────────────────────────────────────────────────────
  const categoryOptions = [
    "Industrial Piston Pumps",
    "Industrial Gear Pumps",
    "Mobile Piston Pumps",
    "Mobile Gear Pumps",
  ];

  // Series options derived from products groupId (per Categories.md)
  const seriesOptions = uniqueNonEmpty(
    products.map((p) => p.groupId),
  ).sort().map((groupId) => ({
    groupId,
    label: seriesLabelMap[groupId] ?? groupId,
  }));

  const displacementOptions = uniqueNonEmpty(
    products.map((p) => p.specs.displacement),
  ).sort();
  const maxPressureOptions = uniqueNonEmpty(
    products.map((p) => p.specs.maxPressure),
  ).sort();
  const maxSpeedOptions = uniqueNonEmpty(
    products.map((p) => p.specs.maxSpeed),
  ).sort();
  const mountingOptions = uniqueNonEmpty(
    products.map((p) => p.specs.mounting),
  ).sort();
  const shaftTypeOptions = uniqueNonEmpty(
    products.map((p) => p.specs.shaftType),
  ).sort();
  const portingOptions = uniqueNonEmpty(
    products.map((p) => p.specs.porting),
  ).sort();

  const stockOptions = [
    {
      label: "In stock",
      value: "In Stock",
      count: products.filter((p) => p.stockStatus === "In Stock").length,
    },
    {
      label: "Out of stock",
      value: "Out of Stock",
      count: products.filter((p) => p.stockStatus === "Out of Stock").length,
    },
  ];

  const countBy = (predicate: (p: Product) => boolean) =>
    products.filter(predicate).length;

  // ── Filtering ──────────────────────────────────────────────────────────────
  const filteredResult = useMemo(() => {
    let result = searchResults as Product[];

    if (selectedCategory.length > 0) {
      result = result.filter((p) => selectedCategory.includes(p.category));
    }
    if (selectedSeries.length > 0) {
      result = result.filter((p) => p.groupId && selectedSeries.includes(p.groupId));
    }
    if (selectedDisplacement.length > 0) {
      result = result.filter((p) =>
        selectedDisplacement.includes(p.specs.displacement),
      );
    }
    if (selectedMaxPressure.length > 0) {
      result = result.filter((p) =>
        selectedMaxPressure.includes(p.specs.maxPressure),
      );
    }
    if (selectedMaxSpeed.length > 0) {
      result = result.filter((p) =>
        selectedMaxSpeed.includes(p.specs.maxSpeed),
      );
    }
    if (selectedMounting.length > 0) {
      result = result.filter((p) =>
        selectedMounting.includes(p.specs.mounting),
      );
    }
    if (selectedShaftType.length > 0) {
      result = result.filter(
        (p) => p.specs.shaftType && selectedShaftType.includes(p.specs.shaftType),
      );
    }
    if (selectedPorting.length > 0) {
      result = result.filter(
        (p) => p.specs.porting && selectedPorting.includes(p.specs.porting),
      );
    }
    if (selectedStock.length > 0) {
      result = result.filter((p) => selectedStock.includes(p.stockStatus));
    }
    const minPrice = priceMin ? parseFloat(priceMin) : 0;
    const maxPriceValue = priceMax ? parseFloat(priceMax) : Infinity;
    if (priceMin || priceMax) {
      result = result.filter(
        (p) => p.price >= minPrice && p.price <= maxPriceValue,
      );
    }

    if (sortOrder === "Price: Low to High") {
      result = [...result].sort((a, b) => a.price - b.price);
    } else if (sortOrder === "Price: High to Low") {
      result = [...result].sort((a, b) => b.price - a.price);
    } else if (sortOrder === "Alphabetically, A-Z") {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortOrder === "Alphabetically, Z-A") {
      result = [...result].sort((a, b) => b.name.localeCompare(a.name));
    } else if (sortOrder === "Best Sellers") {
      result = [...result].sort((a, b) =>
        a.isBestSeller === b.isBestSeller ? 0 : a.isBestSeller ? -1 : 1,
      );
    } else if (sortOrder === "Random") {
      // Shuffle products grouped by series for visual variety
      const groups: Record<string, Product[]> = {};
      result.forEach((p) => {
        const gid = p.groupId || "none";
        if (!groups[gid]) groups[gid] = [];
        groups[gid].push(p);
      });

      const shuffledGroupIds = shuffle(Object.keys(groups));
      Object.keys(groups).forEach((gid) => {
        groups[gid] = shuffle(groups[gid]);
      });

      const interleaved: Product[] = [];
      const total = result.length;
      const pointers: Record<string, number> = {};
      shuffledGroupIds.forEach((gid) => (pointers[gid] = 0));

      while (interleaved.length < total) {
        const currentPassOrder = shuffle(shuffledGroupIds);
        currentPassOrder.forEach((gid) => {
          if (pointers[gid] < groups[gid].length) {
            interleaved.push(groups[gid][pointers[gid]]);
            pointers[gid]++;
          }
        });
      }
      result = interleaved;
    }

    // Active filters chips
    const activeFilters: { label: string; onRemove: () => void }[] = [
      ...selectedCategory.map((c) => ({
        label: c,
        onRemove: () => toggleFilter(setSelectedCategory, selectedCategory, c),
      })),
      ...selectedSeries.map((v) => ({
        label: `Series: ${seriesLabelMap[v] ?? v}`,
        onRemove: () => toggleFilter(setSelectedSeries, selectedSeries, v),
      })),
      ...selectedDisplacement.map((v) => ({
        label: `Displacement: ${v}`,
        onRemove: () =>
          toggleFilter(setSelectedDisplacement, selectedDisplacement, v),
      })),
      ...selectedMaxPressure.map((v) => ({
        label: `Max Pressure: ${v}`,
        onRemove: () =>
          toggleFilter(setSelectedMaxPressure, selectedMaxPressure, v),
      })),
      ...selectedMaxSpeed.map((v) => ({
        label: `Max Speed: ${v}`,
        onRemove: () =>
          toggleFilter(setSelectedMaxSpeed, selectedMaxSpeed, v),
      })),
      ...selectedMounting.map((v) => ({
        label: `Mounting: ${v}`,
        onRemove: () => toggleFilter(setSelectedMounting, selectedMounting, v),
      })),
      ...selectedShaftType.map((v) => ({
        label: `Shaft: ${v}`,
        onRemove: () =>
          toggleFilter(setSelectedShaftType, selectedShaftType, v),
      })),
      ...selectedPorting.map((v) => ({
        label: `Porting: ${v}`,
        onRemove: () => toggleFilter(setSelectedPorting, selectedPorting, v),
      })),
      ...selectedStock.map((v) => ({
        label: v,
        onRemove: () => toggleFilter(setSelectedStock, selectedStock, v),
      })),
    ];
    if (priceMin) {
      activeFilters.push({
        label: `Min: $${priceMin}`,
        onRemove: () => setPriceMin(""),
      });
    }
    if (priceMax) {
      activeFilters.push({
        label: `Max: $${priceMax}`,
        onRemove: () => setPriceMax(""),
      });
    }

    return { result, activeFilters };
  }, [
    searchResults,
    selectedCategory,
    selectedSeries,
    selectedDisplacement,
    selectedMaxPressure,
    selectedMaxSpeed,
    selectedMounting,
    selectedShaftType,
    selectedPorting,
    selectedStock,
    priceMin,
    priceMax,
    sortOrder,
  ]);

  const filteredProducts = filteredResult.result;
  const activeFilters = filteredResult.activeFilters;

  const totalPages = Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + PRODUCTS_PER_PAGE,
  );

  // Reset page to 1 when filters change
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setCurrentPage(1); }, [filteredProducts.length]);

  const handleClearAll = () => {
    setSelectedCategory([]);
    setSelectedSeries([]);
    setSelectedDisplacement([]);
    setSelectedMaxPressure([]);
    setSelectedMaxSpeed([]);
    setSelectedMounting([]);
    setSelectedShaftType([]);
    setSelectedPorting([]);
    setSelectedStock([]);
    setPriceMin("");
    setPriceMax("");
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumbs */}
      <div className="border-b border-gray-100">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
            <span
              className="hover:text-black cursor-pointer transition-colors"
              onClick={() => navigate("/")}
            >
              Home
            </span>
            <span>/</span>
            <span className="text-black font-bold">Hydraulic Pumps</span>
            {searchQuery && (
              <>
                <span>/</span>
                <span className="text-black font-bold">
                  Search: "{searchQuery}"
                </span>
              </>
            )}
          </div>
          <div className="hidden md:block">
            <BulkOrderUpload variant="compact" />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ── Filters Sidebar ── */}
          <aside className="w-full lg:w-64 shrink-0 border-t lg:border-t-0">
            <div className="py-4 lg:pt-0">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-500 hidden lg:block">
                  Filter:
                </h2>
                {activeFilters.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {/* Categories */}
              <FilterAccordion
                title="Category"
                isOpen={openFilters.includes("categories")}
                onToggle={() => toggleAccordion("categories")}
                onReset={() => setSelectedCategory([])}
                count={selectedCategory.length}
              >
                <div className="space-y-2">
                  {categoryOptions.map((cat) => (
                    <label
                      key={cat}
                      className="flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                            checked={selectedCategory.includes(cat)}
                            onChange={() =>
                              toggleFilter(setSelectedCategory, selectedCategory, cat)
                            }
                          />
                          <Check
                            size={12}
                            className="absolute text-white scale-0 peer-checked:scale-100 transition-transform"
                          />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-black">
                          {cat}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {countBy((p) => p.category === cat)}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              {/* Series */}
              <FilterAccordion
                title="Series"
                isOpen={openFilters.includes("series")}
                onToggle={() => toggleAccordion("series")}
                onReset={() => setSelectedSeries([])}
                count={selectedSeries.length}
              >
                <div className="space-y-2">
                  {seriesOptions.map((opt) => (
                    <label
                      key={opt.groupId}
                      className="flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                            checked={selectedSeries.includes(opt.groupId)}
                            onChange={() =>
                              toggleFilter(setSelectedSeries, selectedSeries, opt.groupId)
                            }
                          />
                          <Check
                            size={12}
                            className="absolute text-white scale-0 peer-checked:scale-100 transition-transform"
                          />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-black">
                          {opt.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {products.filter((p) => p.groupId === opt.groupId).length}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              {/* Availability */}
              <FilterAccordion
                title="Availability"
                isOpen={openFilters.includes("availability")}
                onToggle={() => toggleAccordion("availability")}
                onReset={() => setSelectedStock([])}
                count={selectedStock.length}
              >
                <div className="space-y-2">
                  {stockOptions.map((opt) => (
                    <label
                      key={opt.value}
                      className="flex items-center justify-between gap-3 cursor-pointer group"
                    >
                      <div className="flex items-center gap-2">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                            checked={selectedStock.includes(opt.value)}
                            onChange={() =>
                              toggleFilter(setSelectedStock, selectedStock, opt.value)
                            }
                          />
                          <Check
                            size={12}
                            className="absolute text-white scale-0 peer-checked:scale-100 transition-transform"
                          />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-black">
                          {opt.label}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{opt.count}</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              {/* Displacement */}
              <FilterAccordion
                title="Displacement"
                isOpen={openFilters.includes("displacement")}
                onToggle={() => toggleAccordion("displacement")}
                onReset={() => setSelectedDisplacement([])}
                count={selectedDisplacement.length}
              >
                <div className="space-y-2">
                  {displacementOptions.map((size) => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                          checked={selectedDisplacement.includes(size)}
                          onChange={() =>
                            toggleFilter(setSelectedDisplacement, selectedDisplacement, size)
                          }
                        />
                        <Check size={12} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-black">{size}</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              {/* Max Pressure */}
              <FilterAccordion
                title="Max Pressure"
                isOpen={openFilters.includes("maxPressure")}
                onToggle={() => toggleAccordion("maxPressure")}
                onReset={() => setSelectedMaxPressure([])}
                count={selectedMaxPressure.length}
              >
                <div className="space-y-2">
                  {maxPressureOptions.map((size) => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                          checked={selectedMaxPressure.includes(size)}
                          onChange={() =>
                            toggleFilter(setSelectedMaxPressure, selectedMaxPressure, size)
                          }
                        />
                        <Check size={12} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-black">{size}</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              {/* Max Speed */}
              <FilterAccordion
                title="Max Speed"
                isOpen={openFilters.includes("maxSpeed")}
                onToggle={() => toggleAccordion("maxSpeed")}
                onReset={() => setSelectedMaxSpeed([])}
                count={selectedMaxSpeed.length}
              >
                <div className="space-y-2">
                  {maxSpeedOptions.map((size) => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                          checked={selectedMaxSpeed.includes(size)}
                          onChange={() =>
                            toggleFilter(setSelectedMaxSpeed, selectedMaxSpeed, size)
                          }
                        />
                        <Check size={12} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-black">{size}</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              {/* Mounting */}
              <FilterAccordion
                title="Mounting"
                isOpen={openFilters.includes("mounting")}
                onToggle={() => toggleAccordion("mounting")}
                onReset={() => setSelectedMounting([])}
                count={selectedMounting.length}
              >
                <div className="space-y-2">
                  {mountingOptions.map((size) => (
                    <label key={size} className="flex items-center gap-2 cursor-pointer group">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                          checked={selectedMounting.includes(size)}
                          onChange={() =>
                            toggleFilter(setSelectedMounting, selectedMounting, size)
                          }
                        />
                        <Check size={12} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform" />
                      </div>
                      <span className="text-sm text-gray-700 group-hover:text-black">{size}</span>
                    </label>
                  ))}
                </div>
              </FilterAccordion>

              {/* Shaft Type */}
              {shaftTypeOptions.length > 0 && (
                <FilterAccordion
                  title="Shaft Type"
                  isOpen={openFilters.includes("shaftType")}
                  onToggle={() => toggleAccordion("shaftType")}
                  onReset={() => setSelectedShaftType([])}
                  count={selectedShaftType.length}
                >
                  <div className="space-y-2">
                    {shaftTypeOptions.map((size) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                            checked={selectedShaftType.includes(size)}
                            onChange={() =>
                              toggleFilter(setSelectedShaftType, selectedShaftType, size)
                            }
                          />
                          <Check size={12} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-black">{size}</span>
                      </label>
                    ))}
                  </div>
                </FilterAccordion>
              )}

              {/* Porting */}
              {portingOptions.length > 0 && (
                <FilterAccordion
                  title="Porting"
                  isOpen={openFilters.includes("porting")}
                  onToggle={() => toggleAccordion("porting")}
                  onReset={() => setSelectedPorting([])}
                  count={selectedPorting.length}
                >
                  <div className="space-y-2">
                    {portingOptions.map((size) => (
                      <label key={size} className="flex items-center gap-2 cursor-pointer group">
                        <div className="relative flex items-center justify-center">
                          <input
                            type="checkbox"
                            className="peer appearance-none w-4 h-4 border border-gray-300 rounded checked:bg-black checked:border-black transition-all"
                            checked={selectedPorting.includes(size)}
                            onChange={() =>
                              toggleFilter(setSelectedPorting, selectedPorting, size)
                            }
                          />
                          <Check size={12} className="absolute text-white scale-0 peer-checked:scale-100 transition-transform" />
                        </div>
                        <span className="text-sm text-gray-700 group-hover:text-black">{size}</span>
                      </label>
                    ))}
                  </div>
                </FilterAccordion>
              )}

              {/* Price Range */}
              <FilterAccordion
                title="Price Range"
                isOpen={openFilters.includes("price")}
                onToggle={() => toggleAccordion("price")}
                onReset={() => { setPriceMin(""); setPriceMax(""); }}
                count={(priceMin ? 1 : 0) + (priceMax ? 1 : 0)}
              >
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Min ($)</label>
                      <input
                        type="number"
                        value={priceMin}
                        onChange={(e) => setPriceMin(e.target.value)}
                        placeholder="0"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4567a4]"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">Max ($)</label>
                      <input
                        type="number"
                        value={priceMax}
                        onChange={(e) => setPriceMax(e.target.value)}
                        placeholder="Any"
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#4567a4]"
                      />
                    </div>
                  </div>
                </div>
              </FilterAccordion>
            </div>
          </aside>

          {/* ── Product Grid ── */}
          <div className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-100">
              <div className="text-sm text-gray-500">
                <span className="font-semibold text-black">{filteredProducts.length}</span>{" "}
                {filteredProducts.length === 1 ? "product" : "products"}
              </div>
              <div className="flex items-center gap-3">
                {/* Grid size */}
                <div className="hidden lg:flex items-center gap-1 border border-gray-200 rounded-lg p-1">
                  {[3, 4].map((n) => (
                    <button
                      key={n}
                      onClick={() => setGridView(n)}
                      className={`p-1.5 rounded ${gridView === n ? "bg-black text-white" : "text-gray-400 hover:text-black"}`}
                    >
                      {n === 3 ? <Menu size={14} className="rotate-90" /> : <LayoutGrid size={14} />}
                    </button>
                  ))}
                </div>
                {/* Sort */}
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:border-[#4567a4] bg-white"
                >
                  <option>Featured</option>
                  <option>Best Sellers</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Random</option>
                  <option>Alphabetically, A-Z</option>
                  <option>Alphabetically, Z-A</option>
                </select>
              </div>
            </div>

            {/* Active Filter Chips */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {activeFilters.map((f, i) => (
                  <span
                    key={i}
                    className="flex items-center gap-1 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full"
                  >
                    {f.label}
                    <button onClick={f.onRemove} className="text-slate-400 hover:text-black ml-1">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                <button
                  onClick={handleClearAll}
                  className="text-xs text-red-500 font-medium hover:underline px-2"
                >
                  Clear All
                </button>
              </div>
            )}

            {/* Products */}
            {paginatedProducts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No products found</h3>
                <p className="text-slate-500 mb-6">Try adjusting your filters</p>
                <button
                  onClick={handleClearAll}
                  className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-slate-800 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-4 ${
                  gridView === 3
                    ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
                    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
                }`}
              >
                {paginatedProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-lg text-sm font-semibold transition-colors ${
                      currentPage === page
                        ? "bg-black text-white"
                        : "border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
