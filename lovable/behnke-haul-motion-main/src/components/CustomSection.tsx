import { motion } from "framer-motion";
import customBg from "@/assets/custom-bg.jpg";

const CustomSection = () => {
  return (
    <section className="relative py-40 px-6 overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={customBg}
          alt="Custom trailer workshop"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-background/80" />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl text-center">
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="font-display text-4xl md:text-6xl font-bold text-foreground mb-6"
        >
          Not every job fits a <span className="text-gradient">standard trailer.</span>
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="font-body text-lg md:text-xl text-muted-foreground mb-12 max-w-2xl mx-auto"
        >
          Our engineers build custom trailers for specialized equipment.
        </motion.p>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-8 py-4 bg-primary text-primary-foreground font-display text-base font-semibold rounded-sm hover:brightness-110 transition-all duration-300 glow-yellow"
        >
          Request a Custom Build
        </motion.button>
      </div>
    </section>
  );
};

export default CustomSection;
