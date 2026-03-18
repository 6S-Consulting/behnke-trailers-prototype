import { motion } from "framer-motion";
import { Weight, Ruler, CircleDot, Wrench } from "lucide-react";

interface Product {
  model: string;
  gvwr: string;
  length: string;
  width: string;
  frame: string;
  axles: string;
  suspension: string;
  deck: string;
  features: string[];
}

const RecommendationSection = ({ products }: { products: Product[] }) => {
  if (products.length === 0) return null;

  return (
    <section id="recommendations" className="py-32 px-6">
      <div className="container mx-auto max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Recommended <span className="text-gradient">Trailers</span>
          </h2>
          <p className="font-body text-muted-foreground text-lg">
            {products.length} trailer{products.length !== 1 ? "s" : ""} match your requirements.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {products.map((product, i) => (
            <motion.div
              key={product.model}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              className="card-industrial p-8 group"
            >
              <div className="flex items-start justify-between mb-6">
                <h3 className="font-display text-2xl font-bold text-foreground leading-tight">
                  {product.model}
                </h3>
                <div className="px-3 py-1 bg-primary/10 text-primary text-xs font-display font-semibold rounded-sm">
                  {product.gvwr}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <Spec icon={<Ruler size={16} />} label="Deck Length" value={product.length} />
                <Spec icon={<Weight size={16} />} label="GVWR" value={product.gvwr} />
                <Spec icon={<CircleDot size={16} />} label="Axles" value={product.axles} />
                <Spec icon={<Wrench size={16} />} label="Frame" value={product.frame} />
              </div>

              <div className="border-t border-border pt-6">
                <p className="font-display text-xs uppercase tracking-widest text-muted-foreground mb-3">
                  Key Features
                </p>
                <ul className="space-y-2">
                  {product.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm font-body text-muted-foreground">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="mt-8 w-full py-3 bg-primary text-primary-foreground font-display text-sm font-semibold rounded-sm hover:brightness-110 transition-all duration-300"
              >
                View Trailer
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Spec = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) => (
  <div className="flex items-start gap-3">
    <div className="text-primary mt-0.5">{icon}</div>
    <div>
      <p className="font-body text-xs text-muted-foreground">{label}</p>
      <p className="font-body text-sm text-foreground font-medium">{value}</p>
    </div>
  </div>
);

export default RecommendationSection;
