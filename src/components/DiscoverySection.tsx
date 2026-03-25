import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import {
  ArrowLeft, Tractor, HardHat, Truck, Weight, Ruler,
  Building2, Zap, Settings, ChevronRight
} from "lucide-react";
import TrailerAnimation from "@/components/TrailerAnimation";

/* ─────────────────────────── Types ─────────────────────────── */
interface Product {
  model: string;
  modelId?: string;
  gvwr?: string;
  length?: string;
  axles?: string;
  features?: string[];
  url?: string;
  image?: string;
  description?: string;
}
interface TrailerType { id: string; name: string; description?: string; products: Product[]; }
interface UseCase     { id: string; name: string; description?: string; trailerTypes: TrailerType[]; }
interface Industry    { id: string; name: string; image?: string; description?: string; useCases: UseCase[]; }

/* ─────────────────────── Industry meta ─────────────────────── */
const industryMeta: Record<string, { icon: React.ReactNode; accent: string; number: string }> = {
  agriculture: { icon: <Tractor size={28} />,   accent: "from-red-500/20 to-red-900/5",   number: "01" },
  construction: { icon: <HardHat size={28} />,  accent: "from-red-500/20 to-red-900/5",   number: "02" },
  heavy_haul:  { icon: <Truck size={28} />,     accent: "from-red-500/20 to-red-900/5",   number: "03" },
  commercial:  { icon: <Building2 size={28} />, accent: "from-red-500/20 to-red-900/5",   number: "04" },
  utility:     { icon: <Zap size={28} />,       accent: "from-red-500/20 to-red-900/5",   number: "05" },
  oem:         { icon: <Settings size={28} />,  accent: "from-red-500/20 to-red-900/5",   number: "06" },
};

/* ─────────────────────── Animations ────────────────────────── */
const container: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};
const cardAnim: Variants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: "easeOut" } },
};

/* ─────────────────── Breadcrumb labels ─────────────────────── */
const STEP_LABELS = ["Industry", "Category", "Type", "Models"];

