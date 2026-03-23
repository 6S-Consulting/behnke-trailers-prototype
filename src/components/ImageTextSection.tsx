import { motion } from "framer-motion";
import customBg from "@/assets/custom-bg.jpg";

const ImageTextSection = () => {
  return (
    <section className="relative py-32 px-6 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-primary/20 mix-blend-multiply z-10" />
        <img
          src={customBg}
          alt="Engineering Excellence"
          className="w-full h-full object-cover grayscale brightness-50"

          onError={(e) => {
             // Fallback if image doesn't load
             e.currentTarget.style.display = 'none';
             e.currentTarget.parentElement!.style.backgroundColor = '#1a202c'; 
          }}
        />
      </div>

      <div className="relative z-10 container mx-auto max-w-4xl text-center text-white">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl md:text-5xl font-display font-bold mb-6"
        >
          Engineered for the Toughest Loads
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto"
        >
          From concept to completion, our trailers are built to withstand the most demanding environments. Quality you can trust, durability that lasts.
        </motion.p>
      </div>
    </section>
  );
};

export default ImageTextSection;
