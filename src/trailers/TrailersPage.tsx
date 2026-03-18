import { Link } from "react-router-dom";
import { trailers } from "@/trailers/trailerData";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export function TrailersPage() {
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
              Explore heavy-equipment transport trailers with detailed specifications, 
              gallery views, and 3D model options. Built for the toughest jobs.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Trailers Grid */}
      <section className="py-6 px-6">
        <div className="container mx-auto max-w-6xl">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {trailers.map((trailer, index) => (
              <motion.article
                key={trailer.slug}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-all duration-300 hover:shadow-xl"
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
                  <h2 className="font-display text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {trailer.title}
                  </h2>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-3">
                    {trailer.shortDescription}
                  </p>
                  
                  <Link
                    to={`/trailers/${trailer.slug}`}
                    className="inline-flex items-center justify-center px-5 py-2.5 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-sm hover:brightness-110 transition-all duration-300"
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