/* ═══════════════════════════════════════════════════════════════ */
const DiscoverySection = () => {
  const navigate = useNavigate();
  const [data, setData]                         = useState<Industry[]>([]);
  const [step, setStep]                         = useState(0);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [selectedUseCase, setSelectedUseCase]   = useState<UseCase | null>(null);
  const [selectedTrailerType, setSelectedTrailerType] = useState<TrailerType | null>(null);
  const [selectedProducts, setSelectedProducts] = useState<Product[]>([]);
  
  // Using useState for the ref guarantees our effect runs when the element ACTUALLY mounts 
  // after the AnimatePresence wait transition completes.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const wheelLock = useRef({ atEdge: false, timestamp: 0 });

  useEffect(() => {
    if (!scrollEl) return;

    const onWheel = (e: WheelEvent) => {
      // Don't intercept purely horizontal trackpad swipes
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) return;
      if (e.deltaY === 0) return;
      
      const isAtStart = scrollEl.scrollLeft <= 2;
      const isAtEnd = scrollEl.scrollLeft + scrollEl.clientWidth >= scrollEl.scrollWidth - 2;

      const goingUp = e.deltaY < 0;
      const goingDown = e.deltaY > 0;
      
      const now = Date.now();
      const timeSinceLast = now - wheelLock.current.timestamp;
      wheelLock.current.timestamp = now;

      // Reset the boundary lock if this is a fresh scroll gesture (gap > 40ms)
      if (timeSinceLast > 40){
        wheelLock.current.atEdge = false;
      }

      // If we are at the edge and trying to scroll past it
      if ((isAtStart && goingUp) || (isAtEnd && goingDown)) {
        if (!wheelLock.current.atEdge) {
          // Unlocked: allow page to scroll normally
          return;
        } else {
          // Locked: we hit the edge during the current swipe. Swallow momentum.
          e.preventDefault();
          return;
        }
      }

      // Otherwise, intercept and scroll horizontally
      e.preventDefault();
      scrollEl.scrollLeft += e.deltaY;

      // Check if this movement JUST caused us to hit an edge
      const hitStart = scrollEl.scrollLeft <= 2;
      const hitEnd = scrollEl.scrollLeft + scrollEl.clientWidth >= scrollEl.scrollWidth - 2;
      
      if ((hitStart && goingUp) || (hitEnd && goingDown)) {
        wheelLock.current.atEdge = true; // Lock remainder of this gesture
      }
    };

    scrollEl.addEventListener("wheel", onWheel, { passive: false });
    return () => scrollEl.removeEventListener("wheel", onWheel);
  }, [scrollEl]);

  useEffect(() => {
    fetch("/data/trailers.json").then(r => r.json()).then(d => setData(d.industries));
  }, []);

  const goBack = () => {
    if (step === 3)      { setSelectedProducts([]); setSelectedTrailerType(null); setStep(2); }
    else if (step === 2) { setSelectedUseCase(null); setStep(1); }
    else if (step === 1) { setSelectedIndustry(null); setStep(0); }
  };

  return (
    <section id="discovery" className="relative py-28 px-4 min-h-screen overflow-hidden bg-[#222]">

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/6 blur-[120px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-primary/4 blur-[100px]" />
        {/* Fine grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <TrailerAnimation step={step} />

      <div className="container mx-auto max-w-6xl relative z-10">

        {/* ── Heading ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          className="text-center mb-28 md:mb-44"
        >
          <span className="inline-block mb-4 px-3 py-1 rounded-full border border-white/10 text-[11px] font-sans font-semibold tracking-widest text-gray-400 uppercase bg-white/5">
            Trailer Finder
          </span>
          <h2 className="font-display text-5xl md:text-7xl font-bold text-white leading-tight">
            What do you need to{" "}
            <span className="relative">
              <span className="text-primary">haul?</span>
              <span className="absolute -bottom-1 left-0 right-0 h-[3px] rounded-full bg-gradient-to-r from-transparent via-primary/60 to-transparent" />
            </span>
          </h2>
          <AnimatePresence mode="wait">
            <motion.p
              key={step}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.3 }}
              className="text-gray-500 text-lg mt-6"
            >
              {step === 0 && "Select your industry to begin."}
              {step === 1 && `${selectedIndustry?.name} · Choose a category.`}
              {step === 2 && `${selectedUseCase?.name} · Pick a trailer type.`}
              {step === 3 &&
                `${selectedProducts.length} trailer${selectedProducts.length !== 1 ? "s" : ""} match your search.`}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* ── Step breadcrumb + back ── */}
        <div className="flex items-center gap-4 mb-8">
          <AnimatePresence>
            {step > 0 && (
              <motion.button
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                onClick={goBack}
                className="flex items-center gap-1.5 text-gray-500 hover:text-white transition-colors text-sm group"
              >
                <ArrowLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                Back
              </motion.button>
            )}
          </AnimatePresence>

          {/* Breadcrumb dots */}
          <div className="flex items-center gap-2 ml-auto">
            {STEP_LABELS.map((label, i) => {
              const isActive = i === step;
              const isPast = i < step;
              let displayText = label;
              let layoutIdKey: string | undefined = undefined;

              if (i === 0 && selectedIndustry) {
                displayText = selectedIndustry.name;
                layoutIdKey = `title-ind-${selectedIndustry.id}`;
              } else if (i === 1 && selectedUseCase) {
                displayText = selectedUseCase.name;
                layoutIdKey = `title-uc-${selectedUseCase.id}`;
              } else if (i === 2 && selectedTrailerType) {
                displayText = selectedTrailerType.name;
                layoutIdKey = `title-tt-${selectedTrailerType.id}`;
              }

              return (
              <div key={label} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 transition-all duration-500 ${isPast || isActive ? "opacity-100" : "opacity-25"}`}>
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500 ${
                    isActive
                      ? "bg-primary text-white"
                      : isPast
                      ? "bg-primary/20 text-primary"
                      : "bg-white/5 text-gray-500"
                  }`}>
                    {i + 1}
                  </div>
                  <motion.span 
                    layoutId={layoutIdKey}
                    className={`text-[11px] font-medium tracking-wide hidden sm:block ${isActive ? "text-white" : "text-gray-600"} whitespace-nowrap`}
                  >
                    {displayText}
                  </motion.span>
                </div>
                {i < 3 && (
                  <div className={`w-6 h-px transition-all duration-500 ${isPast ? "bg-primary/40" : "bg-white/10"}`} />
                )}
              </div>
            )})}
          </div>
        </div>

        {/* ── Card rows ── */}
        <AnimatePresence mode="wait">

          {/* ── Step 0: Industries ── */}
          {step === 0 && (
            <motion.div
              key="industries"
              variants={container}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
            >
              <div ref={setScrollEl } className="flex overflow-x-auto overflow-y-hidden gap-5 pb-4 scrollbar-hide">
              {data.map((ind) => {
                const meta = industryMeta[ind.id] || { icon: <Truck size={28} />, accent: "from-white/5 to-transparent", number: "00" };
                return (
                  <motion.button
                    key={ind.id}
                    variants={cardAnim}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setSelectedIndustry(ind); setStep(1); }}
                    className="group relative flex-shrink-0 w-[260px] md:w-[300px] text-left overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm flex flex-col min-h-[230px] p-6 cursor-pointer transition-all duration-500 hover:border-primary/40 hover:bg-white/6"
                    style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
                  >
                    {/* gradient bleed */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${meta.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`} />
                    {/* top accent line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <div className="relative z-10 flex flex-col flex-1">
                      {/* Number above image */}
                      <span className="block font-display font-black text-[40px] leading-none text-white/7 mb-1 self-end mr-2 mt-1">
                        {meta.number}
                      </span>
                      {ind.image ? (
                        <div className="relative w-full h-32 mb-4">
                          <div className="absolute inset-0 rounded-lg bg-white/90" />
                          <img
                            src={ind.image}
                            alt={ind.name}
                            className="w-full h-full object-cover rounded-lg border border-white/10 relative"
                            style={{
                              imageRendering: "auto",
                              boxShadow: "0 2px 12px 0 rgba(0,0,0,0.10)",
                              WebkitBackfaceVisibility: "hidden",
                              backfaceVisibility: "hidden"
                            }}
                            draggable={false}
                          />
                          {/* Optional: subtle overlay for extra smoothness */}
                          <div className="absolute inset-0 rounded-lg pointer-events-none" style={{background: "linear-gradient(180deg,rgba(34,34,34,0.04) 0%,rgba(34,34,34,0.10) 100%)"}} />
                        </div>
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-white/6 border border-white/10 flex items-center justify-center text-primary mb-auto group-hover:bg-primary/10 group-hover:border-primary/30 transition-all duration-400">
                          {meta.icon}
                        </div>
                      )}
                      <div className="mt-6">
                        <motion.h3 layoutId={`title-ind-${ind.id}`} className="font-display text-xl font-bold text-white mb-1.5">{ind.name}</motion.h3>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-[11px] text-gray-600">{ind.useCases.length} categories</span>
                        <ChevronRight size={14} className="text-gray-600 group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
                      </div>
                    </div>
                  </motion.button>
                );
              })}
              </div>
            </motion.div>
          )}

          {/* ── Step 1: Categories ── */}
          {step === 1 && selectedIndustry && (
            <motion.div
              key="usecases"
              variants={container}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
            >
              <div ref={setScrollEl } className="flex overflow-x-auto overflow-y-hidden gap-5 pb-4 scrollbar-hide">
              {selectedIndustry.useCases.map((uc) => (
                <motion.button
                  key={uc.id}
                  variants={cardAnim}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedUseCase(uc); setStep(2); }}
                  className="group relative flex-shrink-0 w-[260px] md:w-[300px] text-left overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm flex flex-col min-h-[230px] p-6 cursor-pointer transition-all duration-500 hover:border-primary/40 hover:bg-white/6"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
                >
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col flex-1">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center mb-auto">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="mt-6">
                      <motion.h3 layoutId={`title-uc-${uc.id}`} className="font-display text-lg font-bold text-white mb-2 leading-snug">{uc.name}</motion.h3>
                      {uc.description && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 group-hover:text-gray-400 transition-colors">
                          {uc.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-[11px] text-gray-600">{uc.trailerTypes.length} type{uc.trailerTypes.length !== 1 ? "s" : ""}</span>
                      <span className="text-primary text-xs font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        Explore <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 2: Trailer Types ── */}
          {step === 2 && selectedUseCase && (
            <motion.div
              key="trailertypes"
              variants={container}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, x: -30, transition: { duration: 0.3 } }}
            >
              <div ref={setScrollEl } className="flex overflow-x-auto overflow-y-hidden gap-5 pb-4 scrollbar-hide">
              {selectedUseCase.trailerTypes.map((tt) => (
                <motion.button
                  key={tt.id}
                  variants={cardAnim}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedProducts(tt.products); setSelectedTrailerType(tt); setStep(3); }}
                  className="group relative flex-shrink-0 w-[260px] md:w-[300px] text-left overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm flex flex-col min-h-[230px] p-6 cursor-pointer transition-all duration-500 hover:border-primary/40 hover:bg-white/6"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
                >
                  <div className="absolute bottom-0 right-0 w-24 h-24 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none overflow-hidden rounded-2xl">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-primary/8 rotate-45 translate-x-8 translate-y-8" />
                  </div>
                  <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative z-10 flex flex-col flex-1">
                    <div className="px-2 py-0.5 rounded bg-white/6 border border-white/10 text-[10px] font-semibold text-gray-400 tracking-widest uppercase self-start mb-auto">
                      {tt.products.length} MODEL{tt.products.length !== 1 ? "S" : ""}
                    </div>
                    <div className="mt-6">
                      <motion.h3 layoutId={`title-tt-${tt.id}`} className="font-display text-lg font-bold text-white mb-2 leading-snug">{tt.name}</motion.h3>
                      {tt.description && (
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 group-hover:text-gray-400 transition-colors">
                          {tt.description}
                        </p>
                      )}
                    </div>
                    <div className="mt-4 flex items-center justify-end">
                      <span className="text-primary text-xs font-semibold flex items-center gap-1 group-hover:gap-1.5 transition-all">
                        View Trailers <ChevronRight size={12} />
                      </span>
                    </div>
                  </div>
                </motion.button>
              ))}
              </div>
            </motion.div>
          )}

          {/* ── Step 3: Products ── */}
          {step === 3 && selectedProducts.length > 0 && (
            <motion.div
              key="results"
              variants={container}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              <div ref={setScrollEl } className="flex overflow-x-auto overflow-y-hidden gap-5 pb-4 scrollbar-hide">
              {selectedProducts.map((product) => (
                <motion.div
                  key={product.model}
                  variants={cardAnim}
                  className="group relative flex-shrink-0 w-[420px] md:w-[520px] overflow-hidden rounded-2xl border border-white/8 bg-white/4 backdrop-blur-sm flex flex-row min-h-[260px] p-5 transition-all duration-500 hover:border-primary/35 hover:bg-white/6"
                  style={{ boxShadow: "0 4px 24px rgba(0,0,0,0.4)" }}
                >
                  {/* Image section - now 50% */}
                  <div className="flex flex-col items-center justify-center w-1/2 pr-4">
                    <div className="w-full aspect-[3/2] max-h-56 bg-white rounded-lg flex items-center justify-center overflow-hidden border border-white/10 mb-2 transition-all duration-300">
                      <img
                        src={product.image || "/data/images/placeholder-product.png"}
                        alt={product.model}
                        className="object-cover w-full h-full"
                        style={{ display: 'block' }}
                        draggable={false}
                      />
                    </div>
                    {product.gvwr && (
                      <span className="mt-1 px-2 py-0.5 rounded bg-primary/15 border border-primary/25 text-primary text-[10px] font-bold tracking-wider">
                        {product.gvwr}
                      </span>
                    )}
                  </div>
                  {/* Details section - now 50% */}
                  <div className="flex flex-col w-1/2 min-w-0">
                    <div className="flex flex-col">
                      <h3 className="font-display text-base font-bold text-white leading-snug mb-1">
                        {product.model}
                      </h3>
                      <p className="text-sm text-gray-300 font-semibold tracking-wide mb-4">
                        Model #{product.modelId || 'TBD'}
                      </p>
                    </div>
                    {/* Spec pills */}
                    {(product.length || product.axles) && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {product.length && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-white/4 rounded-lg px-2.5 py-1.5 border border-white/6">
                            <Ruler size={10} className="text-primary" />
                            {product.length}
                          </div>
                        )}
                        {product.axles && (
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-500 bg-white/4 rounded-lg px-2.5 py-1.5 border border-white/6">
                            <Weight size={10} className="text-primary" />
                            {product.axles}
                          </div>
                        )}
                      </div>
                    )}
                    {/* Features */}
                    {product.features && product.features.length > 0 && (
                      <ul className="space-y-1.5 flex-1">
                        {product.features.slice(0, 4).map((f) => (
                          <li key={f} className="flex items-start gap-2 text-[11px] text-gray-500">
                            <span className="w-1 h-1 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                    {/* CTA */}
                    <motion.button
                      onClick={() => navigate("/trailers/directional-drill-tilt-trailer")}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      className="mt-4 w-full py-2.5 flex items-center justify-center gap-1.5 rounded-xl bg-primary/10 border border-primary/25 text-primary text-xs font-semibold hover:bg-primary hover:text-white hover:border-primary transition-all duration-300"
                    >
                      View Product <ChevronRight size={11} />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Scroll hint ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-4 text-center text-[11px] text-gray-600"
        >
          ← swipe to explore more →
        </motion.p>
      </div>
    </section>
  );
};

export default DiscoverySection;
