import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface Trailer3DUnavailableProps {
  slug: string;
}

export function Trailer3DUnavailable({ slug }: Trailer3DUnavailableProps) {
  return (
    <div className="bg-background min-h-screen">
      <Header />

      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-card border border-border rounded-lg p-8 text-center"
          >
            <h1 className="font-display text-4xl font-black text-[#bf1e2e] mb-4">
              3D Model Coming Soon
            </h1>
            <p className="font-body text-lg text-muted-foreground mb-8">
              The 3D interactive model for this trailer is currently under development. 
              Please check back soon for an immersive viewing experience!
            </p>
            
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex gap-4 justify-center"
            >
              <Link
                to={`/trailers/${slug}`}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 font-display font-bold hover:brightness-110 transition-all rounded"
              >
                <ArrowLeft size={18} />
                Back to Details
              </Link>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-12 text-center"
          >
            <p className="font-body text-muted-foreground">
              In the meantime, explore the full specifications and features on the product details page.
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
