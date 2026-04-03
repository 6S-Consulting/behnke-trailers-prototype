import { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { trailers } from "@/trailers/data/trailerData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowUpRight, Search } from "lucide-react";
import agricultural4050 from "@/trailers/images/agricultural/40-50.png";
import commercialOver from "@/trailers/images/commercial/over.png";
import constructionDeckover from "@/trailers/images/construction/deckover.png";
import heavyTag from "@/trailers/images/heavy/tag.png";
import utilityDirectional from "@/trailers/images/utility/directional.png";
import utilityPole from "@/trailers/images/utility/pool.png";
import utilityRamp from "@/trailers/images/utility/ramp.png";
import utilityReel from "@/trailers/images/utility/reel.png";

export function TrailersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("Agricultural");
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const trailerImageOverrides: Record<string, string> = {
    "sprayer-trailer-40k-50k": agricultural4050,
    "otr-step-deck-semi": commercialOver,
    "deckover-gooseneck": constructionDeckover,
    "tag-trailer-60-ton": heavyTag,
    "pole-trailer": utilityPole,
    "directional-drill-ramp-trailer": utilityRamp,
    "directional-drill-tilt-trailer": utilityDirectional,
    "reel-trailer": utilityReel,
  };

  // Group trailers by category for better organization
  const categories = useMemo(
    () => [
      {
        id: "Agricultural",
        name: "Agricultural",
        description: "Wagons, sprayers, tenders, and liquid transport",
        trailers: trailers.filter((t) =>
          ["walking-tandem-gooseneck-wagon", "single-cone-trailer"].includes(
            t.slug,
          ),
        ),
      },
      {
        id: "Construction",
        name: "Construction",
        description: "Deckovers, tilts, and utility trailers",
        trailers: trailers.filter((t) =>
          ["20k-hd-tube-tilt", "deckover-gooseneck"].includes(t.slug),
        ),
      },
      {
        id: "Heavy-Haul",
        name: "Heavy Haul",
        description: "Tag trailers and specialized high-capacity equipment",
        trailers: trailers.filter((t) =>
          ["paver-tag-trailer", "tag-trailer-60-ton"].includes(t.slug),
        ),
      },
      {
        id: "Utility-Telecom",
        name: "Utility & Telecom",
        description: "Directional drill, pole, and reel trailers",
        trailers: trailers.filter((t) =>
          [
            "directional-drill-tilt-trailer",
            "directional-drill-ramp-trailer",
            "pole-trailer",
            "reel-trailer",
          ].includes(t.slug),
        ),
      },
      {
        id: "Commercial",
        name: "Commercial",
        description: "Over-the-road freight and container trailers",
        trailers: trailers.filter((t) =>
          ["otr-step-deck-semi"].includes(t.slug),
        ),
      },
    ],
    [],
  );

  const filteredCategories = useMemo(
    () =>
      categories
        .map((category) => ({
          ...category,
          trailers: category.trailers.filter((trailer) => {
            const query = searchTerm.trim().toLowerCase();
            if (!query) return true;

            return (
              trailer.title.toLowerCase().includes(query) ||
              trailer.shortDescription.toLowerCase().includes(query) ||
              trailer.description.toLowerCase().includes(query)
            );
          }),
        }))
        .filter((category) => category.trailers.length > 0),
    [categories, searchTerm],
  );

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target.id) {
          setActiveCategory(visible.target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.35, 0.5, 0.65],
        rootMargin: "-20% 0px -55% 0px",
      },
    );

    categories.forEach((category) => {
      const element = sectionRefs.current[category.id];
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, [categories]);

  const scrollToCategory = (categoryId: string) => {
    const element = sectionRefs.current[categoryId];
    if (!element) return;

    element.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-background min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-6 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto max-w-6xl relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col gap-4"
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <h1 className="font-display text-5xl lg:text-7xl font-black text-foreground">
                Our Trailers
              </h1>

              <div className="relative w-full lg:w-[360px] lg:shrink-0">
                <Search
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                  size={18}
                />
                <input
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search trailers"
                  className="w-full h-12 rounded-full border border-border bg-background/90 pl-11 pr-4 text-sm text-foreground shadow-sm outline-none transition-colors focus:border-primary"
                />
              </div>
            </div>

            <p className="font-body text-base text-muted-foreground">
              Heavy-duty trailers for agriculture, construction, heavy haul,
              utility, and commercial work.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories and Trailers */}
      <section className="px-6 pb-12">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-8">
            <div className="space-y-12">
              {filteredCategories.map((category) => (
                <section
                  key={category.name}
                  id={category.id}
                  ref={(element) => {
                    sectionRefs.current[category.id] = element;
                  }}
                  className="scroll-mt-28"
                >
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="mb-8"
                  >
                    <h2 className="font-display text-3xl font-black text-[#bf1e2e] mb-2">
                      {category.name}
                    </h2>
                    <p className="font-body text-muted-foreground text-lg">
                      {category.description}
                    </p>
                  </motion.div>

                  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {category.trailers.map((trailer, idx) => (
                      <Link
                        key={trailer.slug}
                        to={`/trailers/${trailer.slug}`}
                        className="group block"
                        aria-label={`Open ${trailer.title}`}
                      >
                        <motion.article
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.6, delay: idx * 0.08 }}
                          className="bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                        >
                          <div className="relative overflow-hidden aspect-[4/3]">
                            {/** Keep paver tag image from trailerData; override others when custom folder images exist. */}
                            <img
                              src={
                                trailerImageOverrides[trailer.slug] ??
                                trailer.heroImage
                              }
                              alt={trailer.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          </div>

                          <div className="p-5">
                            <div className="mb-2 flex items-start justify-between gap-3">
                              <h3 className="font-display text-base font-bold text-foreground group-hover:text-primary transition-colors">
                                {trailer.title}
                              </h3>
                              <span className="mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground group-hover:border-primary/50 group-hover:text-primary transition-colors">
                                <ArrowUpRight size={14} />
                              </span>
                            </div>
                            <p className="font-body text-sm text-muted-foreground leading-relaxed line-clamp-2">
                              {trailer.shortDescription}
                            </p>
                          </div>
                        </motion.article>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      <aside className="hidden xl:block fixed right-3 top-1/2 -translate-y-1/2 z-40">
        <div className="flex flex-col items-end gap-5 px-3 py-4">
          {categories.map((category) => {
            const isActive = activeCategory === category.id;

            return (
              <button
                key={category.id}
                type="button"
                onClick={() => scrollToCategory(category.id)}
                className="group flex items-center justify-end gap-3"
                aria-label={`Scroll to ${category.name}`}
              >
                <span
                  className={`whitespace-nowrap text-xs font-medium tracking-wide transition-all duration-200 ${
                    isActive
                      ? "text-foreground opacity-100"
                      : "text-muted-foreground opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {category.name}
                </span>
                <span
                  className={`block h-[3px] w-12 rounded-full transition-all duration-300 ${
                    isActive
                      ? "bg-primary"
                      : "bg-border group-hover:bg-primary/70"
                  }`}
                />
              </button>
            );
          })}
        </div>
      </aside>

      {searchTerm.trim() && filteredCategories.length === 0 && (
        <div className="container mx-auto max-w-6xl px-6 pb-8">
          <p className="text-muted-foreground">
            No trailers match your search.
          </p>
        </div>
      )}

      <Footer />
    </div>
  );
}
