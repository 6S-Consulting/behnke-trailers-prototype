import { Link } from "react-router-dom";
import { trailers } from "@/trailers/data/trailerData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export function TrailersPage() {
  // Group trailers by category for better organization
  const categories = [
    {
      name: "Agricultural",
      description: "Wagons, sprayers, tenders, and liquid transport",
      trailers: trailers.filter(
        (t) =>
          [
            "walking-tandem-gooseneck-wagon",
            "tandem-gooseneck-wagon",
            "sprayer-trailer-40k-50k",
          ].includes(t.slug)
      ),
    },
    {
      name: "Construction",
      description: "Deckovers, tilts, and utility trailers",
      trailers: trailers.filter(
        (t) =>
          [
            "directional-drill-tilt-trailer",
            "20k-hd-tube-tilt",
            "deckover-gooseneck",
            "low-pro-hd-dump",
          ].includes(t.slug)
      ),
    },
    {
      name: "Heavy Haul",
      description: "Tag trailers and specialized high-capacity equipment",
      trailers: trailers.filter(
        (t) =>
          [
            "paver-tag-trailer",
            "tag-trailer-60-ton",
          ].includes(t.slug)
      ),
    },
    {
      name: "Utility & Telecom",
      description: "Directional drill, pole, and reel trailers",
      trailers: trailers.filter(
        (t) =>
          [
            "directional-drill-ramp-trailer",
            "pole-trailer",
            "reel-trailer",
          ].includes(t.slug)
      ),
    },
    {
      name: "Commercial",
      description: "Over-the-road freight and container trailers",
      trailers: trailers.filter(
        (t) =>
          ["otr-step-deck-semi"].includes(t.slug)
      ),
    },
  ];

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
          >
            <h1 className="font-display text-5xl lg:text-7xl font-black text-foreground mb-6">
              Our Trailers
            </h1>
            <p className="font-body text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Behnke Enterprises offers heavy-equipment transport trailers across agricultural, construction, 
              heavy haul, utility, and commercial categories. Explore our complete lineup with detailed 
              specifications, gallery views, and options for customization.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories and Trailers */}
      {categories.map((category, categoryIdx) => (
        category.trailers.length > 0 && (
          <section key={category.name} className="py-12 px-6 bg-card/30">
            <div className="container mx-auto max-w-6xl">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                className="mb-10"
              >
                <h2 className="font-display text-4xl font-black text-[#bf1e2e] mb-2">
                  {category.name}
                </h2>
                <p className="font-body text-muted-foreground text-lg">
                  {category.description}
                </p>
              </motion.div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {category.trailers.map((trailer, idx) => (
                  <motion.article
                    key={trailer.slug}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: idx * 0.1 }}
                    className="group bg-background border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
                  >
                    <div className="relative overflow-hidden aspect-[4/3]">
                      <img
                        src={trailer.heroImage}
                        alt={trailer.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    <div className="p-6">
                      <h3 className="font-display text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {trailer.title}
                      </h3>
                      <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                        {trailer.shortDescription}
                      </p>

                      <Link
                        to={`/trailers/${trailer.slug}`}
                        className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-sm hover:brightness-110 transition-all duration-300 w-full"
                      >
                        View Details
                      </Link>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          </section>
        )
      ))}

      {/* All Trailers Grid (Alternative View) */}
      <section className="py-12 px-6">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <h2 className="font-display text-3xl font-bold text-foreground mb-2">
              Complete Trailer Lineup
            </h2>
            <p className="font-body text-muted-foreground">
              Browse all available trailers
            </p>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trailers.map((trailer, idx) => (
              <motion.article
                key={trailer.slug}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: (idx % 6) * 0.05 }}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-lg"
              >
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={trailer.heroImage}
                    alt={trailer.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>

                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-foreground mb-1 group-hover:text-primary transition-colors">
                    {trailer.title}
                  </h3>
                  <p className="font-body text-xs text-muted-foreground leading-relaxed mb-3 line-clamp-2">
                    {trailer.shortDescription}
                  </p>

                  <Link
                    to={`/trailers/${trailer.slug}`}
                    className="inline-flex items-center justify-center px-4 py-2 bg-primary text-primary-foreground font-display text-xs font-semibold rounded-sm hover:brightness-110 transition-all duration-300 w-full"
                  >
                    View Details
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
